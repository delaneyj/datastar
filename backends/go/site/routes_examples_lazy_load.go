package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesLazyLoad(examplesRouter chi.Router) error {
	examplesRouter.Get("/lazy_load/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragmentTempl(sse, lazyLoadLoader())
	})

	examplesRouter.Get("/lazy_load/graph", func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(2 * time.Second)
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragmentTempl(
			sse,
			lazyLoadGraph(),
			datastar.WithSettleDuration(1*time.Second),
		)
	})

	return nil
}
