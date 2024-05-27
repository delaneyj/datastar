package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesIsFetching(examplesRouter chi.Router) error {

	examplesRouter.Get("/is_fetching/greet", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		d := 1 * time.Second

		datastar.RenderFragment(sse, DIV().ID("greeting").TextF("Calculating... waiting for %s", d))
		time.Sleep(d)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("greeting").
				TextF("Hello, the time is %s", time.Now().Format(time.RFC3339)),
		)
	})

	return nil
}
