package webui

import (
	"context"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupExampleInlineValidation(ctx context.Context, editRowRouter chi.Router) error {

	editRowRouter.Route("/inline_validation", func(inlineValidationRouter chi.Router) {

		inlineValidationRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		inlineValidationRouter.Route("/data", func(dataRouter chi.Router) {

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

			fieldToNode := func(label, field string, isValid bool, isNotValidErrorLabelFmt string, labelArgs ...any) NODE {
				return DIV(
					CLS("form-control"),
					LABEL(
						CLS("label"),
						SPAN(
							CLS("label-text"),
							TXT(label),
						),
					),
					INPUT(
						CLSS{
							"input input-bordered": true,
							"border-error":         !isValid,
						},
						TYPE("text"),
						datastar.Model(field),
						datastar.FetchURL("'/examples/inline_validation/data'"),
						datastar.OnDebounce("keydown", 500*time.Millisecond, datastar.GET_ACTION),
					),
					IFCachedNode(
						!isValid,
						LABEL(
							CLS("label"),
							SPAN(
								CLS("label-text-alt text-error"),
								TXTF(isNotValidErrorLabelFmt, labelArgs...),
							),
						),
					),
				)
			}

			userToNode := func(u *User) NODE {
				isEmailValid, isFirstNameValid, isLastNameValid, isValid := userValidation(u)

				return DIV(
					ID("inline_validation"),
					datastar.MergeStore(u),
					CLS("flex flex-col gap-4"),
					DIV(
						CLS("font-bold text-2xl"),
						TXT("Sign Up"),
					),
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
					BUTTON(
						CLS("btn btn-primary"),
						IFCachedNode(!isValid, DISABLED),
						datastar.On("click", datastar.POST_ACTION),
						datastar.FetchURL("'/examples/inline_validation/data'"),
						material_symbols.PersonAdd(),
						TXT("Submit"),
					),
				)
			}

			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				u := &User{}
				if err := datastar.QueryStringUnmarshal(r, u); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, userToNode(u), datastar.WithQuerySelectorUseID())
			})

			dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				u := &User{}
				if err := datastar.BodyUnmarshal(r, u); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				_, _, _, isValid := userValidation(u)

				sse := toolbelt.NewSSE(w, r)
				var node NODE
				if !isValid {
					node = userToNode(u)
				} else {
					node = DIV(
						ID("inline_validation"),
						CLS("font-bold text-4xl alert alert-success"),
						material_symbols.CheckCircle(),
						TXT("Thank you for signing up!"),
					)
				}

				datastar.RenderFragment(sse, node, datastar.WithQuerySelectorUseID())
			})
		})
	})

	return nil
}
