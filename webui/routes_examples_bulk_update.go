package webui

import (
	"context"
	"fmt"
	"net/http"

	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/delaneyj/toolbelt/gomps/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesBulkUpdate(ctx context.Context, examplesRouter chi.Router) error {

	// tsBytes, err := staticFS.ReadFile("static/examples/click_to_edit.txt")
	// if err != nil {
	// 	return fmt.Errorf("error reading examples dir: %w", err)
	// }

	type ContactStatus struct {
		IsActive bool   `json:"isActive"`
		Name     string `json:"name"`
		Email    string `json:"email"`
	}

	contacts := []*ContactStatus{
		{
			Name:     "Joe Smith",
			Email:    "joe@smith.org",
			IsActive: true,
		},
		{
			Name:     "Angie MacDowell",
			Email:    "angie@macdowell.org",
			IsActive: true,
		},
		{
			Name:     "Fuqua Tarkenton",
			Email:    "fuqua@tarkenton.org",
			IsActive: true,
		},
		{
			Name:     "Kim Yee",
			Email:    "kim@yee.org",
			IsActive: false,
		},
	}

	contactsToNode := func(contacts []*ContactStatus) NODE {
		store := map[string]bool{
			"all": false,
		}
		for i := range contacts {
			key := fmt.Sprintf("contact_%d", i)
			store[key] = false
		}

		return DIV(
			ID("bulk_update"),
			CLS("flex flex-col gap-2"),
			TABLE(
				datastar.MergeStore(store),
				CLS("table table-striped"),
				CAPTION(TXT("Select Rows And Activate Or Deactivate Below")),
				THEAD(
					TR(
						TH(
							INPUT(
								CLS("checkbox"),
								TYPE("checkbox"),
								datastar.Model("all"),
								datastar.On("change", "$$setAll('contact_', $all)"),
							),
						),
						TH(TXT("Name")),
						TH(TXT("Email")),
						TH(TXT("Status")),
					),
				),
				TBODY(
					RANGEI(contacts, func(i int, cs *ContactStatus) NODE {
						key := fmt.Sprintf("contact_%d", i)
						return TR(
							CLSS{
								"activate":   cs.IsActive,
								"deactivate": !cs.IsActive,
							},
							TD(
								INPUT(
									CLS("checkbox"),
									TYPE("checkbox"),
									datastar.Model(key),
								),
							),
							TD(TXT(cs.Name)),
							TD(TXT(cs.Email)),
							TD(TERNCached(
								cs.IsActive,
								TXT("Active"),
								TXT("Inactive"),
							)),
						)
					}),
				),
			),
			DIV(
				CLS("join"),
				BUTTON(
					datastar.On("click", "$$put; $all = false"),
					datastar.FetchURL("'/examples/bulk_update/data/activate'"),
					CLS("btn btn-success join-item"),
					material_symbols.AccountCircle(),
					TXT("Activate"),
				),
				BUTTON(
					datastar.On("click", "$$put; $all = false"),
					datastar.FetchURL("'/examples/bulk_update/data/deactivate'"),
					CLS("btn btn-warning join-item"),
					material_symbols.AccountCircleOff(),
					TXT("Deactivate"),
				),
			),
		)

	}

	examplesRouter.Route("/bulk_update", func(bulkUpdateRouter chi.Router) {

		bulkUpdateRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		bulkUpdateRouter.Route("/data", func(dataRouter chi.Router) {
			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {

				Render(w, contactsToNode(contacts))
			})

			setActivation := func(w http.ResponseWriter, r *http.Request, isActive bool) {
				store := map[string]bool{}
				datastar.BodyUnmarshal(r, &store)

				for i := range contacts {
					key := fmt.Sprintf("contact_%d", i)
					if store[key] {
						contacts[i].IsActive = isActive
					}
				}
			}

			dataRouter.Put("/activate", func(w http.ResponseWriter, r *http.Request) {
				setActivation(w, r, true)
				Render(w, contactsToNode(contacts))
			})

			dataRouter.Put("/deactivate", func(w http.ResponseWriter, r *http.Request) {
				setActivation(w, r, false)
				Render(w, contactsToNode(contacts))
			})
		})
	})

	return nil
}
