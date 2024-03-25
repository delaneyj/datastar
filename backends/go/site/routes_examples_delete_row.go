package site

import (
	"fmt"
	"net/http"
	"strconv"

	datastar "github.com/delaneyj/datastar/backends/go"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDeleteRow(examplesRouter chi.Router) error {

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
							CLASS("flex gap-2 items-center px-4 py-2 bg-error-600 hover:bg-error-500 rounded-lg").
							DATASTAR_ON("click", fmt.Sprintf(
								`confirm('Are you sure?') && %s`,
								datastar.DELETE("/examples/delete_row/data/%d", i),
							)).
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
				DIV(
					BUTTON().
						CLASS("flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-400 hover:bg-primary-500").
						DATASTAR_ON("click", datastar.GET("/examples/delete_row/data/reset")).
						Children(
							material_symbols.Refresh(),
							Text("Reset"),
						),
				),
			)
	}

	examplesRouter.Route("/delete_row/data", func(dataRouter chi.Router) {
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

	return nil
}
