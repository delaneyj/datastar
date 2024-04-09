package site

import (
	"log"
	"net/http"

	goaway "github.com/TwiN/go-away"
	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesClickToEdit(examplesRouter chi.Router) error {

	// tsBytes, err := staticFS.ReadFile("static/examples/click_to_edit.txt")
	// if err != nil {
	// 	return fmt.Errorf("error reading examples dir: %w", err)
	// }

	// examplesRouter.Route("/click_to_edit", func(exampleRouter chi.Router) {
	type Contact struct {
		FirstName string `json:"firstName,omitempty" san:"trim,xss,max=128"`
		LastName  string `json:"lastName,omitempty" san:"trim,xss,max=128"`
		Email     string `json:"email,omitempty" san:"trim,xss,max=128"`
	}

	// exampleRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	leftBtnCSS := "bg-primary-300 hover:bg-primary-400 text-primary-800 font-bold py-2 px-4 rounded-l"
	rightBtnCSS := "bg-accent-300 hover:bg-accent-400 text-accent-800 font-bold py-2 px-4 rounded-r"

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
							CLASS(leftBtnCSS).
							DATASTAR_ON("click", datastar.GET("/examples/click_to_edit/contact/1/edit")).
							Text("Edit"),
						BUTTON().
							CLASS(rightBtnCSS).
							DATASTAR_ON("click", datastar.PATCH("/examples/click_to_edit/contact/1/reset")).
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

	examplesRouter.Route("/click_to_edit/contact/{id}", func(contactRouter chi.Router) {
		contactRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(sse, contactNode(c1))
		})

		labeledInput := func(label, id string) (container ElementRenderer, input *INPUTElement) {
			input = INPUT().
				ID(id).
				CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5")

			container = DIV(
				LABEL().FOR(id).CLASS("block mb-2 text-sm font-medium text-accent-100").Text(label),
				input,
			)
			return container, input
		}

		labelInputModel := func(label, id string) ElementRenderer {
			container, input := labeledInput(label, id)
			input.TYPE("text").DATASTAR_MODEL(id)
			return container
		}

		contactRouter.Get("/edit", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			datastar.RenderFragment(
				sse,
				DIV().
					ID("contact_1").
					CLASS("flex flex-col gap-2").
					DATASTAR_STORE(c1).
					Children(
						labelInputModel("First Name", "firstName"),
						labelInputModel("Last Name", "lastName"),
						labelInputModel("Email", "email"),
						DIV().
							CLASS("inline-flex").
							Children(
								BUTTON().
									CLASS(leftBtnCSS).
									DATASTAR_ON("click", datastar.PUT("/examples/click_to_edit/contact/1")).
									Text("Save"),
								BUTTON().
									CLASS(rightBtnCSS).
									DATASTAR_ON("click", datastar.GET("/examples/click_to_edit/contact/1")).
									Text("Cancel"),
							),
					),
			)

		})

		contactRouter.Patch("/reset", func(w http.ResponseWriter, r *http.Request) {
			resetContact()
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(sse, contactNode(c1))
		})

		contactRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			c := &Contact{}
			if err := datastar.BodyUnmarshal(r, c); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			log.Print(c)

			if err := sanitizer.Sanitize(c); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			c1 = c // update the contact
			datastar.RenderFragment(datastar.NewSSE(w, r), contactNode(c1))
		})
	})
	// })

	return nil
}
