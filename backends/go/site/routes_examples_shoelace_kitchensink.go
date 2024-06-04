package site

import (
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupExamplesShoelaceKitchensink(examplesRouter chi.Router) error {
	examplesRouter.Route("/shoelace_kitchensink/data", func(dataRouter chi.Router) {

		options := lo.Map(lo.Range(7), func(i, index int) ShoelaceKitchensinkOption {
			offset := toolbelt.NextID()
			return ShoelaceKitchensinkOption{
				Label: fmt.Sprintf("Option %d", i),
				Value: uint32(offset % math.MaxUint32),
			}
		})

		dataRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			sse := datastar.NewSSE(w, r)
			store := &ShoelaceKitchensinkStore{
				Nested: &ShoelaceKitchensinkNested{
					Label:     fmt.Sprintf("Hello World %d", rand.Intn(100)),
					Selection: options[rand.Intn(len(options))].Value,
					IsChecked: true,
				},
			}
			datastar.RenderFragmentTempl(sse, ShoelaceKitchensinkView(r, options, store))
		})

		dataRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {
			var res any
			if err := datastar.BodyUnmarshal(r, &res); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}

			log.Printf("res: %v", res)
			sse := datastar.NewSSE(w, r)
			datastar.RenderFragment(sse, DIV())
		})
	})

	return nil
}
