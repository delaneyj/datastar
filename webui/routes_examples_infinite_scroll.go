package webui

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/svg_spinners"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/ggicci/httpin"
	"github.com/go-chi/chi/v5"
)

func setupExamplesInfiniteScroll(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/infinite_scroll", func(infiniteScrollingRouter chi.Router) {
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

		moreDiv := func(input *Input) NODE {
			return DIV(
				ID("more_btn"),
				datastar.FetchURL(fmt.Sprintf("'/examples/infinite_scroll/data?offset=%d&limit=%d'", input.Offset+input.Limit, input.Limit)),
				datastar.Intersects(datastar.GET_ACTION),
				DIV(
					CLS("flex justify-center text-4xl gap-2"),
					svg_spinners.BlocksWave(),
					TXT("Loading..."),
				),
			)
		}

		renderAgentsTable := func(input *Input) NODE {
			arr := make([]int, input.Limit)
			for i := range arr {
				arr[i] = i + input.Offset
			}

			return DIV(
				ID("infinite_scroll"),
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
				moreDiv(input),
			)
		}

		infiniteScrollingRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		infiniteScrollingRouter.With(httpin.NewInput(Input{})).Get("/data", func(w http.ResponseWriter, r *http.Request) {
			input := r.Context().Value(httpin.Input).(*Input)

			sse := toolbelt.NewSSE(w, r)

			if input.Offset == 0 {
				datastar.RenderFragment(sse, renderAgentsTable(input))
			} else {
				time.Sleep(2 * time.Second)
				datastar.RenderFragment(
					sse, moreDiv(input),
					datastar.WithQuerySelectorID("more_btn"),
				)
				for _, node := range renderAgentRows(input) {
					datastar.RenderFragment(
						sse, node,
						datastar.WithQuerySelectorID("click_to_load_rows"),
						datastar.WithMergeAppendElement(),
					)
				}
			}
		})
	})

	return nil
}
