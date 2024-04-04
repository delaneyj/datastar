package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExampleInlineValidation(examplesRouter chi.Router) error {

	examplesRouter.Route("/inline_validation/data", func(dataRouter chi.Router) {

		type User struct {
			FirstName string `json:"firstName"`
			LastName  string `json:"lastName"`
			Email     string `json:"email"`
		}

		userValidation := func(u *User) (isEmailValid bool, isFirstNameValid bool, isLastNameValid bool, isValid bool) {
			isEmailValid = u.Email == "test@test.com"
			isFirstNameValid = len(u.FirstName) > 8
			isLastNameValid = len(u.LastName) > 8
			isValid = isFirstNameValid && isLastNameValid && isEmailValid
			return isEmailValid, isFirstNameValid, isLastNameValid, isValid
		}

		fieldToNode := func(label, field string, isValid bool, isNotValidErrorLabelFmt string, labelArgs ...any) ElementRenderer {
			return DIV().
				CLASS("form-control").
				Children(
					LABEL().
						CLASS("label").
						Children(
							SPAN().
								CLASS("label-text").
								Text(label),
						),
					INPUT().
						CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5").
						IfCLASS(!isValid, "border-error").
						DATASTAR_MODEL(field).
						DATASTAR_ON("keydown", datastar.GET("/examples/inline_validation/data"), InputOnModDebounce(2*time.Second)),
					If(!isValid, LABEL().CLASS("text-sm font-bold text-error-400").TextF(isNotValidErrorLabelFmt, labelArgs...)),
				)
		}

		userToNode := func(u *User) ElementRenderer {
			isEmailValid, isFirstNameValid, isLastNameValid, isValid := userValidation(u)
			_, _ = isEmailValid, isFirstNameValid
			return DIV().
				ID("inline_validation").
				CLASS("flex flex-col gap-4").
				DATASTAR_STORE(u).
				Children(
					DIV().CLASS("font-bold text-2xl").Text("Sign Up"),
					DIV(
						fieldToNode(
							"Email Address",
							"email",
							isEmailValid,
							"Email '%s' is already taken or is invalid.  Please enter another email.", u.Email,
						),
						fieldToNode(
							"First Name",
							"firstName",
							isFirstNameValid,
							"First name must be at least 8 characters.",
						),
						fieldToNode(
							"Last Name",
							"lastName",
							isLastNameValid,
							"Last name must be at least 8 characters.",
						),
					),
					BUTTON().
						CLASS("flex items-center gap-2 bg-success-300 hover:bg-success-400 text-success-800 font-bold py-2 px-4").
						IfCLASS(!isValid, "disabled").
						DATASTAR_ON("click", datastar.POST("/examples/inline_validation/data")).
						Children(
							material_symbols.PersonAdd(),
							Text("Submit"),
						),
					SignalStore,
				)
		}

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			u := &User{}
			if err := datastar.QueryStringUnmarshal(r, u); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(sse, userToNode(u))
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			u := &User{}
			if err := datastar.BodyUnmarshal(r, u); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			_, _, _, isValid := userValidation(u)

			sse := toolbelt.NewSSE(w, r)
			var node ElementRenderer
			if !isValid {
				node = userToNode(u)
			} else {
				node = DIV().
					ID("inline_validation").
					CLASS("font-bold text-4xl alert alert-success").
					Children(
						material_symbols.CheckCircle(),
						Text("Thank you for signing up!"),
					)
			}

			datastar.RenderFragment(sse, node)
		})
	})

	return nil
}
