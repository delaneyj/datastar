package site

import (
	"net/http"

	"github.com/a-h/templ"
	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExampleInlineValidation(examplesRouter chi.Router) error {

	examplesRouter.Route("/inline_validation/data", func(dataRouter chi.Router) {
		userValidation := func(u *inlineValidationUser) (isEmailValid bool, isFirstNameValid bool, isLastNameValid bool, isValid bool) {
			isEmailValid = u.Email == "test@test.com"
			isFirstNameValid = len(u.FirstName) >= 2
			isLastNameValid = len(u.LastName) >= 2
			isValid = isFirstNameValid && isLastNameValid && isEmailValid
			return isEmailValid, isFirstNameValid, isLastNameValid, isValid
		}

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			u := &inlineValidationUser{}
			if err := datastar.QueryStringUnmarshal(r, u); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			sse := datastar.NewSSE(w, r)
			isEmailValid, isFirstNameValid, isLastNameValid, isValid := userValidation(u)
			datastar.RenderFragmentTempl(sse, inlineValidationUserComponent(u, isEmailValid, isFirstNameValid, isLastNameValid, isValid))
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			u := &inlineValidationUser{}
			if err := datastar.BodyUnmarshal(r, u); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			isEmailValid, isFirstNameValid, isLastNameValid, isValid := userValidation(u)

			sse := datastar.NewSSE(w, r)
			var node templ.Component
			if !isValid {
				node = inlineValidationUserComponent(u, isEmailValid, isFirstNameValid, isLastNameValid, isValid)
			} else {
				node = inlineValidationThankYou()
			}

			datastar.RenderFragmentTempl(sse, node)
		})
	})

	return nil
}
