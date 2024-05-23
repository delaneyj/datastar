package site

import (
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
)

func setupExamplesRedirects(examplesRouter chi.Router) error {

	examplesRouter.Route("/redirects/data", func(dataRouter chi.Router) {
		type Store struct {
			RedirectTo string `json:"redirectTo"`
		}

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{
				RedirectTo: "/essays/why_another_framework",
			}
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				DIV().
					ID("demo").
					DATASTAR_STORE(store).
					CLASS("flex gap-4 w-full").
					Children(
						LABEL().
							CLASS("flex-1").
							Children(
								SPAN().Text("Redirect to: "),
								INPUT().
									DATASTAR_MODEL("redirectTo").
									CLASS("bg-accent-900 border-2 border-accent-600 text-accent-100 text-sm rounded-lg focus:ring-primary-400 focus:border-primary-400 block w-full p-2.5"),
							),
						BUTTON().
							CLASS("flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-success-700 hover:bg-success-600").
							DATASTAR_ON("click", datastar.POST("/examples/redirects/data")).
							Text("Redirect"),
					),
			)
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.BodyUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			sse := datastar.NewSSE(w, r)
			for i := 5; i > 0; i-- {
				datastar.RenderFragment(
					sse,
					DIV().ID("update").TextF("Redirecting in %d...", i),
				)
				time.Sleep(time.Second)
			}
			datastar.Redirect(sse, store.RedirectTo)
		})
	})

	return nil
}
