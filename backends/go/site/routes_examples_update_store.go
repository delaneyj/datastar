package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesUpdateStore(examplesRouter chi.Router) error {

	examplesRouter.Route("/update_store/data", func(dataRouter chi.Router) {
		// dataRouter.Post("/replace", func(w http.ResponseWriter, r *http.Request) {
		// 	store := map[string]any{}
		// 	if err := datastar.BodyUnmarshal(r, &store); err != nil {
		// 		http.Error(w, err.Error(), http.StatusBadRequest)
		// 		return
		// 	}
		// 	delete(store, "stuffAlreadyInStore")
		// 	store["_sidebarOpen"] = false

		// 	sse := datastar.NewSSE(w, r)
		// 	datastar.ReplaceStore(sse, store)
		// })

		dataRouter.Post("/patch", func(w http.ResponseWriter, r *http.Request) {
			store := map[string]any{}
			if err := datastar.BodyUnmarshal(r, &store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			randKey := toolbelt.NextEncodedID()
			store[randKey] = time.Now().Format(time.RFC3339Nano)

			sse := datastar.NewSSE(w, r)
			datastar.PatchStore(sse, store)
		})
	})

	return nil
}
