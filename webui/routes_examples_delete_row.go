package webui

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDeleteRow(ctx context.Context, deleteRowRouter chi.Router) error {
	deleteRowRouter.Route("/delete_row", func(deleteRowRouter chi.Router) {

		deleteRowRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		contacts := starterActiveContacts()

		contactNode := func(i int, cs *ContactActive) NODE {
			return TR(
				ID(fmt.Sprintf("contact_%d", i)),
				TD(TXT(cs.Name)),
				TD(TXT(cs.Email)),
				TD(TERNCached(
					cs.IsActive,
					TXT("Active"),
					TXT("Inactive"),
				)),
				TD(
					CLS("flex justify-end"),
					BUTTON(
						CLS("btn btn-error"),
						datastar.FetchURL(fmt.Sprintf("'/examples/delete_row/data/%d'", i)),
						datastar.On("click", `confirm('Are you sure?') && $$delete`),
						material_symbols.Delete(),
						TXT("Delete"),
					),
				),
			)
		}

		contactsToNode := func() NODE {
			return DIV(
				ID("contacts"),
				CLS("flex flex-col gap-8"),
				TABLE(
					CLS("table w-full"),
					CAPTION(TXT("Contacts")),
					THEAD(
						TR(
							TH(TXT("Name")),
							TH(TXT("Email")),
							TH(TXT("Status")),
							TH(TXT("Actions"), CLS("text-right")),
						),
					),
					TBODY(
						RANGEI(contacts, contactNode),
					),
				),
				BUTTON(
					CLS("btn btn-warning"),
					datastar.FetchURL("'/examples/delete_row/data/reset'"),
					datastar.On("click", datastar.GET_ACTION),
					material_symbols.Refresh(),
					TXT("Reset"),
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
