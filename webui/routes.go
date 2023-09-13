package webui

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"

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

	defer router.Handle("/static/*", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		slog.Info("static", "path", r.URL.Path)
		hashfs.FileServer(staticSys).ServeHTTP(w, r)

		// if r.Response == nil {
		// 	r.Response.StatusCode = http.StatusOK
		// 	if strings.Contains(r.URL.Path, "sourceMappingURL=") {

		// 		sourceMap := "static/" + strings.Split(r.URL.Path, "sourceMappingURL=")[1]
		// 		b, err := staticFS.ReadFile(sourceMap)
		// 		if err != nil {
		// 			http.Error(w, err.Error(), http.StatusInternalServerError)
		// 			return
		// 		}

		// 		w.Header().Set("Content-Type", "application/json")
		// 		w.Header().Set("Content-Length", strconv.Itoa(len(b)))
		// 		w.Write(b)
		// 	}

		// 	http.FileServer(http.FS(staticFS)).ServeHTTP(w, r)
		// }
	}))

	if err := errors.Join(
		setupAPI(ctx, router),
		setupHome(ctx, router),
		setupEssays(ctx, router),
		setupDocs(ctx, router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

	return nil
}
