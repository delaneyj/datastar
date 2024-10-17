package site

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesAnimations(examplesRouter chi.Router) error {
	// lazyLoadRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
	// 	examplePage(w, r)
	// })

	fgPal := []AnimationsColor{
		{Label: "red", Value: 0xfb4934},
		{Label: "green", Value: 0xb8bb26},
		{Label: "yellow", Value: 0xfabd2f},
		{Label: "blue", Value: 0x83a598},
		{Label: "purple", Value: 0xd3869b},
		{Label: "aqua", Value: 0x8ec07c},
		{Label: "orange", Value: 0xfe8019},
	}

	bgPal := []AnimationsColor{
		{Label: "red", Value: 0x9d0006},
		{Label: "green", Value: 0x79740e},
		{Label: "yellow", Value: 0xb57614},
		{Label: "blue", Value: 0x458588},
		{Label: "purple", Value: 0x8f3f71},
		{Label: "aqua", Value: 0x427b58},
		{Label: "orange", Value: 0xaf3a03},
	}

	examplesRouter.Route("/animations/data", func(dataRouter chi.Router) {
		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			datastar.RenderFragmentTempl(sse, animationsFadeOutSwap(false))
			datastar.RenderFragmentTempl(sse, animationsFadeMeIn(true))
			datastar.RenderFragmentTempl(sse, animationsRequestInFlight())

			store := &AnimationsRestoreStore{ShouldRestore: true}
			datastar.RenderFragmentTempl(sse, animationsViewTransition(store))

			colorThrobTicker := time.NewTicker(2 * time.Second)
			for {
				select {
				case <-r.Context().Done():
					return
				case <-colorThrobTicker.C:
					fg := fgPal[rand.Intn(len(fgPal))]
					bg := bgPal[rand.Intn(len(bgPal))]
					datastar.RenderFragmentTempl(
						sse,
						animationsColorThrob(fg, bg),
					)
				}
			}
		})

		dataRouter.Delete("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, animationsFadeOutSwap(true))
			time.Sleep(2 * time.Second)
			datastar.Delete(sse, "#fade_out_swap")
		})

		dataRouter.Get("/fade_me_in", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, animationsFadeMeIn(false))
			time.Sleep(500 * time.Millisecond)
			datastar.RenderFragmentTempl(sse, animationsFadeMeIn(true))
		})

		dataRouter.Post("/request_in_flight", func(w http.ResponseWriter, r *http.Request) {
			time.Sleep(2 * time.Second)
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentString(sse, `<div id="request_in_flight">Submitted!</div>`)
		})

		dataRouter.Get("/view_transition", func(w http.ResponseWriter, r *http.Request) {
			store := &AnimationsRestoreStore{}
			if err := datastar.QueryStringUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			store.ShouldRestore = !store.ShouldRestore
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragmentTempl(sse, animationsViewTransition(store))
		})
	})

	return nil
}
