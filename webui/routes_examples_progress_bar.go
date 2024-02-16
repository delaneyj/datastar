package webui

import (
	"context"
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesProgressBar(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/progress_bar", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		lazyLoadRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)

			progress := 0

			for progress < 100 {
				progress = min(100, progress+rand.Intn(25)+1)
				datastar.RenderFragment(
					sse,
					DIV().
						ID("progress_bar").
						Children(
							Tern(
								progress == 100,
								A().
									HREF("/examples/progress_bar").
									CLASS("btn btn-success").
									Children(
										DIV().
											CLASS("flex gap-2 font-bold text-2xl").
											Children(
												material_symbols.CheckCircle(),
												Text("Completed! Try again"),
											),
									),
								DIV().
									CLASS("radial-progress text-primary").
									STYLE("--size", "12rem").
									STYLEF("--value", "%d", progress).
									Attr("ROLE", "progressbar").
									TextF("%d%%", progress),
							),
						),
				)

				time.Sleep(500 * time.Millisecond)
			}
		})
	})

	return nil
}
