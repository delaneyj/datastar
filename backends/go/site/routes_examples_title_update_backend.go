package site

import (
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesTitleUpdateBackend(examplesRouter chi.Router) error {
	examplesRouter.Get("/title_update_backend/updates", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		updateTitle := func() {
			datastar.RenderFragmentString(sse,
				fmt.Sprintf(`<title>%s from server</title>`, time.Now().Format(time.TimeOnly)),
				datastar.WithQuerySelector("title"),
			)
		}

		updateTitle()
		t := time.NewTicker(1 * time.Second)
		for {
			select {
			case <-r.Context().Done():
				return
			case <-t.C:
				updateTitle()
			}
		}
	})

	return nil
}
