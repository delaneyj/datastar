package site

import (
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
	"github.com/gorilla/sessions"
)

func setupExamplesStoreChanged(examplesRouter chi.Router, store sessions.Store) error {
	sessionKey := "datastar-on-store-changed-example"

	currentTotalUpdates := func(w http.ResponseWriter, r *http.Request) (*sessions.Session, int, error) {
		session, err := store.Get(r, sessionKey)
		if err != nil || len(session.Values) == 0 {
			session.Values["updated"] = 0
			if err := session.Save(r, w); err != nil {
				return nil, 0, err
			}
		}
		total := session.Values["updated"].(int)
		return session, total, nil
	}

	saveAndRenderTotalUpdates := func(w http.ResponseWriter, r *http.Request, session *sessions.Session, totalUpdates int) {
		session.Values["updated"] = totalUpdates
		if err := session.Save(r, w); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		sse := datastar.NewSSE(w, r)
		datastar.RenderFragmentString(sse,
			fmt.Sprintf(`<div id="from_server">Lifetime server updates %d</div>`, totalUpdates),
		)
	}

	examplesRouter.Route("/store_changed/updates", func(storeChangedUpdatesRouter chi.Router) {

		storeChangedUpdatesRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			session, totalUpdates, err := currentTotalUpdates(w, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			totalUpdates++
			saveAndRenderTotalUpdates(w, r, session, totalUpdates)
		})

		storeChangedUpdatesRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
			session, _, err := currentTotalUpdates(w, r)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			saveAndRenderTotalUpdates(w, r, session, 0)
		})
	})

	return nil
}
