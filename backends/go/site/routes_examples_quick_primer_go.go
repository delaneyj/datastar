package site

import (
	"encoding/binary"
	"encoding/hex"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
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
			datastar.RenderFragmentTempl(sse, QuickPrimerGoView(store))
		})

		dataRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			reqStore := &QuickPrimerGoStore{}
			if err := datastar.BodyUnmarshal(r, reqStore); err != nil {
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

			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, QuickPrimerGoPut(store))
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
			datastar.RenderFragmentTempl(sse, QuickPrimerGoGet(string(b)))

			datastar.RenderFragmentTempl(
				sse, QuickPrimerCheckThisOut(),
				datastar.WithQuerySelector("main"),
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
					datastar.RenderFragmentTempl(sse, QuickPrimerGoFeed(hex.EncodeToString(buf)))
				}
			}
		})
	})

	return nil
}
