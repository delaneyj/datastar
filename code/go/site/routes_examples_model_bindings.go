package site

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesModelBinding(examplesRouter chi.Router) error {
	examplesRouter.Get("/model_binding/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		store := &ModelBindingStore{
			BindText:      "foo",
			BindNumber:    42,
			BindSelection: 1,
			BindBool:      true,
		}

		sse.MergeFragmentTempl(ModelBindingView(7, store))
	})

	return nil
}
