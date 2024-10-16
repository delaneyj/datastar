package site

import (
	"log"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesClickToLoad(examplesRouter chi.Router) error {

	examplesRouter.Get("/click_to_load/data", func(w http.ResponseWriter, r *http.Request) {
		store := &ClickToLoadStore{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		if store.Limit < 1 {
			store.Limit = 10
		} else if store.Limit > 100 {
			store.Limit = 100
		}
		if store.Offset < 0 {
			store.Offset = 0
		}

		sse := datastar.NewSSE(w, r)

		if store.Offset == 0 {
			datastar.RenderFragmentTempl(sse, ClickToEditAgentsTable(store))
		} else {
			datastar.RenderFragmentTempl(sse, ClickToLoadMoreButton(store))
			for i := 0; i < store.Limit; i++ {
				log.Printf("ClickToLoadAgentRow: %d", store.Offset+i)
				datastar.RenderFragmentTempl(
					sse,
					ClickToLoadAgentRow(store.Offset+i),
					datastar.WithQuerySelectorID("click_to_load_rows"),
					datastar.WithMergeAppend(),
				)
			}
		}
	})

	return nil
}
