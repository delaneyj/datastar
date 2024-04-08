package site

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesProgressBar(examplesRouter chi.Router) error {

	examplesRouter.Get("/progress_bar/data", func(w http.ResponseWriter, r *http.Request) {
		sse := toolbelt.NewSSE(w, r)

		progress := 0

		for progress < 100 {
			progress = min(100, progress+rand.Intn(10)+1)
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
							SVG_SVG().
								WIDTH("200").
								HEIGHT("200").
								Attr("viewbox", "-25 -25 250 250").
								STYLE("transform", "rotate(-90deg)").
								Children(
									SVG_CIRCLE().Attrs(
										"r", "90",
										"cx", "100",
										"cy", "100",
										"fill", "transparent",
										"stroke", "#e0e0e0",
										"stroke-width", "16px",
										"stroke-dasharray", "565.48px",
										"stroke-dashoffset", "565px",
									),
									SVG_CIRCLE().Attrs(
										"r", "90",
										"cx", "100",
										"cy", "100",
										"fill", "transparent",
										"stroke", "#6bdba7",
										"stroke-width", "16px",
										"stroke-linecap", "round",
										"stroke-dashoffset", fmt.Sprintf("%dpx", int(toolbelt.Fit(float32(progress), 0, 100, 565, 0))),
										"stroke-dasharray", "565.48px",
									),
									SVG_TEXT().Attrs(
										"x", "44px",
										"y", "115px",
										"fill", "#6bdba7",
										"font-size", "52px",
										"font-weight", "bold",
										"style", "transform:rotate(90deg) translate(0px, -196px)",
									).TextF("%d%%", progress),
								),
						),
					),
			)

			time.Sleep(500 * time.Millisecond)
		}
	})

	return nil
}
