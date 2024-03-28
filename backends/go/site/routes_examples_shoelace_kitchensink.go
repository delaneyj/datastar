package site

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupExamplesShoelaceKitchensink(examplesRouter chi.Router) error {
	examplesRouter.Route("/shoelace_kitchensink/data", func(dataRouter chi.Router) {
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

		options := lo.Map(lo.Range(7), func(i, index int) Option {
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
				DIV().
					ID("shoelace_kitchensink").
					CLASS("sl-theme-dark flex flex-col gap-4").
					DATASTAR_MERGE_STORE(input).
					Children(
						SL_INPUT().
							LABEL("Label").
							DATASTAR_MODEL("nested.label"),
						SL_SELECT().
							LABEL("Select (Checking if int64's work)").
							DATASTAR_MODEL("nested.selection").
							DATASTAR_ON("sl-change", "console.log('change')").
							Children(
								Range(options, func(o Option) ElementRenderer {
									return SL_OPTION().
										VALUE(fmt.Sprint(o.Value)).
										TextF("%s (%d)", o.Label, o.Value)
								}),
							),
						SL_RADIOGROUP().
							LABEL("Radio Group").
							DATASTAR_MODEL("nested.selection").
							Children(
								Range(options, func(o Option) ElementRenderer {
									return SL_RADIOBUTTON().
										VALUE(fmt.Sprint(o.Value)).
										Text(o.Label)
								}),
							),
						SL_CHECKBOX().
							DATASTAR_MODEL("nested.isChecked").
							Text("Checkbox"),
						SL_BUTTON().
							VARIANT(SLButtonVariant_primary).
							Text("Submit").
							DATASTAR_ON("click", datastar.POST(r.URL.Path)),
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

	return nil
}
