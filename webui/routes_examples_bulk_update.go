package webui

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

type ContactActive struct {
	IsActive bool   `json:"isActive"`
	Name     string `json:"name"`
	Email    string `json:"email"`
}

func starterActiveContacts() []*ContactActive {
	return []*ContactActive{
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
}

func setupExamplesBulkUpdate(ctx context.Context, examplesRouter chi.Router) error {
	contactToNode := func(i int, cs *ContactActive, wasChanged bool) NODE {
		key := fmt.Sprintf("contact_%d", i)
		return TR(
			ID(key),
			CLSS{
				"activate":   wasChanged && cs.IsActive,
				"deactivate": wasChanged && !cs.IsActive,
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
	}

	contacts := starterActiveContacts()

	store := map[string]bool{
		"all": false,
	}
	for i := range contacts {
		key := fmt.Sprintf("contact_%d", i)
		store[key] = false
	}

	contactsToNode := func(contacts []*ContactActive) NODE {
		return DIV(
			ID("bulk_update"),
			datastar.MergeStore(store),
			CLS("flex flex-col gap-2"),
			TABLE(
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
					RANGEI(contacts, func(i int, cs *ContactActive) NODE {
						return contactToNode(i, cs, false)
					}),
				),
			),
			DIV(
				CLS("join"),
				BUTTON(
					datastar.On("click", "$$put; $all = false; $$setAll('contact_', $all)"),
					datastar.FetchURL("'/examples/bulk_update/data/activate'"),
					CLS("btn btn-success join-item"),
					material_symbols.AccountCircle(),
					TXT("Activate"),
				),
				BUTTON(
					datastar.On("click", "$$put; $all = false; $$setAll('contact_', $all)"),
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
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragmentSelf(sse, contactsToNode(contacts))
			})

			setActivation := func(w http.ResponseWriter, r *http.Request, isActive bool) {
				sse := toolbelt.NewSSE(w, r)
				datastar.BodyUnmarshal(r, &store)

				for key, wasSelected := range store {
					const prefix = "contact_"
					if strings.HasPrefix(key, prefix) {
						idStr := strings.TrimPrefix(key, prefix)
						i, err := strconv.Atoi(idStr)
						if err != nil {
							http.Error(w, err.Error(), http.StatusBadRequest)
							return
						}

						c := contacts[i]
						wasChanged := c.IsActive != isActive
						if wasSelected {
							if wasChanged {
								c.IsActive = isActive
							}
						}

						datastar.RenderFragment(
							sse,
							contactToNode(i, c, wasChanged && wasSelected),
						)
					}
				}

				for k := range store {
					store[k] = false
				}
				datastar.RenderFragment(
					sse,
					DIV(datastar.MergeStore(store)),
					datastar.WithQuerySelector("#bulk_update"),
					datastar.WithMergeType(datastar.FragmentMergeUpsertAttributes),
				)
			}

			dataRouter.Put("/activate", func(w http.ResponseWriter, r *http.Request) {
				setActivation(w, r, true)
			})

			dataRouter.Put("/deactivate", func(w http.ResponseWriter, r *http.Request) {
				setActivation(w, r, false)
			})
		})
	})

	return nil
}
