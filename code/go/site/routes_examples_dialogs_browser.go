package site

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesDialogsBrowser(examplesRouter chi.Router) error {

	examplesRouter.Get("/dialogs_browser/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		store := &DialogBrowserStore{Prompt: "foo"}
		sse.MergeFragmentTempl(DialogBrowserView(store))
	})

	examplesRouter.Get("/dialogs_browser/sure", func(w http.ResponseWriter, r *http.Request) {
		store := &DialogBrowserStore{}
		if err := datastar.ReadSignals(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		sse := datastar.NewSSE(w, r)
		sse.MergeFragmentTempl(DialogBrowserSure(store))
	})

	return nil
}
