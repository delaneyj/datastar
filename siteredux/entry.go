package site

import (
	"context"
	"embed"
	"fmt"
	"net/http"

	"github.com/benbjohnson/hashfs"
	"github.com/delaneyj/toolbelt"
)

//go:embed static/*
var staticFS embed.FS

var (
	staticSys = hashfs.NewFS(staticFS)
)

func staticPath(path string) string {
	return "/" + staticSys.HashName("static/"+path)
}

func staticAbsolutePath(path string) string {
	return "https://data-star.dev/" + staticSys.HashName("static/"+path)
}

func canonicalUrl(uri string) string {
	return "https://data-star.dev" + uri
}

func RunBlocking(port int, readyCh chan struct{}) toolbelt.CtxErrFunc {
	return func(ctx context.Context) error {
		router, err := setupRoutes(ctx)
		if err != nil {
			return fmt.Errorf("error setting up routes: %w", err)
		}

		srv := &http.Server{
			Addr:    fmt.Sprintf(":%d", port),
			Handler: router,
		}

		go func() {
			<-ctx.Done()
			srv.Shutdown(context.Background())
		}()

		if readyCh != nil {
			close(readyCh)
		}
		return srv.ListenAndServe()
	}
}
