// Package docs provides a simple HTTP server for serving documentation.

package docs

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// RunBlocking starts a blocking HTTP server on PORT
func RunBlocking(ctx context.Context) error {
	router := chi.NewRouter()
	router.Use(
		middleware.Logger,
		middleware.Recoverer,
		toolbelt.CompressMiddleware(),
	)

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		Render(w, HTML5(HTML5Props{
			Title: "Hello World",
			Body: NODES{
				DIV(TXT("Hello World")),
			},
		}))

	})

	portStr := os.Getenv("PORT")
	if portStr == "" {
		portStr = "8080"
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		return fmt.Errorf("invalid port: %w", err)
	}

	srv := http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: router,
	}

	go func() {
		<-ctx.Done()
		srv.Shutdown(context.Background())
	}()

	return srv.ListenAndServe()
}
