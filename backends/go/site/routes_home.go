package site

import (
	"bytes"
	"math/rand"
	"net/http"
	"sync/atomic"

	// . "github.com/delaneyj/gostar/elements"

	"github.com/a-h/templ"
	"github.com/delaneyj/datastar"
	"github.com/delaneyj/toolbelt"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/wcharczuk/go-chart/v2"
	"github.com/wcharczuk/go-chart/v2/drawing"
)

var homePageChartSVG string

func setupHome(router chi.Router) error {

	chartWidth := 480
	graph := chart.BarChart{
		Title:  "File Size (Hello World) first load",
		Width:  chartWidth,
		Height: chartWidth,
		Background: chart.Style{
			FillColor: drawing.Color{R: 1, G: 1, B: 1, A: 0},
			FontColor: drawing.ColorWhite,
		},
		Canvas: chart.Style{
			FillColor: drawing.Color{R: 1, G: 1, B: 1, A: 0},
			FontColor: drawing.ColorWhite,
			FontSize:  6,
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
			{Label: "HTMX+\nhyperscript", Value: 40653},
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
	homePageChartSVG = buffer.String()

	var globalCount = new(int32)
	c := int32(toolbelt.Fit(rand.Float32(), 0, 1, -100, 100))
	globalCount = &c

	globalCountExample := func() templ.Component {
		store := &GlobalCountStore{
			Count: atomic.LoadInt32(globalCount),
		}
		return HomeGlobalCountExample(*store)
	}

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		Home().Render(r.Context(), w)
	})

	router.Route("/api", func(apiRouter chi.Router) {
		apiRouter.Route("/globalCount", func(globalCountRouter chi.Router) {
			globalCountRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := datastar.NewSSE(w, r)
				datastar.RenderFragmentTempl(sse, globalCountExample())
			})

			globalCountRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
				store := &GlobalCountStore{}
				if err := datastar.BodyUnmarshal(r, store); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				atomic.StoreInt32(globalCount, store.Count)
				sse := datastar.NewSSE(w, r)
				datastar.RenderFragmentTempl(sse, globalCountExample())
			})
		})
	})

	return nil
}
