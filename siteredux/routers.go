package site

import (
	"context"
	"net/http"

	"github.com/benbjohnson/hashfs"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	datastar "github.com/starfederation/datastar/sdk/go"
)

func setupRoutes(_ context.Context) (http.Handler, error) {
	router := chi.NewRouter()

	router.Use(middleware.Recoverer, middleware.Logger)

	router.Handle("/static/*", hashfs.FileServer(staticSys))

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		PageHome().Render(r.Context(), w)
	})

	router.Route("/hotreload", func(hotReloadRouter chi.Router) {

		hotReloadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			sse.ExecuteScript(`
var source = new EventSource("/hotreload/wait");
source.onerror = function(event) {
    location.reload();
};
			`)
		})

		hotReloadRouter.Get("/wait", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			sse.ConsoleLog("Hot Reload Wait")
			<-r.Context().Done()
		})
	})

	return router, nil
}
