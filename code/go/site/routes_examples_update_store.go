package site

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesUpdateStore(examplesRouter chi.Router) error {

	examplesRouter.Route("/update_store/data", func(dataRouter chi.Router) {
		dataRouter.Route("/patch", func(patchRouter chi.Router) {
			patchRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				store := map[string]any{}
				if err := datastar.ReadSignals(r, &store); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}

				randKey := fmt.Sprintf("%d", rand.Intn(2<<16))
				store[randKey] = time.Now().Format(time.RFC3339Nano)

				datastar.NewSSE(w, r).MarshalAndMergeSignals(store)
			})

			patchRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
				store := map[string]any{}
				if err := datastar.ReadSignals(r, &store); err != nil {
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

				sse.DeleteFromStore(keysToDelete...)
			})
		})

	})

	return nil
}
