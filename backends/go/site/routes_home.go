package site

import (
	"bytes"
	"net/http"

	datastar "github.com/delaneyj/datastar/backends/go"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/wcharczuk/go-chart/v2"
	"github.com/wcharczuk/go-chart/v2/drawing"
)

func setupHome(router chi.Router) error {

	chartWidth := 512
	graph := chart.BarChart{
		Title:  "File Size (Hello World) first load",
		Width:  chartWidth,
		Height: chartWidth * 9 / 16,
		Background: chart.Style{
			FillColor: drawing.Color{R: 1, G: 1, B: 1, A: 0},
			FontColor: drawing.ColorWhite,
		},
		Canvas: chart.Style{
			FillColor: drawing.Color{R: 1, G: 1, B: 1, A: 0},
			FontColor: drawing.ColorWhite,
			FontSize:  8,
		},
		TitleStyle: chart.Style{
			FontColor: drawing.ColorWhite,
		},
		XAxis: chart.Style{
			FontColor: drawing.ColorWhite,
		},
		YAxis: chart.YAxis{
			Style: chart.Style{
				FontColor: drawing.ColorWhite,
			},
			ValueFormatter: func(v any) string {
				return humanize.Bytes(uint64(v.(float64)))
			},
		},
		Bars: []chart.Value{
			{Label: "Next.js", Value: 86221},
			{Label: "SvelteKit", Value: 81920},
			{Label: "HTMX+\nhyper", Value: 40653},
			{Label: "HTMX+\nAlpine", Value: 37980},
			{Label: "Datastar", Value: 10445},
			{Label: "Datastar Core", Value: 4526},
		},
	}

	buffer := bytes.NewBuffer([]byte{})
	err := graph.Render(chart.SVG, buffer)
	if err != nil {
		panic(err)
	}
	svgChart := buffer.String()

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {

		page(
			DIV().CLASS("w-full min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-accent-700 to-accent-900").Children(
				DIV().
					CLASS("max-w-2xl flex flex-col gap-8").
					Children(
						datastarLogo().CLASS(
							"w-full md:w-64 md:h-64 fill-current text-accent-200",
							"animate__animated animate__pulse  animate__infinite animate__faster",
						),
						DIV().
							CLASS("font-brand font-bold text-6xl text-primary-200").
							Text("DATASTAR"),
						DIV().CLASS("font-brand text-lg").Text("Real-time hypermedia framework"),
						DIV(
							P().
								CLASS("text-primary-100 text-center").
								TextF(
									`Using a single <span class="font-bold text-lg text-primary-300">%s</span> CDN link and have access to everything needed to rival a full-stack SPA framework; all in the language of your choice.`,
									iifeBuildSize,
								),
						),
						DIV().CLASS("w-full").Text(svgChart),
						DIV().
							CLASS(
								"flex flex-col gap-6 border-dashed border-2 border-primary-300 p-4 rounded-lg",
								"bg-gradient-to-br from-primary-800 to-primary-900",
							).
							Children(
								DIV().
									CLASS("text-2xl font-bold").
									Children(Text("Example of a dynamically loaded area of page with shared global state")),
								DIV().
									ID("global-count-example").
									CLASS("flex justify-center p-4 items-center gap-4").
									DATASTAR_ON("load", datastar.GET("/api/globalCount")).
									Children(
										SPAN().
											CLASS("text-2xl").
											Text("Loading example on delay..."),
										svg_spinners.Eclipse().ID("spinner"),
									),
							),
						buttonLink().
							CLASS("w-full").
							HREF("/docs/intro").
							Text("Let's Get Started"),
					).CLASS("flex flex-col justify-center items-center"),
			),
		).Render(w)
	})

	return nil
}
