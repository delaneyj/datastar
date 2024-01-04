package webui

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDeleteRow(ctx context.Context, deleteRowRouter chi.Router) error {
	deleteRowRouter.Route("/delete_row", func(deleteRowRouter chi.Router) {

		deleteRowRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		contacts := starterActiveContacts()

		contactNode := func(i int, cs *ContactActive) ElementRenderer {
			return TR().
				ID(fmt.Sprintf("contact_%d", i)).
				Children(
					TD(Text(cs.Name)),
					TD(Text(cs.Email)),
					TD(Tern(cs.IsActive, Text("Active"), Text("Inactive"))),
					TD().
						CLASS("flex justify-end").
						Children(
							BUTTON().
								CLASS("btn btn-error").
								DATASTAR_FETCH_URL(fmt.Sprintf("'/examples/delete_row/data/%d'", i)).
								DATASTAR_ON("click", `confirm('Are you sure?') && $$delete`).
								Children(
									material_symbols.Delete(),
									Text("Delete"),
								),
						),
				)
		}

		contactsToNode := func() ElementRenderer {
			return DIV().
				ID("contacts").
				CLASS("flex flex-col gap-8").
				Children(
					TABLE().
						CLASS("table w-full").
						Children(
							CAPTION(Text("Contacts")),
							THEAD(
								TR(
									TH(Text("Name")),
									TH(Text("Email")),
									TH(Text("Status")),
									TH(Text("Actions")).CLASS("text-right")),
							),
							TBODY(
								RangeI(contacts, contactNode),
							),
						),
					BUTTON().
						CLASS("btn btn-warning").
						DATASTAR_FETCH_URL("'/examples/delete_row/data/reset'").
						DATASTAR_ON("click", datastar.GET_ACTION).
						Children(
							material_symbols.Refresh(),
							Text("Reset"),
						),
				)
		}

		deleteRowRouter.Route("/data", func(dataRouter chi.Router) {
			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragmentSelf(sse, contactsToNode())
			})

			dataRouter.Get("/reset", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				contacts = starterActiveContacts()
				datastar.RenderFragment(sse, contactsToNode())
			})

			dataRouter.Delete("/{index}", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				indexStr := chi.URLParam(r, "index")
				index, err := strconv.Atoi(indexStr)
				if err != nil {
					http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
					return
				}

				contacts = append(contacts[:index], contacts[index+1:]...)
				datastar.Delete(sse, "#contact_"+indexStr)
			})
		})

	})

	return nil
}
