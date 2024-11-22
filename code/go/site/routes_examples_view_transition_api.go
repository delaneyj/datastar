package site

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesViewTransitionAPI(examplesRouter chi.Router) error {

	examplesRouter.Get("/view_transition_api/watch", func(w http.ResponseWriter, r *http.Request) {
		// You can comment out the below block and still persist the session

		store := &viewTransitionAPIStore{}
		if err := datastar.ReadSignals(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		sse := datastar.NewSSE(w, r)
		sse.MergeFragmentTempl(viewTransitionAPIUpdate(store.UseSlide))
		t := time.NewTicker(time.Second)
		for {
			select {
			case <-r.Context().Done():
				return
			case <-t.C:
				sse.MergeFragmentTempl(viewTransitionAPIUpdate(store.UseSlide))
			}
		}
	})

	return nil
}
