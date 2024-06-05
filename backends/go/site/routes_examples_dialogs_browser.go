package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDialogsBrowser(examplesRouter chi.Router) error {

	examplesRouter.Get("/dialogs_browser/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		store := &DialogBrowserStore{Prompt: "foo"}
		datastar.RenderFragmentTempl(sse, DialogBrowserView(store))
	})

	examplesRouter.Get("/dialogs_browser/sure", func(w http.ResponseWriter, r *http.Request) {
		store := &DialogBrowserStore{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragmentTempl(sse, DialogBrowserSure(store))
	})

	return nil
}
