package site

import (
	"fmt"
	"log"
	"net/http"

	"github.com/delaneyj/datastar"
	lorem "github.com/drhodes/golorem"
	"github.com/go-chi/chi/v5"
)

func setupExamplesScrollIntoView(examplesRouter chi.Router) error {
	paragraphCount := 20
	paragraphs := make([]string, paragraphCount)
	for i := 0; i < paragraphCount; i++ {
		paragraphs[i] = lorem.Paragraph(40, 60)
	}

	opts := []ScrollIntoViewOption{
		{"behavior", []string{"smooth", "instant", "auto"}},
		{"block", []string{"vstart", "vcenter", "vend", "vnearest"}},
		{"inline", []string{"hstart", "hcenter", "hend", "hnearest"}},
	}
	// inlineOpts := []string{"hstart", "hcenter", "hend", "hnearest"}

	examplesRouter.Route("/scroll_into_view/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			store := &ScrollIntoViewStore{
				Behavior: "smooth",
				Block:    "vcenter",
				Inline:   "hcenter",
			}

			datastar.RenderFragmentTempl(sse, scrollIntoViewView(paragraphs, opts, store))
		})

		dataRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			store := &ScrollIntoViewStore{}
			if err := datastar.BodyUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sse := datastar.NewSSE(w, r)

			attr := "scroll-into-view"
			if store.Behavior != "" {
				attr += "." + store.Behavior
			}
			if store.Block != "" {
				attr += "." + store.Block
			}
			if store.Inline != "" {
				attr += "." + store.Inline
			}

			updated := fmt.Sprintf(`<p id="p%d" data-%s></p>`, paragraphCount/2, attr)

			log.Println(updated)
			datastar.RenderFragmentString(sse, updated, datastar.WithMergeUpsertAttributes())
		})
	})

	return nil
}
