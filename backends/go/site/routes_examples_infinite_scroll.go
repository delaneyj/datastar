package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesInfiniteScroll(examplesRouter chi.Router) error {

	examplesRouter.Get("/infinite_scroll/data", func(w http.ResponseWriter, r *http.Request) {
		store := &infiniteScrollStore{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if store.Limit < 1 || store.Limit > 100 {
			store.Limit = 10
		}

		sse := datastar.NewSSE(w, r)

		if store.Offset == 0 {
			datastar.RenderFragmentTempl(sse, infiniteScrollAgents(store))
		} else {
			if store.Offset < 100 {
				datastar.RenderFragmentTempl(sse, infiniteScrollMore(store))
				for i := 0; i < store.Limit; i++ {

					datastar.RenderFragmentTempl(
						sse, infiniteScrollAgent(store.Offset+i),
						datastar.WithQuerySelectorID("click_to_load_rows"),
						datastar.WithMergeAppend(),
					)
				}
			} else {
				datastar.RenderFragmentTempl(sse, infiniteScrollRickroll())
			}
		}
	})

	return nil
}
