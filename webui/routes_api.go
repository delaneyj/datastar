package webui

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"math"
	"net/http"
	"sync/atomic"
	"time"

	"github.com/Jeffail/gabs/v2"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupAPI(ctx context.Context, router *chi.Mux) error {

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
