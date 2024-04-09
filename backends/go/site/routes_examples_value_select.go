package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupExamplesValueSelect(examplesRouter chi.Router) error {

	// lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	type Model struct {
		ID    string `json:"id"`
		Label string `json:"label"`
	}

	type Make struct {
		ID     string   `json:"id"`
		Label  string   `json:"label"`
		Models []*Model `json:"models"`
	}

	cars := []*Make{
		{
			ID:    toolbelt.NextEncodedID(),
			Label: "Audi",
			Models: []*Model{
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "A1",
				},
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "A3",
				},
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "A6",
				},
			},
		},
		{
			ID:    toolbelt.NextEncodedID(),
			Label: "Toyota",
			Models: []*Model{
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "Land Cruiser",
				},
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "Corolla",
				},
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "Camry",
				},
			},
		},
		{
			ID:    toolbelt.NextEncodedID(),
			Label: "Ford",
			Models: []*Model{
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "F-150",
				},
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "Mustang",
				},
				{
					ID:    toolbelt.NextEncodedID(),
					Label: "Focus",
				},
			},
		},
	}

	type Store struct {
		Make  string `json:"make"`
		Model string `json:"model"`
	}

	storeValidation := func(store *Store) (make *Make, model *Model, isValid bool) {
		if store.Make != "" {
			for _, possibleMake := range cars {
				if possibleMake.ID == store.Make {
					make = possibleMake

					if store.Model != "" {
						for _, possibleModel := range make.Models {
							if possibleModel.ID == store.Model {
								model = possibleModel
								isValid = true
							}
						}
					}
					break
				}
			}
		}

		return make, model, isValid
	}

	examplesRouter.Route("/value_select/data", func(dataRouter chi.Router) {

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.QueryStringUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			make, model, isValid := storeValidation(store)

			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				DIV().
					ID("value_select").
					DATASTAR_STORE(store).
					CLASS("flex flex-col gap-2").
					Children(
						DIV().
							CLASS("text-2xl font-bold").
							Text("Pick a Make / Model"),
						SELECT().
							CLASS("bg-accent-800 border border-accent-600 text-accent-200 text-sm rounded-lg focus:ring-accent-400 focus:border-accent-400 block w-full p-2.5").
							DATASTAR_MODEL("make").
							DATASTAR_ON("change", datastar.GET("/examples/value_select/data")).
							Children(
								OPTION().
									DISABLED().
									SELECTED().
									Text("Select a Make").
									VALUE(""),
								Group(Range(cars, func(item *Make) ElementRenderer {
									return OPTION().
										VALUE(item.ID).
										Text(item.Label)
								})),
							),
						DynIf(
							make != nil,
							func() ElementRenderer {
								return SELECT().
									CLASS("bg-accent-800 border border-accent-600 text-accent-200 text-sm rounded-lg focus:ring-accent-400 focus:border-accent-400 block w-full p-2.5").
									DATASTAR_MODEL("model").
									DATASTAR_ON("change", datastar.GET("/examples/value_select/data")).
									Children(
										OPTION().
											DISABLED().
											SELECTED().
											Text("Select a Model").
											VALUE(""),
										Group(Range(make.Models, func(item *Model) ElementRenderer {
											return OPTION().
												VALUE(item.ID).
												Text(item.Label)
										})),
									)
							},
						),
						DynIf(
							isValid,
							func() ElementRenderer {
								return BUTTON().
									CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600").
									DATASTAR_ON("click", datastar.POST("/examples/value_select/data")).
									Children(
										material_symbols.CarRepair(),
										TextF("Submit selected '%s / %s' choice", make.Label, model.Label),
									)
							},
						),
					),
			)
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.BodyUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			_, _, isValid := storeValidation(store)

			if !isValid {
				http.Error(w, "invalid input", http.StatusBadRequest)
				return
			}

			sse := datastar.NewSSE(w, r)

			make, ok := lo.Find(cars, func(item *Make) bool {
				return item.ID == store.Make
			})
			if !ok {
				http.Error(w, "invalid input", http.StatusBadRequest)
				return
			}

			model, ok := lo.Find(make.Models, func(item *Model) bool {
				return item.ID == store.Model
			})

			if !ok {
				http.Error(w, "invalid input", http.StatusBadRequest)
				return
			}

			datastar.RenderFragment(sse,
				DIV().
					ID("value_select").
					Children(
						Text("You selected"),
						BR(),
						TextF("Make '%s' db id:%s", make.Label, make.ID),
						BR(),
						TextF("Model '%s' db id:%s", model.Label, model.ID),
						BUTTON().CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600").
							DATASTAR_ON("click", datastar.GET("/examples/value_select/data")).
							Children(
								material_symbols.ResetWrench(),
								TextF("Resest form"),
							),
					),
			)
		})
	})

	return nil
}
