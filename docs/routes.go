package docs

import (
	"context"
	"errors"
	"fmt"

	"github.com/benbjohnson/hashfs"
	"github.com/go-chi/chi/v5"
)

func setupRoutes(ctx context.Context, router *chi.Mux) error {

	defer router.Handle("/static/*", hashfs.FileServer(staticSys))

	if err := errors.Join(
		setupHome(ctx, router),
		setupEssays(ctx, router),
		setupDocs(ctx, router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

	return nil
}
