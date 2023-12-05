package webui

import (
	"context"
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
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
					DIV(
						ID("progress_bar"),
						TERNCached(
							progress == 100,
							A(
								HREF("/examples/progress_bar"),
								CLS("btn btn-success"),
								DIV(
									CLS("flex gap-2 font-bold text-2xl"),
									material_symbols.CheckCircle(),
									TXT("Completed! Try again"),
								),
							),
							DIV(
								CLS("radial-progress text-primary"),
								STYLEF("--value: %d; --size:12rem;", progress),
								ATTR("ROLE", "progressbar"),
								TXTF("%d%%", progress),
							),
						),
					),
				)
				time.Sleep(500 * time.Millisecond)
			}
		})
	})

	return nil
}
