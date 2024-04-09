package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesOnLoad(examplesRouter chi.Router) error {
	examplesRouter.Get("/on_load/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(sse, DIV().ID("replaceMe").TextF("Loaded at %s", time.Now().Format(time.RFC3339)))
	})
	return nil
}
