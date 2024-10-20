package site

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesUpdateStore(examplesRouter chi.Router) error {

	examplesRouter.Route("/update_store/data", func(dataRouter chi.Router) {
		dataRouter.Route("/patch", func(patchRouter chi.Router) {
			patchRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				store := map[string]any{}
				if err := datastar.BodyUnmarshal(r, &store); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				randKey := fmt.Sprintf("%d", rand.Intn(2<<16))
				store[randKey] = time.Now().Format(time.RFC3339Nano)

				sse := datastar.NewSSE(w, r)
				datastar.PatchStore(sse, store)
			})

			patchRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
				store := map[string]any{}
				if err := datastar.BodyUnmarshal(r, &store); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				sse := datastar.NewSSE(w, r)

				if len(store) == 0 {
					return
				}

				const maxDeletes = 2

				keysToDelete := make([]string, 0, len(store))
				for k := range store {
					keysToDelete = append(keysToDelete, k)
				}
				rand.Shuffle(len(keysToDelete), func(i, j int) {
					keysToDelete[i], keysToDelete[j] = keysToDelete[j], keysToDelete[i]
				})

				if len(keysToDelete) > maxDeletes {
					keysToDelete = keysToDelete[:maxDeletes]
				}

				datastar.DeleteFromStore(sse, keysToDelete...)
			})
		})

	})

	return nil
}
