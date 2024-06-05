package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesFetchIndicator(examplesRouter chi.Router) error {

	examplesRouter.Get("/fetch_indicator/greet", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragmentTempl(sse, fetchIndicatorEmpty())
		time.Sleep(2 * time.Second)
		datastar.RenderFragmentTempl(sse, fetchIndicatorGreeting())
	})

	return nil
}
