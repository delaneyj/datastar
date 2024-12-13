package site

import (
	"context"
	"net/http"

	"github.com/benbjohnson/hashfs"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func setupRoutes(_ context.Context) (http.Handler, error) {
	router := chi.NewRouter()

	router.Use(middleware.Recoverer)

	router.Handle("/static/*", hashfs.FileServer(staticSys))

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		PageHome().Render(r.Context(), w)
	})

	return router, nil
}
