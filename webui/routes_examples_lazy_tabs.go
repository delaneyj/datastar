package webui

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/go-faker/faker/v4"
)

func setupExamplesLazyTabs(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/lazy_tabs", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		tabs := make([]ElementRenderer, 8)
		for i := range tabs {
			paragraphs := make([]ElementRenderer, 5)
			for j := range paragraphs {
				paragraphs[j] = P(Text(faker.Paragraph()))
			}
			tabs[i] = Group(paragraphs...)
		}

		tabsToNode := func(activeIdx int) ElementRenderer {
			return DIV().
				ID("lazy_tabs").
				Children(
					DIV().
						CLASS("tabs tabs-bordered").
						Children(
							RangeI(tabs, func(i int, t ElementRenderer) ElementRenderer {
								return BUTTON().
									ID(fmt.Sprintf("tab_%d", i)).
									CLASS("tab").
									IfCLASS(i == activeIdx, "tab-active").
									TextF("Tab %d", i).
									DATASTAR_FETCH_URL(fmt.Sprintf("'/examples/lazy_tabs/data?tabId=%d'", i)).
									DATASTAR_ON("click", datastar.GET_ACTION)
							}),
							DIV().
								ID("tab_content").
								CLASS("p-4 shadow-lg bg-base-200").
								Children(tabs[activeIdx]),
						),
				)
		}

		lazyLoadRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			tabIDStr := r.URL.Query().Get("tabId")
			if tabIDStr == "" {
				tabIDStr = "0"
			}
			tabID, err := strconv.Atoi(tabIDStr)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(sse, tabsToNode(tabID))
		})
	})

	return nil
}
