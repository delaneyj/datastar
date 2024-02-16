// Package webui provides a simple HTTP server for serving documentation.
package webui

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"log"
	"net/http"
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

	// memcached, err := memory.NewAdapter(
	// 	memory.AdapterWithAlgorithm(memory.LRU),
	// 	memory.AdapterWithCapacity(1024),
	// )
	// if err != nil {
	// 	return fmt.Errorf("error creating memcached adapter: %w", err)
	// }

	// cacheClient, err := cache.NewClient(
	// 	cache.ClientWithAdapter(memcached),
	// 	cache.ClientWithTTL(10*time.Minute),
	// 	cache.ClientWithRefreshKey("opn"),
	// )

	// if err != nil {
	// 	return fmt.Errorf("error creating cache client: %w", err)
	// }

	router.Use(
		middleware.Logger,
		middleware.Recoverer,
		toolbelt.CompressMiddleware(),
		// cacheClient.Middleware,
	)

	if err := errors.Join(
		setupRoutes(ctx, router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

	portStr := "" // os.Getenv("PORT")
	if portStr == "" {
		portStr = "8080"
	}
	log.Printf("listening on port %s", portStr)

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

	eg := toolbelt.NewErrGroupSharedCtx(ctx,
		runHTTPServer,
		shutdownHTTPServer,
	)

	return eg.Wait()
}
