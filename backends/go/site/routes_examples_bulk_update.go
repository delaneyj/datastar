package site

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	datastar "github.com/delaneyj/datastar/backends/go"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
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

func setupExamplesBulkUpdate(examplesRouter chi.Router) error {
	contactToNode := func(i int, cs *ContactActive, wasChanged bool) ElementRenderer {
		key := fmt.Sprintf("contact_%d", i)
		return TR().
			ID(key).
			IfCLASS(i%2 == 0, "bg-accent-800").
			IfCLASS(i%2 == 1, "bg-accent-700").
			IfCLASS(wasChanged && cs.IsActive, "activate").
			IfCLASS(wasChanged && !cs.IsActive, "deactivate").
			Children(
				TD(
					INPUT().CLASS("checkbox").TYPE("checkbox").DATASTAR_MODEL("selections."+key),
					TD(Text(cs.Name)),
					TD(Text(cs.Email)),
					TD(Tern(cs.IsActive, Text("Active"), Text("Inactive"))),
				),
			)
	}

	contacts := starterActiveContacts()

	type SelectionStore struct {
		Selections map[string]bool `json:"selections"`
	}

	defaultSelectionStore := func() SelectionStore {
		selections := map[string]bool{
			"all": false,
		}
		for i := range contacts {
			key := fmt.Sprintf("contact_%d", i)
			selections[key] = false
		}
		return SelectionStore{
			Selections: selections,
		}
	}

	activateButtonCSS := "flex gap-2 items-center px-4 py-2 bg-success-500 hover:bg-success-600 text-success-100 font-bold rounded-lg"
	deactivateButtonCSS := "flex gap-2 items-center px-4 py-2 bg-error-500 hover:bg-error-600 text-error-100 font-bold rounded-lg"

	contactsToNode := func(selectionStore SelectionStore, contacts []*ContactActive) ElementRenderer {
		return DIV().
			ID("bulk_update").
			DATASTAR_MERGE_STORE(selectionStore).
			CLASS("flex flex-col gap-2").
			Children(
				TABLE().
					Children(
						CAPTION().CLASS("text-sm text-accent-300").Text("Select Rows And Activate Or Deactivate Below"),
						THEAD(
							TR(
								TH(
									INPUT().
										CLASS("checkbox").
										TYPE("checkbox").
										DATASTAR_MODEL("selections.all").
										DATASTAR_ON("change", "$$setAll('contact_', $selections.all)"),
								),
								TH(Text("Name")),
								TH(Text("Email")),
								TH(Text("Status")),
							),
						),
						TBODY(
							RangeI(contacts, func(i int, cs *ContactActive) ElementRenderer {
								return contactToNode(i, cs, false)
							}),
						),
					),
				DIV().
					CLASS("flex gap-2").
					Children(
						BUTTON(
							material_symbols.AccountCircle(),
							Text("Activate"),
						).
							DATASTAR_ON("click", "$$put('/examples/bulk_update/data/activate'); $all = false; $$setAll('contact_', $selections.all)").
							CLASS(activateButtonCSS),
						BUTTON(
							material_symbols.AccountCircleOff(),
							Text("Deactivate"),
						).
							DATASTAR_ON("click", "$$put('/examples/bulk_update/data/deactivate'); $all = false; $$setAll('contact_', $selections.all)").
							CLASS(deactivateButtonCSS),
					),
				SignalStore,
			)
	}

	examplesRouter.Route("/bulk_update/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragmentSelf(sse, contactsToNode(defaultSelectionStore(), contacts))
		})

		setActivation := func(w http.ResponseWriter, r *http.Request, isActive bool) {
			sse := toolbelt.NewSSE(w, r)
			store := &SelectionStore{}
			datastar.BodyUnmarshal(r, store)

			for key, wasSelected := range store.Selections {
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
						// datastar.WithSettleDuration(5*time.Second),
					)
				}
			}

			for k := range store.Selections {
				store.Selections[k] = false
			}
			datastar.RenderFragment(
				sse,
				DIV().DATASTAR_MERGE_STORE(store),
				// datastar.WithQuerySelector("#bulk_update"),
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

	return nil
}
