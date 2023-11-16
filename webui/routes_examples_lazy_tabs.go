package webui

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/go-faker/faker/v4"
)

func setupExamplesLazyTabs(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/lazy_tabs", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		tabs := make(NODES, 8)
		for i := range tabs {
			paragraphs := make(NODES, 5)
			for j := range paragraphs {
				paragraphs[j] = P(TXT(faker.Paragraph()))
			}
			tabs[i] = GRP(paragraphs...)
		}

		tabsToNode := func(activeIdx int) NODE {
			return DIV(
				ID("lazy_tabs"),
				DIV(
					CLS("tabs tabs-bordered"),
					RANGEI(tabs, func(i int, t NODE) NODE {
						return BUTTON(
							ID(fmt.Sprintf("tab_%d", i)),
							CLSS{
								"tab":        true,
								"tab-active": i == activeIdx,
							},
							TXTF("Tab %d", i),
							datastar.FetchURLF("'/examples/lazy_tabs/data?tabId=%d'", i),
							datastar.On("click", datastar.GET_ACTION),
						)
					}),
				),
				DIV(
					ID("tab_content"),
					CLS("p-4 shadow-lg bg-base-200"),
					tabs[activeIdx],
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
