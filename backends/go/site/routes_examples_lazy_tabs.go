package site

import (
	"fmt"
	"log"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/go-faker/faker/v4"
)

func setupExamplesLazyTabs(examplesRouter chi.Router) error {
	tabs := make([]ElementRenderer, 8)
	for i := range tabs {
		paragraphs := make([]ElementRenderer, 5)
		for j := range paragraphs {
			paragraphs[j] = P(Text(faker.Paragraph()))
		}
		tabs[i] = Group(paragraphs...)
	}

	type Store struct {
		TabID int `json:"tabId"`
	}

	tabsToNode := func(activeIdx int) ElementRenderer {
		log.Printf("tabsToNode: %d", activeIdx)
		return DIV().
			ID("lazy_tabs").
			DATASTAR_STORE(Store{TabID: activeIdx}).
			CLASS("flex flex-col").
			Children(
				UL().
					CLASS("list-none flex border-b-2 border-accent-700").
					Children(
						RangeI(tabs, func(i int, t ElementRenderer) ElementRenderer {
							return LI().
								CLASS("flex-1 px-2 cursor-pointer ").
								Children(
									A().
										CLASS("text-lg flex justify-center items-center inline-block border-l border-t border-r rounded-t py-px hover:bg-accent-500").
										IfCLASS(i == activeIdx, "bg-accent-500").
										IfCLASS(i != activeIdx, "bg-accent-700").
										TextF("Tab %d", i).
										DATASTAR_ON(
											"click",
											fmt.Sprintf("$tabId=%d;$$get('/examples/lazy_tabs/data')", i),
										),
								)
						}),
					),
				DIV().
					ID("tab_content").
					CLASS("p-4 shadow-lg bg-base-200").
					Children(tabs[activeIdx]),
			)
	}

	examplesRouter.Get("/lazy_tabs/data", func(w http.ResponseWriter, r *http.Request) {
		store := &Store{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(sse, tabsToNode(store.TabID))
	})

	return nil
}
