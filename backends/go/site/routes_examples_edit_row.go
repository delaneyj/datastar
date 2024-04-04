package site

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

type ContactEdit struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func starterEditContacts() []*ContactEdit {
	return []*ContactEdit{
		{
			Name:  "Joe Smith",
			Email: "joe@smith.org",
		},
		{
			Name:  "Angie MacDowell",
			Email: "angie@macdowell.org",
		},
		{
			Name:  "Fuqua Tarkenton",
			Email: "fuqua@tarkenton.org",
		},
		{
			Name:  "Kim Yee",
			Email: "kim@yee.org",
		},
	}
}

func setupExamplesEditRow(examplesRouter chi.Router) error {
	contacts := starterEditContacts()

	type Store struct {
		EditRowIndex int    `json:"editRowIndex"`
		Name         string `json:"name"`
		Email        string `json:"email"`
	}

	contactNode := func(i int, isEditingRow, isEditingAnyRow bool) ElementRenderer {
		contact := contacts[i]
		contactKeyPrefix := fmt.Sprintf("contact_%d", i)
		return TR().
			ID(contactKeyPrefix).
			Children(
				TD(Tern(
					isEditingRow,
					INPUT().
						TYPE("text").
						CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5").
						DATASTAR_MODEL("name"),
					DIV().Text(contact.Name),
				)),
				TD(Tern(
					isEditingRow,
					INPUT().
						TYPE("text").
						CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5").
						DATASTAR_MODEL("email"),
					DIV().Text(contact.Email),
				)),
				TD().
					CLASS("flex justify-end").
					Children(
						DynTern(
							isEditingAnyRow,
							func() ElementRenderer {
								return DIV().
									CLASS("flex gap-2").
									Children(
										BUTTON().
											CLASS("flex items-center gap-1 px-2 py-1 rounded-sm text-xs bg-primary-600 hover:bg-primary-500").
											DATASTAR_ON("click", datastar.GET("/examples/edit_row/data")).
											Children(
												material_symbols.Cancel(),
												Text("Cancel"),
											),
										BUTTON().
											CLASS("flex items-center gap-1 px-2 py-1 rounded-sm text-xs bg-success-600 hover:bg-success-500").
											DATASTAR_ON("click", datastar.PATCH("/examples/edit_row/edit")).
											Children(
												material_symbols.Save(),
												Text("Save"),
											),
									)
							},
							func() ElementRenderer {
								return BUTTON().
									CLASS("flex items-center gap-1 px-2 py-1 rounded-sm text-xs bg-accent-600 hover:bg-accent-500").
									DATASTAR_ON("click", fmt.Sprintf(
										"$editRowIndex = %d; %s", i,
										datastar.GET("/examples/edit_row/edit"),
									)).
									Children(
										material_symbols.Edit(),
										Text("Edit"),
									)
							},
						),
					),
			)

	}

	contactsToNode := func(store *Store) ElementRenderer {
		return DIV().
			ID("edit_row").
			CLASS("flex flex-col").
			DATASTAR_STORE(store).
			Children(
				TABLE().
					CLASS("table w-full").
					Children(
						CAPTION(Text("Contacts")),
						THEAD(
							TR(
								TH(Text("Name")),
								TH(Text("Email")),
								TH(Text("Actions")).CLASS("text-right"),
							),
						),
						TBODY().
							ID("edit_row_table_body").
							Children(
								RangeI(contacts, func(i int, cs *ContactEdit) ElementRenderer {
									log.Print(cs)
									return contactNode(i, i == store.EditRowIndex, store.EditRowIndex != -1)
								}),
							),
					),
				DIV(
					BUTTON().
						CLASS("flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500").
						DATASTAR_ON("click", datastar.GET("/examples/edit_row/reset")).
						Children(
							material_symbols.Refresh(),
							Text("Reset"),
						),
				),
			)
	}

	emptyStore := &Store{EditRowIndex: -1}

	examplesRouter.Get("/edit_row/reset", func(w http.ResponseWriter, r *http.Request) {
		sse := toolbelt.NewSSE(w, r)
		contacts = starterEditContacts()
		datastar.RenderFragment(sse, contactsToNode(emptyStore))
	})

	examplesRouter.Route("/edit_row/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {

			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(sse, contactsToNode(emptyStore))
		})

		dataRouter.Get("/{index}", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			indexStr := chi.URLParam(r, "index")
			i, err := strconv.Atoi(indexStr)
			if err != nil {
				http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
				return
			}
			store := &Store{EditRowIndex: i, Name: contacts[i].Name, Email: contacts[i].Email}

			datastar.RenderFragment(sse, contactsToNode(store))
		})
	})

	examplesRouter.Route("/edit_row/edit", func(editRouter chi.Router) {
		editRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.QueryStringUnmarshal(r, &store); err != nil {
				http.Error(w, fmt.Sprintf("error unmarshalling contact : %s", err), http.StatusBadRequest)
			}

			if store.EditRowIndex < 0 || store.EditRowIndex >= len(contacts) {
				http.Error(w, fmt.Sprintf("invalid index: %d", store.EditRowIndex), http.StatusBadRequest)
				return
			}

			i := store.EditRowIndex
			c := contacts[i]
			store = &Store{EditRowIndex: i, Name: c.Name, Email: c.Email}

			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(sse, contactsToNode(store))
		})

		editRouter.Patch("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.BodyUnmarshal(r, &store); err != nil {
				http.Error(w, fmt.Sprintf("error unmarshalling store : %s", err), http.StatusBadRequest)
				return
			}

			if store.EditRowIndex < 0 || store.EditRowIndex >= len(contacts) {
				http.Error(w, fmt.Sprintf("invalid index: %d", store.EditRowIndex), http.StatusBadRequest)
				return
			}
			i := store.EditRowIndex
			c := contacts[i]
			c.Name = store.Name
			c.Email = store.Email

			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(sse, contactsToNode(emptyStore))
		})
	})

	return nil
}
