package site

import (
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDisableButton(examplesRouter chi.Router) error {
	examplesRouter.Get("/disable_button/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		fragment := fmt.Sprintf(`<div>The time is %s</div>`, time.Now().UTC().Format(time.RFC3339))
		datastar.RenderFragmentString(sse, fragment, datastar.WithMergeAppend())

		time.Sleep(1 * time.Second)
		datastar.PatchStore(sse, map[string]any{
			"shouldDisable": false,
		})
	})

	return nil
}
