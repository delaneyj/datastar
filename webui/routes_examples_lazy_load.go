package webui

import (
	"context"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesLazyLoad(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/lazy_load", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		lazyLoadRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				DIV().
					ID("lazy_load").
					DATASTAR_FETCH_URL("'/examples/lazy_load/graph'").
					DATASTAR_ON("load", datastar.GET_ACTION).
					Children(
						DIV().
							CLASS("flex justify-center text-4xl gap-2").
							Children(
								svg_spinners.BlocksWave(),
								Text("Loading..."),
							),
					),
			)
		})

		lazyLoadRouter.Get("/graph", func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(1 * time.Second)
			sp := staticPath("images/tokyo.png")
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				IMG().
					ID("lazy_load").
					CLASS("transition-opacity").
					SRC(sp),
				datastar.WithSettleDuration(150*time.Millisecond),
			)
		})
	})

	return nil
}
