package site

import (
	"net/http"

	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupReferenceRoutes(router chi.Router) error {
	mdElementRenderers, mdAnchors, err := markdownRenders("reference")
	if err != nil {
		return err
	}

	type Reference struct {
		ID          string
		Label       string
		URL         string
		Description string
		Prev, Next  *Reference
	}
	type ReferenceGroup struct {
		Label      string
		References []*Reference
	}

	var (
		prevRef        *Reference
		referenceByURL = map[string]*Reference{}
	)
	references := lo.Map([]ReferenceGroup{
		{
			Label: "Included Plugins",
			References: []*Reference{
				{ID: "plugins_core", Label: "Core"},
				{ID: "plugins_attributes", Label: "Attributes"},
				{ID: "plugins_backend", Label: "Backend"},
				{ID: "plugins_helpers", Label: "Helpers"},
				{ID: "plugins_visibility", Label: "Visibility"},
			},
		},
		{
			Label: "How it Works",
			References: []*Reference{
				{ID: "expressions", Label: "Expressions"},
			},
		},
		// {
		// 	Label:      "Writing Plugins",
		// 	References: []*Reference{},
		// },
	}, func(g ReferenceGroup, i int) ReferenceGroup {
		for _, example := range g.References {
			example.URL = "/reference/" + example.ID
			if prevRef != nil {
				example.Prev = prevRef
				prevRef.Next = example
			}
			prevRef = example
			referenceByURL[example.URL] = example
		}
		return g
	})

	router.Route("/reference", func(referenceRouter chi.Router) {
		referenceRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, references[0].References[0].URL, http.StatusFound)
		})

		sidebarContents := func(r *http.Request) ElementRenderer {
			return Range(references, func(g ReferenceGroup) ElementRenderer {
				return DIV(
					DIV(
						DIV().CLASS("text-2xl font-bold text-primary").Text(g.Label),
						HR().CLASS("divider border-primary"),
					),
					UL().
						CLASS("list-disc pl-4").
						Children(Range(g.References, func(e *Reference) ElementRenderer {
							return LI(
								link(e.URL, e.Label, e.URL == r.URL.Path),
							)
						})),
				)
			})
		}

		referenceRouter.Get("/{refName}", func(w http.ResponseWriter, r *http.Request) {

			ref, ok := referenceByURL[r.URL.Path]
			if !ok {
				ref = references[0].References[0]
			}

			contents, ok := mdElementRenderers[ref.ID]
			if !ok {
				http.Error(w, "not found", http.StatusNotFound)
			}

			contentGroup := []ElementRenderer{}
			if ref.Prev != nil {
				contentGroup = append(contentGroup,
					H2(link(ref.Prev.URL, "Back to "+ref.Prev.Label, false)),
				)
			}
			contentGroup = append(contentGroup, contents)
			if ref.Next != nil {
				contentGroup = append(contentGroup,
					H2(link(ref.Next.URL, "Next "+ref.Next.Label, false)),
				)
			}

			anchors := mdAnchors[ref.ID]

			prosePage(r, sidebarContents(r), Group(contentGroup...), anchors).Render(w)
		})
	})

	return nil
}
