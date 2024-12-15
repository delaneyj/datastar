package site

import (
	"context"
	"net/http"
	"strings"

	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupReferenceRoutes(ctx context.Context, router chi.Router) error {
	mdDataset, err := markdownRenders(ctx, "reference")
	if err != nil {
		return err
	}

	legacyPages := map[string]bool{
		"plugins_core":    true,
		"plugins_dom":     true,
		"plugins_browser": true,
		"plugins_backend": true,
		"plugins_logic":   true,
	}

	sidebarGroups := []*SidebarGroup{
		{
			Label: "Reference",
			Links: []*SidebarLink{
				{ID: "attribute_plugins"},
				{ID: "action_plugins"},
				{ID: "sse_events"},
				{ID: "javascript_api"},
			},
		},
	}
	lo.ForEach(sidebarGroups, func(group *SidebarGroup, grpIdx int) {
		lo.ForEach(group.Links, func(link *SidebarLink, linkIdx int) {
			link.URL = templ.SafeURL("/reference/" + link.ID)
			link.Label = strings.ToUpper(strings.ReplaceAll(link.ID, "_", " "))

			if linkIdx > 0 {
				link.Prev = group.Links[linkIdx-1]
			} else if grpIdx > 0 {
				prvGrp := sidebarGroups[grpIdx-1]
				link.Prev = prvGrp.Links[len(prvGrp.Links)-1]
			}

			if linkIdx < len(group.Links)-1 {
				link.Next = group.Links[linkIdx+1]
			} else if grpIdx < len(sidebarGroups)-1 {
				nxtGrp := sidebarGroups[grpIdx+1]
				link.Next = nxtGrp.Links[0]
			}
		})
	})

	router.Route("/reference", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, string(sidebarGroups[0].Links[0].URL), http.StatusFound)
		})

		essaysRouter.Get("/{name}", func(w http.ResponseWriter, r *http.Request) {
			name := chi.URLParam(r, "name")

			// Redirect legacy pages to “Attribute Plugins”.
			if legacyPages[name] {
				http.Redirect(w, r, string(sidebarGroups[0].Links[0].URL), http.StatusMovedPermanently)
			}

			mdData, ok := mdDataset[name]
			if !ok {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}

			var currentLink *SidebarLink
			for _, group := range sidebarGroups {
				for _, link := range group.Links {
					if link.ID == name {
						currentLink = link
						break
					}
				}
			}

			SidebarPage(r, sidebarGroups, currentLink, mdData.Title, mdData.Description, mdData.Contents).Render(r.Context(), w)
		})
	})

	return nil
}
