package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupExamplesValueSelect(examplesRouter chi.Router) error {
	cars := []*ValueSelectMake{
		{
			ID:    toolbelt.NextEncodedID(),
			Label: "Audi",
			Models: []*ValueSelectModel{
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
			Models: []*ValueSelectModel{
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
			Models: []*ValueSelectModel{
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

	storeValidation := func(store *ValueSelectStore) (make *ValueSelectMake, model *ValueSelectModel, isValid bool) {
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
			store := &ValueSelectStore{}
			if err := datastar.QueryStringUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			make, model, isValid := storeValidation(store)

			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(
				sse,
				valueSelectView(cars, store, make, model, isValid),
			)
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			store := &ValueSelectStore{}
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

			make, ok := lo.Find(cars, func(item *ValueSelectMake) bool {
				return item.ID == store.Make
			})
			if !ok {
				http.Error(w, "invalid input", http.StatusBadRequest)
				return
			}

			model, ok := lo.Find(make.Models, func(item *ValueSelectModel) bool {
				return item.ID == store.Model
			})

			if !ok {
				http.Error(w, "invalid input", http.StatusBadRequest)
				return
			}

			datastar.RenderFragmentTempl(sse, valueSelectResults(make, model))
		})
	})

	return nil
}
