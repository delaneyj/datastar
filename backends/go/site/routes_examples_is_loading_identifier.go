package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesIsLoadingId(examplesRouter chi.Router) error {

	examplesRouter.Get("/is_loading_identifier/greet", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(sse, DIV().ID("greeting").Text(""))
		time.Sleep(2 * time.Second)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("greeting").
				TextF("Hello, the time is %s", time.Now().Format(time.RFC3339)),
		)
	})

	return nil
}
