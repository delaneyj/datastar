package webui

import (
	"context"
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/ggicci/httpin"
	"github.com/go-chi/chi/v5"
)

func setupExamplesClickToLoad(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/click_to_load", func(clickToLoadRouter chi.Router) {
		type Input struct {
			DatastarRequest bool `in:"header=datastar-request;default=false"`
			Limit           int  `in:"query=limit;default=10"`
			Offset          int  `in:"query=offset;default=0"`
		}

		renderAgentRow := func(i int) ElementRenderer {
			return TR().
				ID(fmt.Sprintf("agent_%d", i)).
				Children(
					TD(Text("Agent Smith")),
					TD(TextF("void%d@null.org", i+1)),
					TD(
						Text("uppercase"),
						TextF("%x", toolbelt.AliasHash(fmt.Sprint(i))),
					),
				)

		}

		renderAgentRows := func(input *Input) []ElementRenderer {
			arr := make([]ElementRenderer, input.Limit)
			for i := range arr {
				arr[i] = renderAgentRow(i + input.Offset)
			}

			return arr
		}

		moreButton := func(input *Input) ElementRenderer {
			return BUTTON().
				ID("more_btn").
				CLASS("btn btn-primary").
				DATASTAR_FETCH_URL(fmt.Sprintf("'/examples/click_to_load/data?offset=%d&limit=%d'", input.Offset+input.Limit, input.Limit)).
				DATASTAR_ON("click", datastar.GET_ACTION).
				Text("Load More")
		}

		renderAgentsTable := func(input *Input) ElementRenderer {
			arr := make([]int, input.Limit)
			for i := range arr {
				arr[i] = i + input.Offset
			}

			return DIV().
				CLASS("flex flex-col gap-2").
				Children(
					TABLE().
						CLASS("table w-full").
						Children(
							CAPTION(Text("Agents")),
							THEAD(
								TR(
									TH(Text("Name")),
									TH(Text("Email")),
									TH(Text("ID")),
								),
							),
							TBODY().
								ID("click_to_load_rows").
								Children(
									Group(renderAgentRows(input)...),
								),
						),
					moreButton(input),
				)

		}

		clickToLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		clickToLoadRouter.With(httpin.NewInput(Input{})).Get("/data", func(w http.ResponseWriter, r *http.Request) {
			input := r.Context().Value(httpin.Input).(*Input)

			sse := toolbelt.NewSSE(w, r)

			if input.Offset == 0 {
				datastar.RenderFragmentSelf(sse, renderAgentsTable(input))
			} else {
				datastar.RenderFragment(sse, moreButton(input))
				for _, node := range renderAgentRows(input) {
					datastar.RenderFragment(
						sse,
						node,
						datastar.WithQuerySelectorID("click_to_load_rows"),
						datastar.WithMergeAppendElement(),
					)
				}
			}
		})
	})

	return nil
}
