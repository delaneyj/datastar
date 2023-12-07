package webui

import (
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/maragudk/gomponents"
)

func setupExamplesShoelaceKitchensink(ctx context.Context, examplesRouter chi.Router) error {

	examplesRouter.Route("/shoelace_kitchensink", func(shoelaceKitchenSinkRouter chi.Router) {
		shoelaceKitchenSinkRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		shoelaceKitchenSinkRouter.Route("/data", func(dataRouter chi.Router) {
			type Input struct {
				Label     string `json:"label"`
				Selection int    `json:"selection"`
			}

			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)

				input := &Input{
					Label:     "Select an option",
					Selection: 0,
				}

				datastar.RenderFragment(sse,
					DIV(
						ID("shoelace_kitchensink"),
						CLS("sl-theme-dark"),
						datastar.MergeStore(input),
						gomponents.El("sl-input",
							ATTR("label", "Label"),
							DATA("model", "label"),
						),
						gomponents.El("sl-select",
							ATTR("label", "Select"),
							DATA("model", "selection"),
							gomponents.El("sl-option",
								ATTR("value", "0"),
								TXT("Option 1"),
							),
							gomponents.El("sl-option",
								ATTR("value", "1"),
								TXT("Option 2"),
							),
							gomponents.El("sl-option",
								ATTR("value", "2"),
								TXT("Option 3"),
							),
						),
						gomponents.El("sl-radio-group",
							ATTR("label", "Radio Group"),
							DATA("model", "selection"),
							gomponents.El("sl-radio-button",
								ATTR("value", "0"),
								TXT("Option 1"),
							),
							gomponents.El("sl-radio-button",
								ATTR("value", "1"),
								TXT("Option 2"),
							),
							gomponents.El("sl-radio-button",
								ATTR("value", "2"),
								TXT("Option 3"),
							),
						),

						PRE(datastar.Text("JSON.stringify({label:$label,selection:$selection},null,2)")),
					),
				)
			})

			dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {

			})
		})
	})

	return nil
}
