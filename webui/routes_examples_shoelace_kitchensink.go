package webui

import (
	"context"
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/maragudk/gomponents"
	"github.com/samber/lo"
)

func setupExamplesShoelaceKitchensink(ctx context.Context, examplesRouter chi.Router) error {

	examplesRouter.Route("/shoelace_kitchensink", func(shoelaceKitchenSinkRouter chi.Router) {
		shoelaceKitchenSinkRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		shoelaceKitchenSinkRouter.Route("/data", func(dataRouter chi.Router) {
			type Nested struct {
				Label     string `json:"label"`
				Selection int64  `json:"selection"`
			}
			type Input struct {
				Nested *Nested `json:"nested"`
			}

			type Option struct {
				Label string `json:"label"`
				Value int64  `json:"value"`
			}

			options := lo.Map(lo.Range(10), func(i, index int) Option {
				// offset := 100199071137923140 + int64(index)
				offset := toolbelt.NextID()
				return Option{
					Label: fmt.Sprintf("Option %d", i),
					Value: offset,
				}
			})

			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)

				input := &Input{
					Nested: &Nested{
						Label:     "Hello World",
						Selection: options[0].Value,
					},
				}

				datastar.RenderFragment(sse,
					DIV(
						ID("shoelace_kitchensink"),
						CLS("sl-theme-dark"),
						datastar.MergeStore(input),
						gomponents.El("sl-input",
							ATTR("label", "Label"),
							DATA("model", "nested.label"),
						),
						gomponents.El("sl-select",
							ATTR("label", "Select (Checking if int64's work)"),
							DATA("model", "nested.selection"),
							RANGE(options, func(o Option) gomponents.Node {
								return gomponents.El("sl-option",
									ATTR("value", fmt.Sprint(o.Value)),
									TXTF("%s (%d)", o.Label, o.Value),
								)
							}),
						),
						gomponents.El("sl-radio-group",
							ATTR("label", "Radio Group"),
							DATA("model", "nested.selection"),
							RANGE(options, func(o Option) gomponents.Node {
								return gomponents.El("sl-radio-button",
									ATTR("value", fmt.Sprint(o.Value)),
									TXT(o.Label),
								)
							}),
						),

						SignalStore,
					),
				)
			})

			dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {

			})
		})
	})

	return nil
}
