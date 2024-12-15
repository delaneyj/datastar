package site

import (
	"context"
	"embed"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/a-h/templ"
	"github.com/benbjohnson/hashfs"
	"github.com/delaneyj/toolbelt"
	"github.com/delaneyj/toolbelt/embeddednats"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gorilla/sessions"
	natsserver "github.com/nats-io/nats-server/v2/server"
)

//go:embed static/*
var staticFS embed.FS

var (
	staticSys    = hashfs.NewFS(staticFS)
	highlightCSS templ.Component
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

		router := chi.NewRouter()

		router.Use(middleware.Recoverer)

		if err := setupRoutes(ctx, router); err != nil {
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

func setupRoutes(ctx context.Context, router chi.Router) (err error) {
	defer router.Handle("/static/*", hashfs.FileServer(staticSys))

	natsPort, err := toolbelt.FreePort()
	if err != nil {
		return fmt.Errorf("error getting free port: %w", err)
	}

	ns, err := embeddednats.New(ctx, embeddednats.WithNATSServerOptions(&natsserver.Options{
		JetStream: true,
		StoreDir:  "./data/nats",
		Port:      natsPort,
	}))
	if err != nil {
		return fmt.Errorf("error creating embedded nats server: %w", err)
	}
	ns.WaitForServer()

	sessionSignals := sessions.NewCookieStore([]byte("datastar-session-secret"))
	sessionSignals.MaxAge(int(24 * time.Hour / time.Second))

	if err := errors.Join(
		setupHome(router, sessionSignals, ns),
		setupGuide(ctx, router),
		setupReferenceRoutes(ctx, router),
		setupExamples(ctx, router, sessionSignals),
		setupEssays(ctx, router),
		setupErrors(ctx, router),
		setupMemes(router),
		setupBundler(router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

	return nil
}
