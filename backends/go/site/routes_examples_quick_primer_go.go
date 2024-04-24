package site

import (
	"encoding/binary"
	"encoding/hex"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/goccy/go-json"
)

func setupExamplesQuickPrimerGo(examplesRouter chi.Router) error {
	examplesRouter.Route("/quick_primer_go/data", func(dataRouter chi.Router) {
		type Store struct {
			Input string `json:"input"`
			Show  bool   `json:"show"`
		}
		store := &Store{"initial backend data", false}

		dataRouter.Get("/replace", func(w http.ResponseWriter, r *http.Request) {
			fragment := DIV().
				ID("replaceMe").
				DATASTAR_STORE(store).
				Children(
					H2().Text("Go Datastar Example"),
					MAIN().
						ID("main").
						CLASS("container flex flex-col gap-4").
						Children(
							INPUT().
								TYPE("text").
								CLASS("p-2 border border-accent-400 rounded text-accent-200 bg-accent-700").
								PLACEHOLDER("Type here!").
								DATASTAR_MODEL("input"),
							DIV().DATASTAR_TEXT("$input"),

							BUTTON().
								CLASS("p-2 border border-accent-400 rounded text-accent-200 bg-accent-700").
								DATASTAR_ON("click", "$show = !$show").
								Text("Toggle"),
							DIV().
								Attr("data-show", "$show").
								Children(
									SPAN().Text("Hello from Datastar!"),
								),

							DIV().ID("output").Text("#output"),
							BUTTON().
								CLASS("p-2 border border-accent-400 rounded text-accent-200 bg-accent-700").
								DATASTAR_ON("click", datastar.PUT("/examples/quick_primer_go/data")).
								Text("Send State"),

							DIV().ID("output2").Text("#output2"),
							BUTTON().
								CLASS("p-2 border border-accent-400 rounded text-accent-200 bg-accent-700").
								DATASTAR_ON("click", datastar.GET("/examples/quick_primer_go/data")).
								Text("Get State"),
							DIV().
								Children(
									SPAN().Text("Feed from server: "),
									SPAN().
										ID("feed").
										DATASTAR_ON("load", datastar.GET("/examples/quick_primer_go/data/feed")),
								),
						),
				)

			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(sse, fragment)
		})

		dataRouter.Put("/", func(w http.ResponseWriter, r *http.Request) {
			reqStore := &Store{}
			if err := datastar.BodyUnmarshal(r, reqStore); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := sanitizer.Sanitize(reqStore); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			store = reqStore

			fragment := DIV().
				ID("output").
				TextF("Your input: %s, is %d long.", store.Input, len(store.Input))

			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(sse, fragment)
		})

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			b, err := json.Marshal(store)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			fragment := fmt.Sprintf(`<div id="output2">Backend state: %s</div>`, string(b))
			datastar.RenderFragmentString(sse, fragment)

			fragment = `<div>Check this out!</div>`
			datastar.RenderFragmentString(
				sse, fragment,
				datastar.WithQuerySelector("main"),
				datastar.WithMergePrependElement(),
			)

		})

		dataRouter.Get("/feed", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)

			ticker := time.NewTicker(time.Second)

			for {
				select {
				case <-r.Context().Done():
					return
				case <-ticker.C:
					buf := make([]byte, 8)
					binary.LittleEndian.PutUint64(buf, rand.Uint64())
					fragment := `<span id="feed">` + hex.EncodeToString(buf) + `</span>`

					datastar.RenderFragmentString(sse, fragment)
				}
			}
		})
	})

	return nil
}
