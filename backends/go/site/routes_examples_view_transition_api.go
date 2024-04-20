package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesViewTransitionAPI(examplesRouter chi.Router) error {

	type Store struct {
		UseSlide bool `json:"useSlide"`
	}

	examplesRouter.Get("/view_transition_api/watch", func(w http.ResponseWriter, r *http.Request) {
		// You can comment out the below block and still persist the session

		store := &Store{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		sse := datastar.NewSSE(w, r)

		t := time.NewTicker(time.Second)
		for {
			select {
			case <-r.Context().Done():
				return
			case <-t.C:
				datastar.RenderFragment(sse, DIV().
					ID("stuff").
					CLASS("font-brand font-bold text-2xl flex flex-col gap-4").
					Children(
						DIV().
							CLASS("flex gap-2").
							Children(
								DIV().Text("The time is:"),
								DIV().
									CLASS("text-primary-300").
									IfDATASTAR_VIEW_TRANSITION(
										store.UseSlide,
										"'slide-it'",
									).
									Text(time.Now().Format(time.TimeOnly)),
							),
						BUTTON().
							DATASTAR_ON("click", "location.reload()").
							CLASS("bg-primary-600 hover:bg-primary-700 flex flex-col justify-center items-center no-underline font-brand font-bold w-full p-4 cursor-pointer text-accent-50 rounded-md  text-center flex gap-2 items-center justify-center").
							Text("Reload"),
					),
				)
			}
		}
	})

	return nil
}
