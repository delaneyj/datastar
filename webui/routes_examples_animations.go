package webui

import (
	"context"
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/gomponents-iconify/iconify/svg_spinners"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupExamplesAnimations(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/animations", func(lazyLoadRouter chi.Router) {
		lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

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

		renderViewTransition := func(sse *toolbelt.ServerSentEventsHandler, store *RestoreStore) {
			datastar.RenderFragment(
				sse,
				DIV(
					ID("view_transition"),
					datastar.MergeStore(store),
					CLS("slide-it"),
					// DIV(TXT("View Transition")),
					BUTTON(
						CLS("btn btn-primary"),
						datastar.FetchURL("'/examples/animations/data/view_transition'"),
						datastar.On("click", datastar.GET_ACTION),
						TERNCached(store.ShouldRestore, material_symbols.ArrowLeft(), material_symbols.ArrowRight()),
						TERNCached(store.ShouldRestore, TXT("Restore It!"), TXT("Swap It!")),
					),
				),
			)
		}

		lazyLoadRouter.Route("/data", func(dataRouter chi.Router) {
			dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)

				datastar.RenderFragment(
					sse,
					BUTTON(
						ID("fade_out_swap"),
						CLS("btn btn-error"),
						datastar.FetchURL("'/examples/animations/data'"),
						datastar.On("click", datastar.DELETE_ACTION),
						material_symbols.Delete(),
						TXT("Fade out then delete on click"),
					),
				)

				datastar.RenderFragment(
					sse,
					BUTTON(
						ID("fade_me_in"),
						CLS("btn btn-success"),
						datastar.FetchURL("'/examples/animations/data/fade_me_in'"),
						datastar.On("click", datastar.GET_ACTION),
						material_symbols.Add(),
						TXT("Fade me in on click"),
					),
				)

				datastar.RenderFragment(
					sse,
					DIV(
						ID("request_in_flight"),
						CLS("flex flex-col gap-4"),
						DIV(
							CLS("form-control"),
							LABEL(
								CLS("label label-text"),
								TXT("Name"),
							),
							DIV(
								CLS("flex gap-2 items-center"),
								INPUT(
									TYPE("text"),
									NAME("name"),
									CLS("input input-bordered flex-1"),
								),
								DIV(
									ID("request_in_flight_indicator"),
									svg_spinners.BlocksWave(CLS("text-xl")),
								),
							),
						),
						BUTTON(
							ID("submit_request_in_flight"),
							CLS("btn btn-primary"),
							datastar.FetchURL("'/examples/animations/data/request_in_flight'"),
							datastar.FetchIndicatorID("request_in_flight_indicator"),
							datastar.On("click", datastar.POST_ACTION),
							material_symbols.PersonAdd(),
							TXT("Submit"),
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
							DIV(
								ID("color_throb"),
								CLS("transition-all duration-1000 font-bold text-2xl text-center rounded-box p-4 uppercase"),
								STYLEF("color: #%x; background-color: #%x;", fg.Value, bg.Value),
								TXTF("%s on %s", fg.Label, bg.Label),
							),
						)
					}
				}
			})

			dataRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					BUTTON(
						ID("fade_out_swap"),
						CLS("btn btn-error transition-all duration-[2000ms] opacity-0"),
						datastar.FetchURL("'/examples/animations/data'"),
						datastar.On("click", datastar.DELETE_ACTION),
						material_symbols.Delete(),
						TXT("Fade out then delete on click"),
					),
				)
				time.Sleep(2 * time.Second)
				datastar.Delete(sse, "#fade_out_swap")
			})

			dataRouter.Get("/fade_me_in", func(w http.ResponseWriter, r *http.Request) {
				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(
					sse,
					BUTTON(
						ID("fade_me_in"),
						CLS("btn btn-success opacity-0"),
						datastar.FetchURL("'/examples/animations/data/fade_me_in'"),
						datastar.On("click", datastar.GET_ACTION),
						material_symbols.Add(),
						TXT("Fade me in on click"),
					),
				)
				time.Sleep(500 * time.Millisecond)

				datastar.RenderFragment(
					sse,
					BUTTON(
						ID("fade_me_in"),
						CLS("btn btn-success transition-all duration-1000 opacity-1"),
						datastar.FetchURL("'/examples/animations/data/fade_me_in'"),
						datastar.On("click", datastar.GET_ACTION),
						material_symbols.Add(),
						TXT("Fade me in on click"),
					),
				)
			})

			dataRouter.Post("/request_in_flight", func(w http.ResponseWriter, r *http.Request) {
				time.Sleep(2 * time.Second)
				datastar.RenderFragment(
					toolbelt.NewSSE(w, r),
					DIV(
						ID("request_in_flight"),
						CLS("flex gap-2"),
						TXT("Submitted!"),
					),
				)
			})

			dataRouter.Get("/view_transition", func(w http.ResponseWriter, r *http.Request) {
				store := &RestoreStore{}
				if err := datastar.QueryStringUnmarshal(r, store); err != nil {
					http.Error(w, err.Error(), http.StatusBadRequest)
					return
				}
				store.ShouldRestore = !store.ShouldRestore
				sse := toolbelt.NewSSE(w, r)
				renderViewTransition(sse, store)
			})
		})

	})

	return nil
}
