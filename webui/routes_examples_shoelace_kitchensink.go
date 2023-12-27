package webui

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
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
				IsChecked bool   `json:"isChecked"`
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
						Label:     fmt.Sprintf("Hello World %d", rand.Intn(100)),
						Selection: options[rand.Intn(len(options))].Value,
						IsChecked: true,
					},
				}

				datastar.RenderFragment(sse,
					DIV(
						ID("shoelace_kitchensink"),
						CLS("sl-theme-dark"),
						datastar.MergeStore(input),
						gomponents.El("sl-input",
							ATTR("label", "Label"),
							datastar.Model("nested.label"),
						),
						gomponents.El("sl-select",
							ATTR("label", "Select (Checking if int64's work)"),
							datastar.Model("nested.selection"),
							datastar.On("sl-change", "console.log('change')"),
							RANGE(options, func(o Option) gomponents.Node {
								return gomponents.El("sl-option",
									ATTR("value", fmt.Sprint(o.Value)),
									TXTF("%s (%d)", o.Label, o.Value),
								)
							}),
						),
						gomponents.El("sl-radio-group",
							ATTR("label", "Radio Group"),
							datastar.Model("nested.selection"),
							RANGE(options, func(o Option) gomponents.Node {
								return gomponents.El("sl-radio-button",
									ATTR("value", fmt.Sprint(o.Value)),
									TXT(o.Label),
								)
							}),
						),
						gomponents.El("sl-checkbox",
							datastar.Model("nested.isChecked"),
							TXT("Checkbox"),
						),
						gomponents.El("sl-button",
							ATTR("type", "primary"),
							TXT("Submit"),
							datastar.FetchURLF("'%s'", r.URL.Path),
							datastar.On("click", datastar.POST_ACTION),
						),
						SignalStore,
					),
				)
			})

			dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				var res any
				if err := datastar.BodyUnmarshal(r, &res); err != nil {
					datastar.Error(sse, err)
					return
				}

				log.Printf("res: %#v", res)
			})
		})
	})

	return nil
}
