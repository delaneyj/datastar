package site

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesClickToLoad(examplesRouter chi.Router) error {

	examplesRouter.Get("/click_to_load/data", func(w http.ResponseWriter, r *http.Request) {
		store := &ClickToLoadStore{}
		if err := datastar.ReadSignals(r, store); err != nil {
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
			sse.MergeFragmentTempl(ClickToEditAgentsTable(store))
		} else {
			sse.MergeFragmentTempl(ClickToLoadMoreButton(store))
			for i := 0; i < store.Limit; i++ {
				// log.Printf("ClickToLoadAgentRow: %d", store.Offset+i)
				sse.MergeFragmentTempl(
					ClickToLoadAgentRow(store.Offset+i),
					datastar.WithSelectorID("click_to_load_rows"),
					datastar.WithMergeAppend(),
				)
			}
		}
	})

	return nil
}
