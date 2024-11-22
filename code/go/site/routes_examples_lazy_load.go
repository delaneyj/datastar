package site

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesLazyLoad(examplesRouter chi.Router) error {
	examplesRouter.Get("/lazy_load/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		sse.MergeFragmentTempl(lazyLoadLoader())
	})

	examplesRouter.Get("/lazy_load/graph", func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(2 * time.Second)
		datastar.NewSSE(w, r).MergeFragmentTempl(
			lazyLoadGraph(),
			datastar.WithSettleDuration(1*time.Second),
		)
	})

	return nil
}
