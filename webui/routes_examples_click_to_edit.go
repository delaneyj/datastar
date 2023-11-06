package webui

import (
	"context"
	"net/http"

	goaway "github.com/TwiN/go-away"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/delaneyj/toolbelt/gomps/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesClickToEdit(ctx context.Context, examplesRouter chi.Router) error {

	// tsBytes, err := staticFS.ReadFile("static/examples/click_to_edit.txt")
	// if err != nil {
	// 	return fmt.Errorf("error reading examples dir: %w", err)
	// }

	examplesRouter.Route("/click_to_edit", func(exampleRouter chi.Router) {
		type Contact struct {
			FirstName string `json:"firstName,omitempty" san:"trim,xss,max=128"`
			LastName  string `json:"lastName,omitempty" san:"trim,xss,max=128"`
			Email     string `json:"email,omitempty" san:"trim,xss,max=128"`
		}

		exampleRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		contactNode := func(c *Contact) NODE {
			return DIV(
				ID("contact_1"),
				CLS("flex flex-col gap-2 max-w-sm"),
				LABEL(TXTF("First Name: %s", goaway.Censor(c.FirstName))),
				LABEL(TXTF("Last Name: %s", goaway.Censor(c.LastName))),
				LABEL(TXTF("Email: %s", goaway.Censor(c.Email))),
				DIV(
					CLS("join"),
					BUTTON(
						CLS("btn btn-primary join-item"),
						datastar.FetchURL("'/examples/click_to_edit/contact/1/edit'"),
						datastar.On("click", "$$get"),
						TXT("Edit"),
					),
					BUTTON(
						CLS("btn btn-warning btn-outline join-item"),
						datastar.FetchURL("'/examples/click_to_edit/contact/1/reset'"),
						datastar.On("click", "$$patch"),
						TXT("Reset"),
					),
				),
			)
		}

		c1 := &Contact{}
		resetContact := func() {
			c1.FirstName = "John"
			c1.LastName = "Doe"
			c1.Email = "joe@blow.com"
		}
		resetContact()

		exampleRouter.Route("/contact/{id}", func(contactRouter chi.Router) {
			contactRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					datastar.FragmentSelectorUseID,
					datastar.FragmentMergeMorphElement,
					contactNode(c1),
				)
			})

			contactRouter.Patch("/reset", func(w http.ResponseWriter, r *http.Request) {
				resetContact()
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					datastar.FragmentSelectorUseID,
					datastar.FragmentMergeMorphElement,
					contactNode(c1),
				)
			})

			contactRouter.Get("/edit", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					datastar.FragmentSelectorUseID,
					datastar.FragmentMergeMorphElement,
					DIV(
						ID("contact_1"),
						CLS("flex flex-col gap-2"),
						datastar.MergeStore(c1),
						DIV(
							CLS("form-control"),
							LABEL(
								CLS("label"),
								SPAN(
									CLS("label-text"),
									TXT("First Name"),
								),
							),
							INPUT(
								CLS("input input-bordered"),
								TYPE("text"),
								datastar.Model("firstName"),
							),
						),
						DIV(
							CLS("form-control"),
							LABEL(
								CLS("label"),
								SPAN(
									CLS("label-text"),
									TXT("Last Name"),
								),
							),
							INPUT(
								CLS("input input-bordered"),
								TYPE("text"),
								datastar.Model("lastName"),
							),
						),
						DIV(
							CLS("form-control"),
							LABEL(
								CLS("label"),
								SPAN(
									CLS("label-text"),
									TXT("Email"),
								),
							),
							INPUT(
								CLS("input input-bordered"),
								TYPE("text"),
								datastar.Model("email"),
							),
						),
						DIV(
							CLS("join"),
							BUTTON(
								CLS("btn btn-primary join-item"),
								datastar.FetchURL("'/examples/click_to_edit/contact/1'"),
								datastar.On("click", "$$put"),
								TXT("Save"),
							),
							BUTTON(
								CLS("btn btn-warning join-item"),
								datastar.FetchURL("'/examples/click_to_edit/contact/1'"),
								datastar.On("click", "$$get"),
								TXT("Cancel"),
							),
						),
					),
				)
			})

			contactRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
				c := &Contact{}
				if err := datastar.BodyUnmarshal(r, c); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				if err := sanitizer.Sanitize(c); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				c1 = c // update the contact
				datastar.RenderFragment(
					toolbelt.NewSSE(w, r),
					datastar.FragmentSelectorUseID,
					datastar.FragmentMergeMorphElement,
					contactNode(c1),
				)
			})
		})
	})

	return nil
}
