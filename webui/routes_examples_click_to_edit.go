package webui

import (
	"context"
	"net/http"

	goaway "github.com/TwiN/go-away"
	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
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

		contactNode := func(c *Contact) ElementRenderer {
			return DIV().
				ID("contact_1").
				CLASS("flex flex-col gap-2 max-w-sm").
				Children(
					LABEL(TextF("First Name: %s", goaway.Censor(c.FirstName))),
					LABEL(TextF("Last Name: %s", goaway.Censor(c.LastName))),
					LABEL(TextF("Email: %s", goaway.Censor(c.Email))),
					DIV().
						CLASS("join").
						Children(
							BUTTON().
								CLASS("btn btn-primary join-item").
								DATASTAR_FETCH_URL("'/examples/click_to_edit/contact/1/edit'").
								DATASTAR_ON("click", datastar.GET_ACTION).
								Text("Edit"),
							BUTTON().
								CLASS("btn btn-warning btn-outline join-item").
								DATASTAR_FETCH_URL("'/examples/click_to_edit/contact/1/reset'").
								DATASTAR_ON("click", datastar.PATCH_ACTION).
								Text("Reset"),
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
				datastar.RenderFragment(sse, contactNode(c1))
			})

			contactRouter.Get("/edit", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					DIV().
						ID("contact_1").
						CLASS("flex flex-col gap-2").
						DATASTAR_MERGE_STORE(c1).
						Children(
							DIV().
								CLASS("form-control").
								Children(
									LABEL().CLASS("label").
										Children(
											SPAN().
												CLASS("label-text").
												Text("First Name"),
										),
									INPUT().
										CLASS("input input-bordered").
										TYPE("text").
										DATASTAR_MODEL("firstName"),
								),
							DIV().
								CLASS("form-control").
								Children(
									LABEL().CLASS("label").
										Children(
											SPAN().
												CLASS("label-text").
												Text("Last Name"),
										),
									INPUT().
										CLASS("input input-bordered").
										TYPE("text").
										DATASTAR_MODEL("lastName"),
								),
							DIV().
								CLASS("form-control").
								Children(
									LABEL().
										CLASS("label").
										Children(
											SPAN().
												CLASS("label-text").
												Text("Email"),
										),
									INPUT().
										CLASS("input input-bordered").
										TYPE("text").
										DATASTAR_MODEL("email"),
								),
							DIV().
								CLASS("join").
								Children(
									BUTTON().
										CLASS("btn btn-primary join-item").
										DATASTAR_FETCH_URL("'/examples/click_to_edit/contact/1'").
										DATASTAR_ON("click", datastar.PUT_ACTION).
										Text("Save"),
									BUTTON().
										CLASS("btn btn-warning join-item").
										DATASTAR_FETCH_URL("'/examples/click_to_edit/contact/1'").
										DATASTAR_ON("click", datastar.GET_ACTION).
										Text("Cancel"),
								),
						),
				)

			})

			contactRouter.Patch("/reset", func(w http.ResponseWriter, r *http.Request) {
				resetContact()
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, contactNode(c1))
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
				datastar.RenderFragment(toolbelt.NewSSE(w, r), contactNode(c1))
			})
		})
	})

	return nil
}
