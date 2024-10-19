package site

import (
	"fmt"
	"net/http"

	"github.com/blevesearch/bleve/v2"
	"github.com/go-chi/chi/v5"
)

func setupMemes(router chi.Router, searchIndex bleve.Index) error {
	memeDir := "static/images/memes"
	entries, err := staticFS.ReadDir(memeDir)
	if err != nil {
		return fmt.Errorf("error reading meme directory: %w", err)
	}
	memes := make([]string, 0, len(entries))
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		url := staticPath("images/memes/" + name)
		memes = append(memes, url)

		if err := searchIndex.Index(url, name); err != nil {
			return fmt.Errorf("error indexing %s: %w", url, err)
		}

	}

	router.Route("/memes", func(memesRouter chi.Router) {
		memesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			PageMemes(r, memes...).Render(r.Context(), w)
		})
	})

	return nil

}
