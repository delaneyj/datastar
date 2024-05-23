package site

import (
	"fmt"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesClickToLoad(examplesRouter chi.Router) error {

	renderAgentRow := func(i int) ElementRenderer {
		return TR().
			ID(fmt.Sprintf("agent_%d", i)).
			Children(
				TD().Text("Agent Smith"),
				TD().TextF("void%d@null.org", i+1),
				TD().CLASS("uppercase").TextF("%x", toolbelt.AliasHash(fmt.Sprint(i))),
			)

	}

	type Input struct {
		SidebarOpen bool `json:"_sidebarOpen"`
		Limit       int  `json:"limit"`
		Offset      int  `json:"offset"`
	}

	renderAgentRows := func(input *Input) []ElementRenderer {
		arr := make([]ElementRenderer, input.Limit)
		for i := range arr {
			arr[i] = renderAgentRow(i + input.Offset)
		}

		return arr
	}

	moreButton := func(input *Input) ElementRenderer {
		expression := fmt.Sprintf(
			"$offset=%d; $limit=%d; %s",
			input.Offset+input.Limit,
			input.Limit,
			datastar.GET("/examples/click_to_load/data"),
		)
		return BUTTON().
			ID("more_btn").
			CLASS("btn btn-primary").
			DATASTAR_ON("click", expression).
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
							DATASTAR_STORE(input).
							Children(
								Group(renderAgentRows(input)...),
							),
					),
				moreButton(input),
			)

	}

	// clickToLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	examplesRouter.Get("/click_to_load/data", func(w http.ResponseWriter, r *http.Request) {
		input := &Input{}
		if err := datastar.QueryStringUnmarshal(r, input); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		if input.Limit < 1 {
			input.Limit = 10
		} else if input.Limit > 100 {
			input.Limit = 100
		}
		if input.Offset < 0 {
			input.Offset = 0
		}

		sse := datastar.NewSSE(w, r)

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

	return nil
}
