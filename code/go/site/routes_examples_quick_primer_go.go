package site

import (
	"encoding/binary"
	"encoding/hex"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
	datastar "github.com/starfederation/datastar/code/go/sdk"
	// "github.com/goccy/go-json"
)

func setupExamplesQuickPrimerGo(examplesRouter chi.Router) error {
	examplesRouter.Route("/quick_primer_go/data", func(dataRouter chi.Router) {

		store := &QuickPrimerGoStore{"initial backend data", false}
		mu := &sync.RWMutex{}

		dataRouter.Get("/replace", func(w http.ResponseWriter, r *http.Request) {
			mu.RLock()
			defer mu.RUnlock()
			sse := datastar.NewSSE(w, r)
			sse.MergeFragmentTempl(QuickPrimerGoView(store))
		})

		dataRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			reqStore := &QuickPrimerGoStore{}
			if err := datastar.ReadSignals(r, reqStore); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := sanitizer.Sanitize(reqStore); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			mu.Lock()
			store = reqStore
			mu.Unlock()

			datastar.NewSSE(w, r).MergeFragmentTempl(QuickPrimerGoPut(store))
		})

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			mu.RLock()
			defer mu.RUnlock()

			b, err := json.Marshal(store)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			sse.MergeFragmentTempl(
				QuickPrimerGoGet(string(b)),
				datastar.WithSelector("main"),
				datastar.WithMergePrepend(),
			)
		})

		dataRouter.Get("/feed", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			ticker := time.NewTicker(2 * time.Second)

			for {
				select {
				case <-r.Context().Done():
					return
				case <-ticker.C:
					buf := make([]byte, 8)
					binary.LittleEndian.PutUint64(buf, rand.Uint64())
					sse.MergeFragmentTempl(QuickPrimerGoFeed(hex.EncodeToString(buf)))
				}
			}
		})
	})

	return nil
}
