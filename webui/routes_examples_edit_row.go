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

func setupExamplesEditRow(ctx context.Context, editRowRouter chi.Router) error {

	editRowRouter.Route("/edit_row", func(editRowRouter chi.Router) {

		editRowRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

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
							CLASS("input input-bordered").
							DATASTAR_MODEL("name"),
						DIV().Text(contact.Name),
					)),
					TD(Tern(
						isEditingRow,
						INPUT().
							TYPE("text").
							CLASS("input input-bordered").
							DATASTAR_MODEL("email"),
						DIV().Text(contact.Email),
					)),
					TD().
						CLASS("flex justify-end").
						Children(
							Tern(
								isEditingRow,
								DIV().
									CLASS("join").
									Children(
										BUTTON().
											CLASS("btn btn-outline btn-warning join-item").
											DATASTAR_FETCH_URL("'/examples/edit_row/data'").
											DATASTAR_ON("click", datastar.GET_ACTION).
											Children(
												material_symbols.Cancel(),
												Text("Cancel"),
											),
										BUTTON().
											CLASS("btn btn-success join-item").
											DATASTAR_FETCH_URL(fmt.Sprintf("'/examples/edit_row/edit/%d'", i)).
											DATASTAR_ON("click", datastar.PATCH_ACTION).
											Children(
												material_symbols.Save(),
												Text("Save"),
											),
									),
								If(
									isEditingAnyRow,
									BUTTON().
										CLASS("btn btn-info btn-sm").
										DATASTAR_FETCH_URL(fmt.Sprintf("'/examples/edit_row/edit/%d'", i)).
										DATASTAR_ON("click", datastar.GET_ACTION).
										Children(
											material_symbols.Edit(),
											Text("Edit"),
										),
								),
							),
						),
				)

		}

		contactsToNode := func(store *Store) ElementRenderer {
			return DIV().
				ID("edit_row").
				CLASS("flex flex-col").
				DATASTAR_MERGE_STORE(store).
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
										return contactNode(i, i == store.EditRowIndex, store.EditRowIndex != -1)
									}),
								),
						),
					BUTTON().
						CLASS("btn btn-warning").
						DATASTAR_FETCH_URL("'/examples/edit_row/reset'").
						DATASTAR_ON("click", datastar.GET_ACTION).
						Children(
							material_symbols.Refresh(),
							Text("Reset"),
						),
				)
		}

		emptyStore := &Store{EditRowIndex: -1}

		editRowRouter.Get("/reset", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			contacts = starterEditContacts()
			datastar.RenderFragment(sse, contactsToNode(emptyStore))
		})

		editRowRouter.Route("/data", func(dataRouter chi.Router) {
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

		editRowRouter.Route("/edit/{index}", func(editRouter chi.Router) {
			editRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				indexStr := chi.URLParam(r, "index")
				i, err := strconv.Atoi(indexStr)
				if err != nil {
					http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
					return
				}

				c := contacts[i]
				store := &Store{EditRowIndex: i, Name: c.Name, Email: c.Email}

				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, contactsToNode(store))
			})

			editRouter.Patch("/", func(w http.ResponseWriter, r *http.Request) {
				store := &Store{}
				if err := datastar.BodyUnmarshal(r, &store); err != nil {
					http.Error(w, fmt.Sprintf("error unmarshalling store : %s", err), http.StatusBadRequest)
					return
				}

				indexStr := chi.URLParam(r, "index")
				i, err := strconv.Atoi(indexStr)
				if err != nil {
					http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
					return
				}

				c := contacts[i]
				c.Name = store.Name
				c.Email = store.Email

				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, contactsToNode(emptyStore))
			})
		})
	})

	return nil
}
