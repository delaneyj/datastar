package site

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupExamplesDeleteRow(examplesRouter chi.Router) error {

	contacts := starterActiveContacts()

	contactNode := func(i int, cs *ContactActive) ElementRenderer {
		return TR().
			ID(fmt.Sprintf("contact_%d", cs.ID)).
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
								datastar.DELETE("/examples/delete_row/data/%d", cs.ID),
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
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentSelf(sse, contactsToNode())
		})

		dataRouter.Get("/reset", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			contacts = starterActiveContacts()
			datastar.RenderFragment(sse, contactsToNode())
		})

		dataRouter.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			idStr := chi.URLParam(r, "id")
			id, err := strconv.Atoi(idStr)
			if err != nil {
				http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
				return
			}

			contacts = lo.Filter(contacts, func(cs *ContactActive, i int) bool {
				return cs.ID != id
			})
			datastar.Delete(sse, "#contact_"+idStr)
		})
	})

	return nil
}
