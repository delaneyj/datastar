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
	Name      string `json:"name"`
	Email     string `json:"email"`
	IsEditing bool   `json:"isEditing"`
}

func starterEditContacts() []*ContactEdit {
	return []*ContactEdit{
		{
			Name:      "Joe Smith",
			Email:     "joe@smith.org",
			IsEditing: false,
		},
		{
			Name:      "Angie MacDowell",
			Email:     "angie@macdowell.org",
			IsEditing: false,
		},
		{
			Name:      "Fuqua Tarkenton",
			Email:     "fuqua@tarkenton.org",
			IsEditing: false,
		},
		{
			Name:      "Kim Yee",
			Email:     "kim@yee.org",
			IsEditing: false,
		},
	}
}

func setupExamplesEditRow(ctx context.Context, editRowRouter chi.Router) error {

	editRowRouter.Route("/edit_row", func(editRowRouter chi.Router) {

		editRowRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		contacts := starterEditContacts()

		contactNode := func(i int) NODE {
			cs := contacts[i]
			contactKeyPrefix := fmt.Sprintf("contact_%d", i)
			name := contactKeyPrefix + "_name"
			nameSignal := "$" + name
			email := contactKeyPrefix + "_email"
			emailSignal := "$" + email
			return TR(
				datastar.MergeStore(map[string]any{
					name:  cs.Name,
					email: cs.Email,
				}),
				ID(contactKeyPrefix),
				TD(
					TERNCached(
						cs.IsEditing,
						INPUT(
							CLS("input input-bordered"),
							TYPE("text"),
							datastar.Model(name),
						),
						DIV(datastar.Text(nameSignal)),
					),
				),
				TD(
					TERNCached(
						cs.IsEditing,
						INPUT(
							TYPE("text"),
							CLS("input input-bordered"),
							datastar.Model(email),
						),
						DIV(datastar.Text(emailSignal)),
					),
				),
				TD(
					CLS("flex justify-end"),
					TERNCached(
						cs.IsEditing,
						DIV(
							CLS("join"),
							BUTTON(
								CLS("btn btn-outline btn-warning join-item"),
								datastar.FetchURLF("'/examples/edit_row/data/%d'", i),
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
						BUTTON(
							CLS("btn btn-info"),
							datastar.FetchURLF("'/examples/edit_row/edit/%d'", i),
							datastar.On("click", datastar.GET_ACTION),
							material_symbols.Edit(),
							TXT("Edit"),
						),
					),
				),
			)
		}

		contactsToNode := func() NODE {
			return DIV(
				ID("contacts"),
				CLS("flex flex-col"),
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
							return contactNode(i)
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

		editRowRouter.Get("/reset", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			contacts = starterEditContacts()
			datastar.RenderFragment(sse, contactsToNode())
		})

		editRowRouter.Route("/data", func(dataRouter chi.Router) {
			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, contactsToNode())
			})

			dataRouter.Get("/{index}", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				indexStr := chi.URLParam(r, "index")
				i, err := strconv.Atoi(indexStr)
				if err != nil {
					http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
					return
				}
				contacts[i].IsEditing = false
				datastar.RenderFragment(sse, contactNode(i))
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
				c.IsEditing = true

				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, contactNode(i))
			})

			editRouter.Patch("/", func(w http.ResponseWriter, r *http.Request) {
				store := map[string]string{}
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

				prefix := fmt.Sprintf("contact_%d", i)

				c := contacts[i]
				c.Name = store[prefix+"_name"]
				c.Email = store[prefix+"_email"]
				c.IsEditing = false

				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, contactNode(i))
			})
		})
	})

	return nil
}
