// Package webui provides a simple HTTP server for serving documentation.
package webui

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"

	"github.com/benbjohnson/hashfs"
	"github.com/delaneyj/toolbelt"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

//go:embed static/*
var staticFS embed.FS

var staticSys = hashfs.NewFS(staticFS)

func staticPath(path string) string {
	return "/" + staticSys.HashName("static/"+path)
}

// RunBlocking starts a blocking HTTP server on PORT
func RunBlocking(ctx context.Context) error {
	router := chi.NewRouter()
	router.Use(
		middleware.Logger,
		middleware.Recoverer,
		toolbelt.CompressMiddleware(),
	)

	if err := errors.Join(
		setupRoutes(ctx, router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

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

	runHTTPServer := func(ctx context.Context) error {
		return srv.ListenAndServe()
	}

	shutdownHTTPServer := func(ctx context.Context) error {
		<-ctx.Done()
		srv.Shutdown(context.Background())
		return ctx.Err()
	}

	maybeHotReload := func(ctx context.Context) error {
		hotReload := os.Getenv("HOT_RELOAD") == "true"
		hotReloadPath := os.Getenv("HOT_RELOAD_PATH")

		slog.Info("hotReload",
			slog.Bool("hotReload", hotReload),
			slog.String("hotReloadPath", hotReloadPath),
		)

		if hotReload && hotReloadPath != "" {
			return toolbelt.RunHotReload(port, hotReloadPath)(ctx)
		}
		return nil
	}

	eg := toolbelt.NewErrGroupSharedCtx(ctx,
		runHTTPServer,
		shutdownHTTPServer,
		maybeHotReload,
	)

	return eg.Wait()
}
