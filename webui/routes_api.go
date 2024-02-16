package webui

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"math"
	"math/rand"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupAPI(ctx context.Context, router *chi.Mux) error {

	var globalCount = new(int32)
	c := int32(toolbelt.Fit(rand.Float32(), 0, 1, -100, 100))
	globalCount = &c

	globalCountExample := func() ElementRenderer {
		count := atomic.LoadInt32(globalCount)
		return DIV().
			ID("global-count-example").
			CLASS("flex flex-col gap-2").
			DATASTAR_MERGE_STORE(map[string]any{
				"count": count,
			}).
			Children(
				DIV().
					CLASS("flex gap-2 justify-between items-center").
					Children(
						BUTTON().
							CLASS("btn btn-primary").
							CustomData("on-click", "$count++").
							Text("Increment Local State  +"),
						BUTTON().
							CLASS("btn btn-primary").
							CustomData("on-click", "$count--").
							Text("Decrement Local State -"),
						INPUT().
							CLASS("input input-bordered").
							TYPE("number").
							NAME("count").
							CustomData("model", "count"),
						DIV().CustomData("text", "`Count is ${$count}`"),
					),
				DIV().
					CLASS("flex gap-4").
					Children(
						BUTTON(material_symbols.Download()).
							CLASS("btn btn-secondary btn-lg flex-1").
							DATASTAR_FETCH_URL("'/api/globalCount'").
							DATASTAR_ON("click", datastar.GET_ACTION).
							Text("Load global count"),
						BUTTON(material_symbols.Upload()).
							CLASS("btn btn-secondary btn-lg flex-1").
							DATASTAR_FETCH_URL("'/api/globalCount'").
							DATASTAR_ON("click", datastar.POST_ACTION).
							Text("Store global count"),
					),
			)

	}

	router.Route("/api", func(apiRouter chi.Router) {
		apiRouter.Route("/globalCount", func(globalCountRouter chi.Router) {
			globalCountRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
				time.Sleep(3 * time.Second)
				// No Cache
				w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
				w.Header().Set("Pragma", "no-cache")
				w.Header().Set("Expires", "0")

				sse := toolbelt.NewSSE(w, r)
				datastar.RenderFragment(sse, globalCountExample())
			})

			globalCountRouter.Post("/", func(w http.ResponseWriter, r *http.Request) {

				buf := bytes.NewBuffer(nil)
				if _, err := io.Copy(buf, r.Body); err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				slog.Info("body", "body", buf.String())

				parsed, err := gabs.ParseJSON(buf.Bytes())
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				countF64, ok := parsed.Path("signals.count").Data().(float64)
				if !ok {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				// if !ok {
				// 	http.Error(w, err.Error(), http.StatusInternalServerError)
				// 	return
				// }
				count := int32(math.Round(countF64))
				slog.Info("count", "count", count)

				atomic.StoreInt32(globalCount, count)
				globalCountExample().Render(w)
			})
		})
	})

	return nil
}
