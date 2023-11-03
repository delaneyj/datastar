package webui

import (
	"context"
	"errors"
	"fmt"

	"github.com/benbjohnson/hashfs"
	"github.com/go-chi/chi/v5"
)

func setupRoutes(ctx context.Context, router *chi.Mux) error {
	b, err := staticFS.ReadFile("static/package.json")
	if err != nil {
		return fmt.Errorf("error reading package.json: %w", err)
	}

	packageJSON, err = UnmarshalPackageJSON(b)
	if err != nil {
		return fmt.Errorf("error unmarshaling package.json: %w", err)
	}

	defer router.Handle("/static/*", hashfs.FileServer(staticSys))

	if err := errors.Join(
		setupAPI(ctx, router),
		setupHome(ctx, router),
		setupExamples(ctx, router),
		setupEssays(ctx, router),
		setupDocs(ctx, router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

	return nil
}
