package site

import (
	"log"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	lorem "github.com/drhodes/golorem"
	"github.com/go-chi/chi/v5"
	"github.com/valyala/bytebufferpool"
)

func setupExamplesScrollIntoView(examplesRouter chi.Router) error {
	paragraphCount := 20
	paragraphs := make([]string, paragraphCount)
	for i := 0; i < paragraphCount; i++ {
		paragraphs[i] = lorem.Paragraph(40, 60)
	}

	type Store struct {
		Behavior string `json:"behavior"`
		Block    string `json:"block"`
		Inline   string `json:"inline"`
	}

	type Options struct {
		Label  string
		Values []string
	}

	opts := []Options{
		{"behavior", []string{"smooth", "instant", "auto"}},
		{"block", []string{"vstart", "vcenter", "vend", "vnearest"}},
		{"inline", []string{"hstart", "hcenter", "hend", "hnearest"}},
	}
	// inlineOpts := []string{"hstart", "hcenter", "hend", "hnearest"}

	examplesRouter.Route("/scroll_into_view/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			store := &Store{
				Behavior: "smooth",
				Block:    "vcenter",
				Inline:   "hcenter",
			}

			contents := DIV().
				ID("replaceMe").
				DATASTAR_STORE(store).
				Children(
					DIV().
						CLASS("flex flex-wrap gap-8 justify-center").
						Children(
							Range(opts, func(o Options) ElementRenderer {
								return DIV().
									CLASS("flex flex-col gap-2").
									Children(
										H3().Text(o.Label),
										SELECT().
											ID(o.Label).
											CLASS("bg-accent-800 border border-accent-600 text-accent-200 text-sm rounded-lg focus:ring-accent-400 focus:border-accent-400 block w-full p-2.5").
											DATASTAR_MODEL(o.Label).
											Children(
												Range(o.Values, func(v string) ElementRenderer {
													return OPTION().Text(v).VALUE(v)
												}),
											),
									)
							}),
							BUTTON().
								CLASS("bg-accent-800 border border-accent-600 text-accent-200 text-sm rounded-lg focus:ring-accent-400 focus:border-accent-400 block w-full p-2.5").
								Text("Scroll into view").
								DATASTAR_ON("click", datastar.PUT("/examples/scroll_into_view/data")),
						),
					RangeI(paragraphs, func(i int, p string) ElementRenderer {
						isMiddle := i == paragraphCount/2
						return Group(
							P().IDF("p%d", i).Text(p).IfCLASS(isMiddle, "bg-accent-800 text-accent-200 p-4 rounded-lg"),
							// If(isMiddle, A().HREF("#replaceMe").Text("Back to top")),
						)
					}),
				)
			datastar.RenderFragment(sse, contents)
		})

		dataRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
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

			updated := P().IDF("p%d", paragraphCount/2).CustomData(attr, "")
			buf := bytebufferpool.Get()
			defer bytebufferpool.Put(buf)
			updated.Render(buf)
			log.Println(buf.String())
			datastar.RenderFragment(sse, updated, datastar.WithMergeUpsertAttributes())
		})
	})

	return nil
}
