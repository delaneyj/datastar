package site

import (
	"math/rand"
	"net/http"
	"sync/atomic"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupAPI(router chi.Router) error {

	var globalCount = new(int32)
	c := int32(toolbelt.Fit(rand.Float32(), 0, 1, -100, 100))
	globalCount = &c

	type Store struct {
		Count int32 `json:"count"`
	}

	globalCountExample := func() ElementRenderer {
		store := &Store{
			Count: atomic.LoadInt32(globalCount),
		}
		return DIV().
			ID("global-count-example").
			CLASS("flex flex-col gap-2").
			DATASTAR_STORE(store).
			Children(
				DIV().
					CLASS("flex gap-2 justify-between items-center").
					Children(
						buttonLink(true).
							CLASS("text-xs p-1").
							DATASTAR_ON("click", "$count++").
							Text("Increment Global State  +"),
						buttonLink(true).
							CLASS("text-xs p-1").
							DATASTAR_ON("click", "$count--").
							Text("Decrement Global State  -"),
						DIV().
							CLASS("flex flex-col gap-2").
							Children(
								DIV().DATASTAR_TEXT("`Count is ${$count % 2 === 0 ? 'even' : 'odd'}`"),

								INPUT().
									CLASS("shadow appearance-none border border-accent-500 rounded w-full py-2 px-3 bg-accent-700 text-accent-200 leading-tight focus:outline-none focus:shadow-outline").
									TYPE("number").
									NAME("count").
									CustomData("model", "count"),
							),
					),
				DIV().
					CLASS("flex gap-4").
					Children(
						buttonLink(true).
							CLASS("flex-1").
							DATASTAR_ON("click", datastar.GET("/api/globalCount")).
							Text("Load global count"),
						buttonLink(true).
							CLASS("flex-1").
							DATASTAR_ON("click", datastar.POST("/api/globalCount")).
							Text("Store global count"),
					),
			)

	}

	router.Route("/api", func(apiRouter chi.Router) {
		apiRouter.Route("/globalCount", func(globalCountRouter chi.Router) {
			globalCountRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, globalCountExample())
			})

			globalCountRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				store := &Store{}
				if err := datastar.BodyUnmarshal(r, store); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				atomic.StoreInt32(globalCount, store.Count)
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, globalCountExample())
			})
		})
	})

	return nil
}
