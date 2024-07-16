package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesShow(examplesRouter chi.Router) error {
	examplesRouter.Get("/show/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		store := &ShowStore{
			BindBool: false,
		}

		datastar.RenderFragmentTempl(sse, ShowView(store))
	})

	return nil
}
