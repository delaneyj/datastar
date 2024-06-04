package site

import (
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesRedirects(examplesRouter chi.Router) error {

	examplesRouter.Route("/redirects/data", func(dataRouter chi.Router) {

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			store := &RedirectsStore{
				RedirectTo: "/essays/grugs_around_fire",
			}
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, redirectsView(store))
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			store := &RedirectsStore{}
			if err := datastar.BodyUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sse := datastar.NewSSE(w, r)
			for i := 5; i > 0; i-- {
				datastar.RenderFragmentString(
					sse,
					fmt.Sprintf(`<div id="update">Redirecting in %d...</div>`, i),
				)
				time.Sleep(500 * time.Millisecond)
			}
			datastar.Redirect(sse, store.RedirectTo)
		})
	})

	return nil
}
