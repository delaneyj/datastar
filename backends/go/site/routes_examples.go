package site

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/a-h/templ"
	"github.com/go-chi/chi/v5"
	"github.com/go-sanitize/sanitize"
	"github.com/gorilla/sessions"
	"github.com/samber/lo"
)

var (
	sanitizer *sanitize.Sanitizer
)

func setupExamples(router chi.Router, store sessions.Store) (err error) {
	mdElementRenderers, _, err := markdownRenders("examples")
	if err != nil {
		return err
	}

	sanitizer, err = sanitize.New()
	if err != nil {
		return fmt.Errorf("error creating sanitizer: %w", err)
	}

	sidebarGroups := []*SidebarGroup{
		{
			Label: "Ported HTMX Examples",
			Links: []*SidebarLink{
				{ID: "click_to_edit"},
				{ID: "bulk_update"},
				{ID: "click_to_load"},
				{ID: "delete_row"},
				{ID: "edit_row"},
				{ID: "lazy_load"},
				{ID: "fetch_indicator"},
				{ID: "inline_validation"},
				{ID: "infinite_scroll"},
				{ID: "active_search"},
				{ID: "progress_bar"},
				{ID: "value_select"},
				{ID: "animations"},
				{ID: "file_upload"},
				{ID: "dialogs_browser"},
				{ID: "lazy_tabs"},
			},
		},
		{
			Label: "Web Components Examples",
			Links: []*SidebarLink{
				{ID: "shoelace_kitchensink"},
			},
		},
		{
			Label: "Reactive Examples",
			Links: []*SidebarLink{
				{ID: "multiline_fragments"},
				{ID: "bind_keys"},
				{ID: "scroll_into_view"},
				{ID: "on_load"},
				{ID: "model_binding"},
				{ID: "disable_button"},
				{ID: "merge_options"},
				{ID: "redirects"},
				{ID: "view_transition_api"},
				{ID: "title_update_backend"},
				{ID: "store_changed"},
				{ID: "raf_update"},
				{ID: "update_store"},
				{ID: "offline_sync"},
				{ID: "refs"},
				{ID: "multiline_expressions"},
				{ID: "show"},
				{ID: "img_src_bind"},
				{ID: "dbmon"},
				{ID: "bad_apple"},
			},
		},
		{
			Label: "Backend Examples",
			Links: []*SidebarLink{
				{ID: "node"},
				{ID: "python"},
				{ID: "quick_primer_go"},
				{ID: "templ_counter"},
			},
		},
	}
	lo.ForEach(sidebarGroups, func(group *SidebarGroup, grpIdx int) {
		lo.ForEach(group.Links, func(link *SidebarLink, linkIdx int) {
			link.URL = templ.SafeURL("/examples/" + link.ID)
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

	router.Route("/examples", func(examplesRouter chi.Router) {
		examplesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, string(sidebarGroups[0].Links[0].URL), http.StatusFound)
		})

		examplesRouter.Get("/{name}", func(w http.ResponseWriter, r *http.Request) {
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

			SidebarPage(r, sidebarGroups, currentLink, contents, true).Render(r.Context(), w)
		})

		if err := errors.Join(
			setupExamplesClickToEdit(examplesRouter),
			setupExamplesBulkUpdate(examplesRouter),
			setupExamplesClickToLoad(examplesRouter),
			setupExamplesEditRow(examplesRouter),
			setupExamplesDeleteRow(examplesRouter),
			setupExamplesLazyLoad(examplesRouter),
			setupExamplesFetchIndicator(examplesRouter),
			setupExamplesOnLoad(examplesRouter, store),
			setupExamplesDisableButton(examplesRouter),
			setupExampleInlineValidation(examplesRouter),
			setupExamplesInfiniteScroll(examplesRouter),
			setupExamplesActiveSearch(examplesRouter),
			setupExamplesProgressBar(examplesRouter),
			setupExamplesValueSelect(examplesRouter),
			setupExamplesAnimations(examplesRouter),
			setupExamplesFileUpload(examplesRouter),
			setupExamplesDialogsBrowser(examplesRouter),
			setupExamplesLazyTabs(examplesRouter),
			setupExamplesMergeOptions(examplesRouter),
			setupExamplesRedirects(examplesRouter),
			setupExamplesMultilineFragments(examplesRouter),
			setupExamplesUpdateStore(examplesRouter),
			setupExamplesOfflineSync(examplesRouter, store),
			setupExamplesDbmon(examplesRouter),
			setupExamplesBadApple(examplesRouter),
			//
			setupExamplesShoelaceKitchensink(examplesRouter),
			//
			setupExamplesViewTransitionAPI(examplesRouter),
			setupExamplesModelBinding(examplesRouter),
			setupExamplesTitleUpdateBackend(examplesRouter),
			setupExamplesStoreChanged(examplesRouter, store),
			setupExamplesScrollIntoView(examplesRouter),
			setupExamplesQuickPrimerGo(examplesRouter),
			setupExamplesTemplCounter(examplesRouter, store),
			setupExamplesShow(examplesRouter),
		); err != nil {
			panic(fmt.Sprintf("error setting up examples routes: %s", err))
		}
	})

	return nil
}
