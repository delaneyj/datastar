package site

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesToggleVisibility(examplesRouter chi.Router) error {
	examplesRouter.Get("/toggle_visibility/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		store := &ShowStore{
			BindBool: false,
		}

		sse.MergeFragmentTempl(ToggleVisibilityView(store))
	})

	return nil
}
