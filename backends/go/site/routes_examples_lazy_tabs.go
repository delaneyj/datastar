package site

import (
	"net/http"

	"github.com/a-h/templ"
	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesLazyTabs(examplesRouter chi.Router) error {
	tabs := make([]templ.Component, 8)
	for i := range tabs {
		tabs[i] = setupExamplesLazyTabsContent()
	}

	examplesRouter.Get("/lazy_tabs/data", func(w http.ResponseWriter, r *http.Request) {
		store := &LazyTabsStore{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		sse := datastar.NewSSE(w, r)
		component := setupExamplesLazyTabsComponent(len(tabs), tabs[store.TabID], store)
		datastar.RenderFragmentTempl(sse, component)
	})

	return nil
}
