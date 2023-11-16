package webui

import (
	"context"
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
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

		renderAgentRow := func(i int) NODE {
			return TR(
				ID(fmt.Sprintf("agent_%d", i)),
				TD(TXT("Agent Smith")),
				TD(TXT(fmt.Sprintf("void%d@null.org", i+1))),
				TD(
					CLS("uppercase"),
					TXTF("%x", toolbelt.AliasHash(fmt.Sprint(i))),
				),
			)
		}

		renderAgentRows := func(input *Input) NODES {
			arr := make(NODES, input.Limit)
			for i := range arr {
				arr[i] = renderAgentRow(i + input.Offset)
			}

			return arr
		}

		moreButton := func(input *Input) NODE {
			return BUTTON(
				ID("more_btn"),
				CLS("btn btn-primary"),
				// datastar.Header("Accept", "datastar/fragments"),
				datastar.FetchURL(fmt.Sprintf("'/examples/click_to_load/data?offset=%d&limit=%d'", input.Offset+input.Limit, input.Limit)),
				datastar.On("click", "$$get"),
				TXT("Load More"),
			)
		}

		renderAgentsTable := func(input *Input) NODE {
			arr := make([]int, input.Limit)
			for i := range arr {
				arr[i] = i + input.Offset
			}

			return DIV(
				CLS("flex flex-col gap-2"),
				TABLE(
					CLS("table w-full"),
					CAPTION(TXT("Agents")),
					THEAD(
						TR(
							TH(TXT("Name")),
							TH(TXT("Email")),
							TH(TXT("ID")),
						),
					),
					TBODY(
						ID("click_to_load_rows"),
						GRP(renderAgentRows(input)...),
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
