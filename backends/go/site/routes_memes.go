package site

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func setupMemes(router chi.Router) error {
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
		memes = append(memes, staticPath("images/memes/"+entry.Name()))
	}

	router.Route("/memes", func(memesRouter chi.Router) {
		memesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			PageMemes(r, memes...).Render(r.Context(), w)
		})
	})

	return nil

}
