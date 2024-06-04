package site

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/a-h/templ"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/go-sanitize/sanitize"
	"github.com/gorilla/sessions"
	"github.com/samber/lo"
)

var (
	sanitizer   *sanitize.Sanitizer
	SignalStore = Group(
		H4(Text("Signal Store")),
		PRE().DATASTAR_TEXT("JSON.stringify(ctx.store())"),
	)
)

func setupExamples(router chi.Router) (err error) {
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
				{ID: "scroll_into_view"},
				{ID: "on_load", IsDisabled: true},
				{ID: "model_binding", IsDisabled: true},
				{ID: "disable_button", IsDisabled: true},
				{ID: "merge_options", IsDisabled: true},
				{ID: "redirects", IsDisabled: true},
				{ID: "view_transition_api", IsDisabled: true},
				{ID: "title_update_backend", IsDisabled: true},
				{ID: "store_changed", IsDisabled: true},
				{ID: "raf_update", IsDisabled: true},
				{ID: "update_store", IsDisabled: true},
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

			SidebarPage(r, sidebarGroups, currentLink, contents).Render(r.Context(), w)
		})

		// mdElementRenderers, _, err := markdownRenders("examples")
		// if err != nil {
		// 	return err
		// }

		// type Example struct {
		// 	URL         string
		// 	Label       string
		// 	Description string
		// 	Prev, Next  *Example
		// }
		// type ExampleGroup struct {
		// 	Label    string
		// 	Examples []*Example
		// }
		// var (
		// 	prevExample   *Example
		// 	examplesByURL = map[string]*Example{}
		// )
		// examples := lo.Map([]ExampleGroup{
		// 	{
		// 		Label: "Ported HTMX Examples",
		// 		Examples: []*Example{
		// 			{Label: "Click to Edit", Description: "inline editing of a data object"},
		// 			{Label: "Bulk Update", Description: "bulk updating of multiple rows of data"},
		// 			{Label: "Click to Load", Description: "loading data on demand"},
		// 			{Label: "Delete Row", Description: "row deletion in a table"},
		// 			{Label: "Edit Row", Description: "how to edit rows in a table"},
		// 			{Label: "Lazy Load", Description: "how to lazy load content"},
		// 			{Label: "Fetch Indicator", Description: "show a loading indicator when fetching data"},
		// 			{Label: "Inline Validation", Description: "how to do inline field validation"},
		// 			{Label: "Infinite Scroll", Description: "infinite scrolling of a page"},
		// 			{Label: "Active Search", Description: "the active search box pattern"},
		// 			{Label: "Progress Bar", Description: "a job-runner like progress bar"},
		// 			{Label: "Value Select", Description: "making the values of a select dependent on another select"},
		// 			{Label: "Animations", Description: "various animation techniques"},
		// 			{Label: "File Upload", Description: "how to upload a file via ajax with a progress bar"},
		// 			{Label: "Dialogs Browser", Description: "the prompt and confirm dialogs"},
		// 			{Label: "Lazy Tabs", Description: "how to lazy load tabs"},
		// 		},
		// 	},
		// 	{
		// 		Label: "Web Components Examples",
		// 		Examples: []*Example{
		// 			{Label: "Shoelace Kitchensink", Description: "the Shoelace Web Components library"},
		// 		},
		// 	},
		// 	{
		// 		Label: "Reactive Examples",
		// 		Examples: []*Example{
		// 			{Label: "Multiline Fragments", Description: "multiline fragments"},
		// 			{Label: "Scroll Into View", Description: "scrolling an element into view"},
		// 			{Label: "On Load", Description: "how to load data on page load"},
		// 			{Label: "Model Binding", Description: "two-way data binding to signals"},
		// 			{Label: "Disable Button", Description: "how to disable a button while processing"},
		// 			{Label: "Merge Options", Description: "how to merge options in a select"},
		// 			{Label: "Redirects", Description: "how to redirect to another page"},
		// 			{Label: "View Transition API", Description: "using the view transition API"},
		// 			{Label: "Title Update Backend", Description: "target a specific element for updates"},
		// 			{Label: "Store Changed", Description: "detect when a store has changed"},
		// 			{Label: "RAF Update", Description: "update a signal on requestAnimationFrame"},
		// 			{Label: "Update Store", Description: "update a store from an SSE event"},
		// 		},
		// 	},
		// 	{
		// 		Label: "Backend Examples",
		// 		Examples: []*Example{
		// 			{Label: "Node", Description: "example backend in node"},
		// 			{Label: "Python", Description: "example backend in python"},
		// 			{Label: "Quick Primer Go", Description: "The getting started guide in Go"},
		// 			{Label: "Templ Counter", Description: "a simple counter example for Templ"},
		// 		},
		// 	},
		// }, func(g ExampleGroup, i int) ExampleGroup {
		// 	for j, example := range g.Examples {
		// 		g.Examples[j].URL = "/examples/" + toolbelt.Cased(g.Examples[j].Label, toolbelt.Snake, toolbelt.Lower)
		// 		if prevExample != nil {
		// 			example.Prev = prevExample
		// 			prevExample.Next = example
		// 		}
		// 		prevExample = example
		// 		examplesByURL[example.URL] = example
		// 	}
		// 	return g
		// })

		// router.Route("/examples", func(examplesRouter chi.Router) {

		// 	examplesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
		// 		http.Redirect(w, r, examples[0].Examples[0].URL, http.StatusFound)
		// 	})

		// 	examplesRouter.Get("/{exampleName}", func(w http.ResponseWriter, r *http.Request) {
		// 		exampleName := chi.URLParam(r, "exampleName")
		// 		contents, ok := mdElementRenderers[exampleName]
		// 		if !ok {
		// 			http.Error(w, "not found", http.StatusNotFound)
		// 			return
		// 		}

		// 		example, ok := examplesByURL[r.URL.Path]
		// 		if !ok {
		// 			http.Error(w, "not found", http.StatusNotFound)
		// 		}

		// 		contentGroup := []ElementRenderer{}
		// 		if example.Prev != nil {
		// 			contentGroup = append(contentGroup,
		// 				buttonLink().
		// 					CLASS("w-full").
		// 					HREF(example.Prev.URL).
		// 					Text("Back to "+example.Prev.Label).
		// 					CLASS("flex flex-col justify-center items-center no-underline"))
		// 		}
		// 		contentGroup = append(contentGroup, contents)

		// 		nextHREF := "/reference"
		// 		nextLabel := "Dive deeper"

		// 		if example.Next != nil {
		// 			nextHREF = example.Next.URL
		// 			nextLabel = "Next " + example.Next.Label
		// 		}
		// 		contentGroup = append(contentGroup,
		// 			buttonLink().
		// 				CLASS("w-full").
		// 				HREF(nextHREF).
		// 				Text(nextLabel).
		// 				CLASS("flex flex-col justify-center items-center no-underline"))

		// 		sidebarContents := Group(
		// 			Range(examples, func(g ExampleGroup) ElementRenderer {
		// 				return DIV(
		// 					DIV(
		// 						DIV().CLASS("text-2xl font-bold text-primary").Text(g.Label),
		// 						HR().CLASS("divider border-primary"),
		// 					),
		// 					TABLE().
		// 						CLASS("table w-full").
		// 						Children(
		// 							THEAD(
		// 								TR(
		// 									TH().Text("Pattern"),
		// 									TH().Text("Description"),
		// 								),
		// 							),
		// 							TBODY(
		// 								Range(g.Examples, func(e *Example) ElementRenderer {
		// 									return TR().
		// 										CLASS("hover").
		// 										Children(
		// 											TD(link(e.URL, e.Label, e.URL == r.URL.Path)),
		// 											TD().CLASS("text-xs").Text(e.Description),
		// 										)
		// 								}),
		// 							),
		// 						),
		// 				)
		// 			}),
		// 		)

		// 		pp := prosePage(r, sidebarContents, Group(contentGroup...), nil)
		// 		pp.Render(w)
		// 	})

		examplesSessionStore := sessions.NewCookieStore([]byte("ExampleSession"))

		if err := errors.Join(
			setupExamplesClickToEdit(examplesRouter),
			setupExamplesBulkUpdate(examplesRouter),
			setupExamplesClickToLoad(examplesRouter),
			setupExamplesEditRow(examplesRouter),
			setupExamplesDeleteRow(examplesRouter),
			setupExamplesLazyLoad(examplesRouter),
			setupExamplesFetchIndicator(examplesRouter),
			setupExamplesOnLoad(examplesRouter, examplesSessionStore),
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
			//
			setupExamplesShoelaceKitchensink(examplesRouter),
			//
			setupExamplesViewTransitionAPI(examplesRouter),
			setupExamplesModelBinding(examplesRouter),
			setupExamplesTitleUpdateBackend(examplesRouter),
			setupExamplesStoreChanged(examplesRouter, examplesSessionStore),
			setupExamplesScrollIntoView(examplesRouter),
			setupExamplesQuickPrimerGo(examplesRouter),
			setupExamplesTemplCounter(examplesRouter, examplesSessionStore),
		); err != nil {
			panic(fmt.Sprintf("error setting up examples routes: %s", err))
		}
	})

	return nil
}
