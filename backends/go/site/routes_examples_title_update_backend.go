package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesTitleUpdateBackend(examplesRouter chi.Router) error {
	examplesRouter.Get("/title_update_backend/updates", func(w http.ResponseWriter, r *http.Request) {
		// You can comment out the below block and still persist the session
		sse := datastar.NewSSE(w, r)
		t := time.NewTicker(1 * time.Second)

		for {
			select {
			case <-r.Context().Done():
				return
			case <-t.C:
				datastar.RenderFragment(sse,
					TITLE().TextF("%s from server", time.Now().Format(time.TimeOnly)),
					datastar.WithQuerySelector("title"),
				)
			}
		}
	})

	return nil
}
