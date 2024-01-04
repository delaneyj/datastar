package webui

import (
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesValueSelect(ctx context.Context, examplesRouter chi.Router) error {

	examplesRouter.Route("/value_select", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

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

		type Input struct {
			Make  string `json:"make"`
			Model string `json:"model"`
		}

		inputValidation := func(input *Input) (make *Make, model *Model, isValid bool) {
			if input.Make != "" {
				for _, possibleMake := range cars {
					if possibleMake.ID == input.Make {
						make = possibleMake

						if input.Model != "" {
							for _, possibleModel := range make.Models {
								if possibleModel.ID == input.Model {
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

		lazyLoadRouter.Route("/data", func(dataRouter chi.Router) {

			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				input := &Input{}
				if err := datastar.QueryStringUnmarshal(r, input); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				make, model, isValid := inputValidation(input)

				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					DIV().
						ID("value_select").
						DATASTAR_MERGE_STORE(input).
						CLASS("flex flex-col gap-2").
						Children(
							DIV().
								CLASS("text-2xl font-bold").
								Text("Pick a Make / Model"),
							SELECT().
								CLASS("select select-bordered").
								DATASTAR_MODEL("make").
								DATASTAR_FETCH_URL("'/examples/value_select/data'").
								DATASTAR_ON("change", datastar.GET_ACTION).
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
							If(
								make != nil,
								SELECT().
									CLASS("select select-bordered").
									DATASTAR_MODEL("model").
									DATASTAR_FETCH_URL("'/examples/value_select/data'").
									DATASTAR_ON("change", datastar.GET_ACTION).
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
									),
							),
							If(
								isValid,
								BUTTON().
									CLASS("btn btn-primary").
									DATASTAR_FETCH_URL("'/examples/value_select/data'").
									DATASTAR_ON("click", datastar.POST_ACTION).
									Children(
										material_symbols.CarRepair(),
										TextF("Submit selected '%s / %s' choice", make.Label, model.Label),
									),
							),
						),
				)
			})

			dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				input := &Input{}
				if err := datastar.BodyUnmarshal(r, input); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				_, _, isValid := inputValidation(input)

				if !isValid {
					http.Error(w, "invalid input", http.StatusBadRequest)
					return
				}

				sse := toolbelt.NewSSE(w, r)
				datastar.Redirect(sse, "/examples/value_select")
			})
		})
	})

	return nil
}
