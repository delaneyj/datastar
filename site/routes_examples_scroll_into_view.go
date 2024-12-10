package site

import (
	"net/http"

	lorem "github.com/drhodes/golorem"
	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/sdk/go"
)

func setupExamplesScrollIntoView(examplesRouter chi.Router) error {
	paragraphCount := 20
	paragraphs := make([]string, paragraphCount)
	for i := 0; i < paragraphCount; i++ {
		paragraphs[i] = lorem.Paragraph(40, 60)
	}

	opts := []ScrollIntoViewOption{
		{"behavior", []string{"smooth", "instant", "auto"}},
		{"block", []string{"start", "center", "end", "nearest"}},
		{"inline", []string{"start", "center", "end", "nearest"}},
	}
	// inlineOpts := []string{"hstart", "hcenter", "hend", "hnearest"}

	examplesRouter.Route("/scroll_into_view/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			signals := &ScrollIntoViewSignals{
				Behavior: "smooth",
				Block:    "center",
				Inline:   "center",
			}

			sse.MergeFragmentTempl(scrollIntoViewView(paragraphs, opts, signals))
		})

		dataRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			signals := &ScrollIntoViewSignals{}
			if err := datastar.ReadSignals(r, signals); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sse := datastar.NewSSE(w, r)
			c := scrollIntoViewFragment(paragraphCount/2, *signals)
			sse.MergeFragmentTempl(c, datastar.WithMergeUpsertAttributes())
		})
	})

	return nil
}
