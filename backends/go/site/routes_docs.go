package site

import (
	"net/http"
	"strings"

	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

var docNames = []string{
	"getting_started",
	"von_deepa",
	"howl",
	"batteries_included",
	"streaming_backend",
}

func setupDocs(router chi.Router) error {
	mdElementRenderers, mdAnchors, err := markdownRenders("docs")
	if err != nil {
		return err
	}

	docLabels := lo.Map(docNames, func(name string, i int) string {
		return strings.ToUpper(strings.ReplaceAll(name, "_", " "))
	})

	router.Route("/docs", func(docsRouter chi.Router) {
		docsRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/docs/"+docNames[0], http.StatusFound)
		})

		sidebarContents := func(r *http.Request) ElementRenderer {
			return Group(lo.Map(docNames, func(name string, i int) ElementRenderer {
				return link("/docs/"+name, docLabels[i], strings.HasSuffix(r.URL.Path, name)).CLASS("uppercase font-brand")
			})...)
		}

		docsRouter.Get("/{docName}", func(w http.ResponseWriter, r *http.Request) {
			docName := chi.URLParam(r, "docName")
			contents, ok := mdElementRenderers[docName]
			if !ok {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}

			docIdx := lo.IndexOf(docNames, docName)

			contentGroup := []ElementRenderer{}
			if docIdx > 0 {
				contentGroup = append(contentGroup,
					buttonLink().
						CLASS("w-full no-underline").
						HREF("/docs/"+docNames[docIdx-1]).
						Text("Back to "+docLabels[docIdx-1]),
				)
			}
			contentGroup = append(contentGroup, contents)
			if docIdx < len(docNames)-1 {
				contentGroup = append(contentGroup,
					buttonLink().
						CLASS("w-full no-underline").
						HREF("/docs/"+docNames[docIdx+1]).
						Text("Next "+docLabels[docIdx+1]),
				)
			}

			prosePage(
				r,
				sidebarContents(r),
				Group(contentGroup...),
				mdAnchors[docName],
			).Render(w)
		})
	})

	return nil
}
