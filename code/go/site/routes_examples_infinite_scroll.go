package site

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesInfiniteScroll(examplesRouter chi.Router) error {

	examplesRouter.Get("/infinite_scroll/data", func(w http.ResponseWriter, r *http.Request) {
		store := &infiniteScrollStore{}
		if err := datastar.ReadSignals(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if store.Limit < 1 || store.Limit > 100 {
			store.Limit = 10
		}

		sse := datastar.NewSSE(w, r)

		if store.Offset == 0 {
			sse.MergeFragmentTempl(infiniteScrollAgents(store))
		} else {
			if store.Offset < 100 {
				sse.MergeFragmentTempl(infiniteScrollMore(store))
				for i := 0; i < store.Limit; i++ {

					sse.MergeFragmentTempl(
						infiniteScrollAgent(store.Offset+i),
						datastar.WithSelectorID("click_to_load_rows"),
						datastar.WithMergeAppend(),
					)
				}
			} else {
				sse.MergeFragmentTempl(infiniteScrollRickroll())
			}
		}
	})

	return nil
}
