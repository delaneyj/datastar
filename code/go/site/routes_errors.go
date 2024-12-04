package site

import (
	"context"
	"net/http"
	"net/url"
	"strings"

	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
)

func setupErrors(ctx context.Context, router chi.Router) error {

	mdDataset, err := markdownRenders(ctx, "errors")
	if err != nil {
		return err
	}
	for codeWithText, mdData := range mdDataset {
		code := strings.SplitN(codeWithText, "_", 2)[0]
		delete(mdDataset, codeWithText)

		mdDataset[code] = mdData
	}

	sidebarGroups := []*SidebarGroup{
		{
			Label: "Errors",
			Links: []*SidebarLink{
				{ID: "A1"},
				{ID: "A2"},
				{ID: "A3"},
				{ID: "B1"},
				{ID: "B2"},
				{ID: "B3"},
				{ID: "C1"},
				{ID: "C2"},
				{ID: "D1"},
				{ID: "E1"},
				{ID: "E2"},
				{ID: "E3"},
				{ID: "E4"},
				{ID: "E5"},
				{ID: "F1"},
				{ID: "G1"},
				{ID: "H1"},
				{ID: "J1"},
				{ID: "K1"},
				{ID: "L1"},
				{ID: "L2"},
				{ID: "M1"},
				{ID: "M2"},
				{ID: "M3"},
				{ID: "N1"},
				{ID: "N2"},
				{ID: "P1"},
				{ID: "Q1"},
				{ID: "Q2"},
				{ID: "Q3"},
				{ID: "Q4"},
				{ID: "Q5"},
				{ID: "R1"},
				{ID: "S1"},
				{ID: "S2"},
				{ID: "Y1"},
				{ID: "Y2"},
				{ID: "Y3"},
				{ID: "Y4"},
				{ID: "Y5"},
				{ID: "Y6"},
				{ID: "Z1"},
				{ID: "Z2"},
				{ID: "Z3"},
				{ID: "Z4"},
				{ID: "Z5"},
				{ID: "Z6"},
			},
		},
	}
	lo.ForEach(sidebarGroups, func(group *SidebarGroup, grpIdx int) {
		lo.ForEach(group.Links, func(link *SidebarLink, linkIdx int) {
			link.URL = templ.SafeURL("/errors/" + link.ID)
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

	router.Route("/errors", func(errorsRouter chi.Router) {
		errorsRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, string(sidebarGroups[0].Links[0].URL), http.StatusFound)
		})

		errorsRouter.Get("/{name}", func(w http.ResponseWriter, r *http.Request) {
			name := chi.URLParam(r, "name")
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

			params, err := url.ParseQuery(r.URL.RawQuery)
			if err != nil {
				http.Error(w, "bad request", http.StatusBadRequest)
				return
			}

			contents := mdData.Contents
			for key, values := range params {
				contents = strings.ReplaceAll(contents, "{ "+key+" }", strings.Join(values, ","))
			}

			SidebarPage(r, sidebarGroups, currentLink, mdData.Title, mdData.Description, contents).Render(r.Context(), w)
		})
	})

	return nil
}
