package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesUpdateStore(examplesRouter chi.Router) error {

	examplesRouter.Get("/update_store/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(sse, DIV().ID("replace").Text("Hello, World!"))
	})

	return nil
}
