package docs

import (
	"context"
	"net/http"

	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupRoutes(ctx context.Context, router *chi.Mux) error {
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		Render(w, HTML5(HTML5Props{
			Title: "Datastar",
			Body: NODES{
				DIV(TXT("Hello World Docs")),
			},
		}))

	})

	return nil
}
