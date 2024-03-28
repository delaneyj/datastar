package site

import (
	"fmt"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesInfiniteScroll(examplesRouter chi.Router) error {

	type Store struct {
		Limit  int `json:"limit"`
		Offset int `json:"offset"`
	}

	renderAgentRow := func(i int) ElementRenderer {
		return TR().
			ID(fmt.Sprintf("agent_%d", i)).
			Children(
				TD(TextF("Agent Smith %x", i)),
				TD(TextF("void%d@null.org", i+1)),
				TD().CLASS("uppercase").TextF("%x", toolbelt.AliasHash(fmt.Sprint(i))),
			)
	}

	renderAgentRows := func(input *Store) []ElementRenderer {
		arr := make([]ElementRenderer, input.Limit)
		for i := range arr {
			arr[i] = renderAgentRow(i + input.Offset)
		}

		return arr
	}

	moreDiv := func(store *Store) ElementRenderer {
		return DIV().
			ID("more_btn").
			DATASTAR_INTERSECTS(fmt.Sprintf(
				"$offset=%d;$limit=%d;%s",
				store.Offset+store.Limit,
				store.Limit,
				datastar.GET("/examples/infinite_scroll/data"),
			)).
			Children(
				DIV().
					CLASS("flex justify-center text-4xl gap-2").
					Children(
						svg_spinners.BlocksWave(),
						Text("Loading..."),
					),
			)
	}

	renderAgentsTable := func(store *Store) ElementRenderer {
		arr := make([]int, store.Limit)
		for i := range arr {
			arr[i] = i + store.Offset
		}

		return DIV().
			ID("infinite_scroll").
			DATASTAR_MERGE_STORE(store).
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
								Group(renderAgentRows(store)...),
							),
					),
				moreDiv(store),
			)
	}

	// infiniteScrollingRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	examplesRouter.Get("/infinite_scroll/data", func(w http.ResponseWriter, r *http.Request) {
		store := &Store{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if store.Limit < 1 || store.Limit > 100 {
			store.Limit = 10
		}

		sse := toolbelt.NewSSE(w, r)

		if store.Offset == 0 {
			datastar.RenderFragment(sse, renderAgentsTable(store))
		} else {
			time.Sleep(2 * time.Second)
			datastar.RenderFragment(
				sse, moreDiv(store),
				datastar.WithQuerySelectorID("more_btn"),
			)
			for _, node := range renderAgentRows(store) {
				datastar.RenderFragment(
					sse, node,
					datastar.WithQuerySelectorID("click_to_load_rows"),
					datastar.WithMergeAppendElement(),
				)
			}
		}
	})

	return nil
}
