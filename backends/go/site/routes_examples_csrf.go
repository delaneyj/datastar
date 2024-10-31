package site

import (
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/csrf"
)

func setupExamplesCSRF(examplesRouter chi.Router) error {

	CSRF := csrf.Protect([]byte("32-byte-long-auth-key"))

	examplesRouter.Route("/csrf/data", func(r chi.Router) {
		r.Use(CSRF)

		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			token := csrf.Token(r)
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, CSRFDemo(token))
		})

		r.Post("/", func(w http.ResponseWriter, r *http.Request) {
			token := csrf.Token(r)

			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, CSRFDemoResponse(
				fmt.Sprintf("POST request received with token: %s", token),
			),
				datastar.WithQuerySelectorID("responses"),
				datastar.WithMergeAppend(),
			)
		})
	})

	return nil
}
