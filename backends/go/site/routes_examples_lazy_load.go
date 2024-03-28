package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesLazyLoad(examplesRouter chi.Router) error {
	examplesRouter.Get("/lazy_load/data", func(w http.ResponseWriter, r *http.Request) {
		sse := toolbelt.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			DIV().
				ID("lazy_load").
				DATASTAR_ON("load", datastar.GET("/examples/lazy_load/graph")).
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

	examplesRouter.Get("/lazy_load/graph", func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(3 * time.Second)
		sp := staticPath("images/examples/tokyo.png")
		sse := toolbelt.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			IMG().
				ID("lazy_load").
				CLASS("transition-opacity").
				SRC(sp),
			datastar.WithSettleDuration(1*time.Second),
		)
	})

	return nil
}
