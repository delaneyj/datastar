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
		dataRouter.Post("/patch", func(w http.ResponseWriter, r *http.Request) {
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
	})

	return nil
}
