package webui

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
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

		contactNode := func(i int, isEditingRow, isEditingAnyRow bool) NODE {
			contact := contacts[i]
			contactKeyPrefix := fmt.Sprintf("contact_%d", i)
			return TR(
				ID(contactKeyPrefix),
				TD(
					TERNCached(
						isEditingRow,
						INPUT(
							CLS("input input-bordered"),
							TYPE("text"),
							datastar.Model("name"),
						),
						DIV(TXT(contact.Name)),
					),
				),
				TD(
					TERNCached(
						isEditingRow,
						INPUT(
							TYPE("text"),
							CLS("input input-bordered"),
							datastar.Model("email"),
						),
						DIV(TXT(contact.Email)),
					),
				),
				TD(
					CLS("flex justify-end"),
					TERNCached(
						isEditingRow,
						DIV(
							CLS("join"),
							BUTTON(
								CLS("btn btn-outline btn-warning join-item"),
								datastar.FetchURLF("'/examples/edit_row/data'"),
								datastar.On("click", datastar.GET_ACTION),
								material_symbols.Cancel(),
								TXT("Cancel"),
							),
							BUTTON(
								CLS("btn btn-success join-item"),
								datastar.FetchURLF("'/examples/edit_row/edit/%d'", i),
								datastar.On("click", datastar.PATCH_ACTION),
								material_symbols.Save(),
								TXT("Save"),
							),
						),
						IFCachedNode(
							!isEditingAnyRow,
							BUTTON(
								CLS("btn btn-info btn-sm"),
								datastar.FetchURLF("'/examples/edit_row/edit/%d'", i),
								datastar.On("click", datastar.GET_ACTION),
								material_symbols.Edit(),
								TXT("Edit"),
							),
						),
					),
				),
			)
		}

		contactsToNode := func(store *Store) NODE {
			return DIV(
				ID("edit_row"),
				CLS("flex flex-col"),
				datastar.MergeStore(store),
				TABLE(
					CLS("table w-full"),
					CAPTION(TXT("Contacts")),
					THEAD(
						TR(
							TH(TXT("Name")),
							TH(TXT("Email")),
							TH(TXT("Actions"), CLS("text-right")),
						),
					),
					TBODY(
						RANGEI(contacts, func(i int, cs *ContactEdit) NODE {
							return contactNode(i, i == store.EditRowIndex, store.EditRowIndex != -1)
						}),
					),
				),
				BUTTON(
					CLS("btn btn-warning"),
					datastar.FetchURL("'/examples/edit_row/reset'"),
					datastar.On("click", datastar.GET_ACTION),
					material_symbols.Refresh(),
					TXT("Reset"),
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
