package site

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupExamplesDeleteRow(examplesRouter chi.Router) error {

	contacts := starterActiveContacts()
	mu := &sync.RWMutex{}

	examplesRouter.Route("/delete_row/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			mu.RLock()
			defer mu.RUnlock()
			datastar.RenderFragmentTempl(sse, deleteRowContacts(contacts))
		})

		dataRouter.Get("/reset", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			mu.Lock()
			defer mu.Unlock()
			contacts = starterActiveContacts()
			datastar.RenderFragmentTempl(sse, deleteRowContacts(contacts))
		})

		dataRouter.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			idStr := chi.URLParam(r, "id")
			id, err := strconv.Atoi(idStr)
			if err != nil {
				http.Error(w, fmt.Sprintf("error parsing index: %s", err), http.StatusBadRequest)
				return
			}

			mu.Lock()
			defer mu.Unlock()
			contacts = lo.Filter(contacts, func(cs *ContactActive, i int) bool {
				return cs.ID != id
			})
			datastar.Delete(sse, "#contact_"+idStr)
		})
	})

	return nil
}
