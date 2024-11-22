package site

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesRedirects(examplesRouter chi.Router) error {

	examplesRouter.Route("/redirects/data", func(dataRouter chi.Router) {

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			store := &RedirectsStore{
				RedirectTo: "/essays/grugs_around_fire",
			}
			sse := datastar.NewSSE(w, r)
			sse.MergeFragmentTempl(redirectsView(store))
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			store := &RedirectsStore{}
			if err := datastar.ReadSignals(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sse := datastar.NewSSE(w, r)
			for i := 5; i > 0; i-- {
				sse.MergeFragmentf(`<div id="update">Redirecting in %d...</div>`, i)
				time.Sleep(500 * time.Millisecond)
			}
			sse.Redirect(store.RedirectTo)
		})
	})

	return nil
}
