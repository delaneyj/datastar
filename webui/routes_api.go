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
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupAPI(ctx context.Context, router *chi.Mux) error {

	var globalCount = new(int32)
	c := int32(toolbelt.Fit(rand.Float32(), 0, 1, -100, 100))
	globalCount = &c

	globalCountExample := func() NODE {
		count := atomic.LoadInt32(globalCount)
		return DIV(
			ID("global-count-example"),
			CLS("flex flex-col gap-2"),
			DATAF("signal-count", "%d", count),
			DIV(
				CLS("flex gap-2 justify-between items-center"),
				BUTTON(
					CLS("btn btn-primary"),
					DATA("on-click", "$count++"),
					TXT("Increment Local State  +"),
				),
				BUTTON(
					CLS("btn btn-primary"),
					DATA("on-click", "$count--"),
					TXT("Decrement Local State -"),
				),
				INPUT(
					CLS("input input-bordered"),
					TYPE("number"),
					NAME("count"),
					DATA("model", "count"),
				),
				DIV(DATA("text", "`Count is ${$count}`")),
			),
			DIV(
				CLS("flex gap-4"),
				BUTTON(
					CLS("btn btn-secondary btn-lg flex-1"),
					DATA("signal-get", "'/api/globalCount'"),
					DATA("on-click", "@get"),
					TXT("Load global count"),
					material_symbols.Download(),
				),
				BUTTON(
					CLS("btn btn-secondary btn-lg flex-1"),
					DATA("signal-post", "'/api/globalCount'"),
					DATA("on-click", "@post"),
					TXT("Store global count"),
					material_symbols.Upload(),
				),
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

				Render(w, globalCountExample())
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
				Render(w, globalCountExample())
			})
		})
	})

	return nil
}
