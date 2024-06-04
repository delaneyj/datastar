package site

import (
	"net/http"
	"strings"

	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupEssays(router chi.Router) error {

	mdElementRenderers, _, err := markdownRenders("essays")
	if err != nil {
		return err
	}

	sidebarGroups := []*SidebarGroup{
		{
			Label: "2024",
			Links: []*SidebarLink{
				{ID: "another_dependency"},
				{ID: "event_streams_all_the_way_down"},
			},
		},
		{
			Label: "2023",
			Links: []*SidebarLink{
				{ID: "i_am_a_teapot"},
				{ID: "grugs_around_fire"},
				{ID: "haikus"},
				{ID: "yes_you_want_a_build_step"},
				{ID: "why_another_framework"},
			},
		},
	}
	lo.ForEach(sidebarGroups, func(group *SidebarGroup, grpIdx int) {
		lo.ForEach(group.Links, func(link *SidebarLink, linkIdx int) {
			link.URL = templ.SafeURL("/essays/" + link.ID)
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

	router.Route("/essays", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, string(sidebarGroups[0].Links[0].URL), http.StatusFound)
		})

		essaysRouter.Get("/{name}", func(w http.ResponseWriter, r *http.Request) {
			name := chi.URLParam(r, "name")
			contents, ok := mdElementRenderers[name]
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

			SidebarPage(r, sidebarGroups, currentLink, contents).Render(r.Context(), w)
		})
	})

	return nil
}
