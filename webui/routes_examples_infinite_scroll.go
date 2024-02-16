package webui

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
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

		renderAgentRow := func(i int) ElementRenderer {
			return TR().
				ID(fmt.Sprintf("agent_%d", i)).
				Children(
					TD(Text("Agent Smith")),
					TD(TextF("void%d@null.org", i+1)),
					TD().CLASS("uppercase").TextF("%x", toolbelt.AliasHash(fmt.Sprint(i))),
				)
		}

		renderAgentRows := func(input *Input) []ElementRenderer {
			arr := make([]ElementRenderer, input.Limit)
			for i := range arr {
				arr[i] = renderAgentRow(i + input.Offset)
			}

			return arr
		}

		moreDiv := func(input *Input) ElementRenderer {
			return DIV().
				ID("more_btn").
				DATASTAR_FETCH_URL(fmt.Sprintf("'/examples/infinite_scroll/data?offset=%d&limit=%d'", input.Offset+input.Limit, input.Limit)).
				DATASTAR_INTERSECTS(datastar.GET_ACTION).
				Children(
					DIV().
						CLASS("flex justify-center text-4xl gap-2").
						Children(
							svg_spinners.BlocksWave(),
							Text("Loading..."),
						),
				)
		}

		renderAgentsTable := func(input *Input) ElementRenderer {
			arr := make([]int, input.Limit)
			for i := range arr {
				arr[i] = i + input.Offset
			}

			return DIV().
				ID("infinite_scroll").
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
