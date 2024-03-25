package site

import (
	"net/http"
	"strings"

	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupEssays(router chi.Router) error {

	mdElementRenderers, mdAnchors, err := markdownRenders("essays")
	if err != nil {
		return err
	}

	essayNames := []string{
		"why_another_framework",
		"yes_you_want_a_build_step",
		"haikus",
		"grugs_around_fire",
		"i_am_a_teapot",
		"event_streams_all_the_way_down",
	}

	essayLabels := lo.Map(essayNames, func(name string, i int) string {
		return strings.ToUpper(strings.ReplaceAll(name, "_", " "))
	})

	router.Route("/essays", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/essays/"+essayNames[0], http.StatusFound)
		})

		sidebarContents := func(r *http.Request) ElementRenderer {
			return Group(lo.Map(essayNames, func(name string, i int) ElementRenderer {
				return link("/essays/"+name, essayLabels[i], strings.HasSuffix(r.URL.Path, name)).CLASS("uppercase font-brand")
			})...)
		}

		essaysRouter.Get("/{docName}", func(w http.ResponseWriter, r *http.Request) {
			docName := chi.URLParam(r, "docName")
			contents, ok := mdElementRenderers[docName]
			if !ok {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}

			docIdx := lo.IndexOf(essayNames, docName)

			contentGroup := []ElementRenderer{}
			if docIdx > 0 {
				contentGroup = append(contentGroup,
					H2(link("/essays/"+essayNames[docIdx-1], "Back to "+essayLabels[docIdx-1], false)),
				)
			}
			contentGroup = append(contentGroup, contents)
			if docIdx < len(essayNames)-1 {
				contentGroup = append(contentGroup,
					H2(link("/essays/"+essayNames[docIdx+1], "Next "+essayLabels[docIdx+1], false)),
				)
			}

			anchors := mdAnchors[docName]

			prosePage(r, sidebarContents(r), Group(contentGroup...), anchors).Render(w)
		})
	})

	return nil
}
