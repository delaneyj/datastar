package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDisableButton(examplesRouter chi.Router) error {
	examplesRouter.Get("/disable_button/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		store := map[string]any{
			"shouldDisable": false,
		}
		time.Sleep(1 * time.Second)
		datastar.RenderFragment(sse,
			DIV().TextF("The time is %s", time.Now().UTC().Format(time.RFC3339)),
			datastar.WithQuerySelectorID("results"),
			datastar.WithMergeAppendElement(),
		)
		datastar.RenderFragment(sse, DIV().ID("container").DATASTAR_STORE(store), datastar.WithMergeUpsertAttributes())
	})

	return nil
}
