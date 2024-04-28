package site

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/go-chi/chi/v5"
)

func setupExamplesAnimations(examplesRouter chi.Router) error {
	// lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	type Color struct {
		Label string `json:"label"`
		Value int    `json:"value"`
	}

	fgPal := []Color{
		{Label: "red", Value: 0xfb4934},
		{Label: "green", Value: 0xb8bb26},
		{Label: "yellow", Value: 0xfabd2f},
		{Label: "blue", Value: 0x83a598},
		{Label: "purple", Value: 0xd3869b},
		{Label: "aqua", Value: 0x8ec07c},
		{Label: "orange", Value: 0xfe8019},
	}

	bgPal := []Color{
		{Label: "red", Value: 0x9d0006},
		{Label: "green", Value: 0x79740e},
		{Label: "yellow", Value: 0xb57614},
		{Label: "blue", Value: 0x458588},
		{Label: "purple", Value: 0x8f3f71},
		{Label: "aqua", Value: 0x427b58},
		{Label: "orange", Value: 0xaf3a03},
	}

	type RestoreStore struct {
		ShouldRestore bool `json:"shouldRestore"`
	}

	renderViewTransition := func(sse *datastar.ServerSentEventsHandler, store *RestoreStore) {
		datastar.RenderFragment(
			sse,
			DIV().
				ID("view_transition").
				DATASTAR_STORE(store).
				CLASS("slide-it").
				Children(
					BUTTON().
						CLASS("btn btn-primary").
						DATASTAR_ON("click", datastar.GET("/examples/animations/data/view_transition")).
						Children(
							Tern(store.ShouldRestore, material_symbols.ArrowLeft(), material_symbols.ArrowRight()),
							Tern(store.ShouldRestore, Text("Restore It!"), Text("Swap It!")),
						),
				),
		)
	}

	examplesRouter.Route("/animations/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			datastar.RenderFragment(
				sse,
				BUTTON().
					ID("fade_out_swap").
					CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-error-700 hover:bg-error-600").
					DATASTAR_ON("click", datastar.DELETE("/examples/animations/data")).
					Children(
						material_symbols.Delete(),
						Text("Fade out then delete on click"),
					),
			)

			datastar.RenderFragment(
				sse,
				BUTTON().
					ID("fade_me_in").
					CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600").
					DATASTAR_ON("click", datastar.GET("/examples/animations/data/fade_me_in")).
					Children(
						material_symbols.Add(),
						Text("Fade me in on click"),
					),
			)

			datastar.RenderFragment(
				sse,
				DIV().
					ID("request_in_flight").
					CLASS("flex flex-col gap-4").
					Children(
						DIV().
							CLASS("form-control").
							Children(
								LABEL(Text("Name")).CLASS("label label-text"),
								DIV().
									CLASS("flex gap-2 items-center").
									Children(
										INPUT().
											TYPE("text").
											NAME("name").
											CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5"),
										DIV().
											ID("request_in_flight_indicator").
											Children(
												svg_spinners.BlocksWave().CLASS("text-xl"),
											),
									),
							),
						BUTTON().
							ID("submit_request_in_flight").
							CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600").
							DATASTAR_ON("click", datastar.POST("/examples/animations/data/request_in_flight")).
							DATASTAR_FETCH_INDICATOR("'#request_in_flight_indicator'").
							Children(
								material_symbols.PersonAdd(),
								Text("Submit"),
							),
					),
			)

			renderViewTransition(sse, &RestoreStore{ShouldRestore: false})

			colorThrobTicker := time.NewTicker(2 * time.Second)
			for {
				select {
				case <-r.Context().Done():
					return
				case <-colorThrobTicker.C:
					fg := fgPal[rand.Intn(len(fgPal))]
					bg := bgPal[rand.Intn(len(bgPal))]

					datastar.RenderFragment(
						sse,
						DIV().
							ID("color_throb").
							CustomData("testid", "color_throb").
							CLASS("transition-all duration-1000 font-bold text-2xl text-center rounded-box p-4 uppercase").
							STYLEF("color", "#%x", fg.Value).
							STYLEF("background-color", "#%x", bg.Value).
							TextF("%s on %s", fg.Label, bg.Label),
					)
				}
			}
		})

		dataRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				BUTTON().
					ID("fade_out_swap").
					CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-error-700 hover:bg-error-600 transition-all duration-[2000ms] opacity-0").
					DATASTAR_ON("click", datastar.DELETE("/examples/animations/data")).
					Children(
						material_symbols.Delete(),
						Text("Fade out then delete on click"),
					),
			)
			time.Sleep(2 * time.Second)
			datastar.Delete(sse, "#fade_out_swap")
		})

		dataRouter.Get("/fade_me_in", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				BUTTON().
					ID("fade_me_in").
					CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600 opacity-0").
					DATASTAR_ON("click", datastar.GET("/examples/animations/data/fade_me_in")).
					Children(
						material_symbols.Add(),
						Text("Fade me in on click"),
					),
			)
			time.Sleep(500 * time.Millisecond)

			datastar.RenderFragment(
				sse,
				BUTTON().
					ID("fade_me_in").
					CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600 transition-all duration-1000 opacity-100").
					DATASTAR_ON("click", datastar.GET("/examples/animations/data/fade_me_in")).
					Children(
						material_symbols.Add(),
						Text("Fade me in on click"),
					),
			)
		})

		dataRouter.Post("/request_in_flight", func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(2 * time.Second)
			datastar.RenderFragment(
				datastar.NewSSE(w, r),
				DIV().
					ID("request_in_flight").
					CLASS("flex gap-2").
					Text("Submitted!"),
			)
		})

		dataRouter.Get("/view_transition", func(w http.ResponseWriter, r *http.Request) {
			store := &RestoreStore{}
			if err := datastar.QueryStringUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			store.ShouldRestore = !store.ShouldRestore
			sse := datastar.NewSSE(w, r)
			renderViewTransition(sse, store)
		})
	})

	return nil
}
