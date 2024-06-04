package site

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesProgressBar(examplesRouter chi.Router) error {

	examplesRouter.Get("/progress_bar/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		progress := 0

		for progress < 100 {
			progress = min(100, progress+rand.Intn(20)+1)
			datastar.RenderFragmentTempl(sse, progressBarView(progress))
			time.Sleep(250 * time.Millisecond)
		}
	})

	return nil
}
