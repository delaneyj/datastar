package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesFetchIndicator(examplesRouter chi.Router) error {

	examplesRouter.Get("/fetch_indicator/greet", func(w http.ResponseWriter, r *http.Request) {

		sse := toolbelt.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("greeting").
				TextF("Hello, the time is %s", time.Now().Format(time.RFC3339)),
			datastar.WithSettleDuration(5*time.Second),
		)
	})

	return nil
}
