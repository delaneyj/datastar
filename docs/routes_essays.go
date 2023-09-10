package docs

import (
	"context"
	"net/http"

	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupEssays(ctx context.Context, router *chi.Mux) error {
	router.Route("/essays", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			Render(w, DIV(TXT("Essays")))
		})
	})

	return nil
}
