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

	sidebarGroups := []*SidebarGroup{
		{
			Label: "Errors",
			Links: []*SidebarLink{
				{ID: "BatchError"},
				{ID: "CleanupEffectError"},
				{ID: "ClipboardNotAvailable"},
				{ID: "ComputedKeyNotProvided"},
				{ID: "EffectError"},
				{ID: "EndEffectError"},
				{ID: "GeneratingExpressionFailed"},
				{ID: "GetComputedError"},
				{ID: "IndicatorValueNotProvided"},
				{ID: "InvalidContentType"},
				{ID: "InvalidDataUri"},
				{ID: "InvalidExpression"},
				{ID: "InvalidFileResultType"},
				{ID: "InvalidMergeMode"},
				{ID: "InvalidMorphStyle"},
				{ID: "InvalidPluginType"},
				{ID: "InvalidValue"},
				{ID: "MorphFailed"},
				{ID: "NewElementCouldNotBeCreated"},
				{ID: "NoBestMatchFound"},
				{ID: "NoContentFound"},
				{ID: "NoFragmentsFound"},
				{ID: "NoParentElementFound"},
				{ID: "NoPathsProvided"},
				{ID: "NoScriptProvided"},
				{ID: "NoSelectorProvided"},
				{ID: "NoTargetsFound"},
				{ID: "NoTemporaryNodeFound"},
				{ID: "NoUrlProvided"},
				{ID: "NotHtmlElement"},
				{ID: "NotHtmlSvgElement"},
				{ID: "RefValueNotProvided"},
				{ID: "ReplaceUrlValueNotProvided"},
				{ID: "RequiredPluginNotLoaded"},
				{ID: "ShowValueNotProvided"},
				{ID: "SignalCycleDetected"},
				{ID: "SseFetchFailed"},
				{ID: "UnsupportedSignalType"},
			},
		},
	}
	lo.ForEach(sidebarGroups, func(group *SidebarGroup, grpIdx int) {
		lo.ForEach(group.Links, func(link *SidebarLink, linkIdx int) {
			link.URL = templ.SafeURL("/errors/" + link.ID)
			link.Label = link.ID

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
