package site

import (
	"errors"
	"fmt"
	"net/http"

	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/go-sanitize/sanitize"
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
	sanitizer, err = sanitize.New()
	if err != nil {
		return fmt.Errorf("error creating sanitizer: %w", err)
	}

	mdElementRenderers, _, err := markdownRenders("examples")
	if err != nil {
		return err
	}

	type Example struct {
		URL         string
		Label       string
		Description string
		Prev, Next  *Example
	}
	type ExampleGroup struct {
		Label    string
		Examples []*Example
	}
	var (
		prevExample   *Example
		examplesByURL = map[string]*Example{}
	)
	examples := lo.Map([]ExampleGroup{
		{
			Label: "Ported HTMX Examples",
			Examples: []*Example{
				{Label: "Click to Edit", Description: "inline editing of a data object"},
				{Label: "Bulk Update", Description: "bulk updating of multiple rows of data"},
				{Label: "Click to Load", Description: "loading data on demand"},
				{Label: "Delete Row", Description: "row deletion in a table"},
				{Label: "Edit Row", Description: "how to edit rows in a table"},
				{Label: "Lazy Load", Description: "how to lazy load content"},
				{Label: "Fetch Indicator", Description: "show a loading indicator when fetching data"},
				{Label: "Inline Validation", Description: "how to do inline field validation"},
				{Label: "Infinite Scroll", Description: "infinite scrolling of a page"},
				{Label: "Active Search", Description: "the active search box pattern"},
				{Label: "Progress Bar", Description: "a job-runner like progress bar"},
				{Label: "Value Select", Description: "making the values of a select dependent on another select"},
				{Label: "Animations", Description: "various animation techniques"},
				{Label: "File Upload", Description: "how to upload a file via ajax with a progress bar"},
				{Label: "Dialogs Browser", Description: "the prompt and confirm dialogs"},
				{Label: "Lazy Tabs", Description: "how to lazy load tabs"},
			},
		},
		{
			Label: "Web Components Examples",
			Examples: []*Example{
				{Label: "Shoelace Kitchensink", Description: "the Shoelace Web Components library"},
			},
		},
	}, func(g ExampleGroup, i int) ExampleGroup {
		for j, example := range g.Examples {
			g.Examples[j].URL = "/examples/" + toolbelt.Cased(g.Examples[j].Label, toolbelt.Snake, toolbelt.Lower)
			if prevExample != nil {
				example.Prev = prevExample
				prevExample.Next = example
			}
			prevExample = example
			examplesByURL[example.URL] = example
		}
		return g
	})

	router.Route("/examples", func(examplesRouter chi.Router) {

		examplesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, examples[0].Examples[0].URL, http.StatusFound)
		})

		examplesRouter.Get("/{exampleName}", func(w http.ResponseWriter, r *http.Request) {
			exampleName := chi.URLParam(r, "exampleName")
			contents, ok := mdElementRenderers[exampleName]
			if !ok {
				http.Error(w, "not found", http.StatusNotFound)
				return
			}

			example, ok := examplesByURL[r.URL.Path]
			if !ok {
				http.Error(w, "not found", http.StatusNotFound)
			}

			contentGroup := []ElementRenderer{}
			if example.Prev != nil {
				contentGroup = append(contentGroup,
					H2(link(example.Prev.URL, "Back to "+example.Prev.Label, false)),
				)
			}
			contentGroup = append(contentGroup, contents)
			if example.Next != nil {
				contentGroup = append(contentGroup,
					H2(link(example.Next.URL, "Next "+example.Next.Label, false)),
				)
			}

			sidebarContents := Group(
				Range(examples, func(g ExampleGroup) ElementRenderer {
					return DIV(
						DIV(
							DIV().CLASS("text-2xl font-bold text-primary").Text(g.Label+"*"),
							HR().CLASS("divider border-primary"),
						),
						TABLE().
							CLASS("table w-full").
							Children(
								THEAD(
									TR(
										TH().Text("Pattern"),
										TH().Text("Description"),
									),
								),
								TBODY(
									Range(g.Examples, func(e *Example) ElementRenderer {
										return TR().
											CLASS("hover").
											Children(
												TD(link(e.URL, e.Label, e.URL == r.URL.Path)),
												TD().CLASS("text-xs").Text(e.Description),
											)
									}),
								),
							),
					)
				}),
				DIV().
					CLASS("text-accent font-bold italic").
					Text("*All examples use server-side logic in Go but you can use any language you like."),
			)

			pp := prosePage(r, sidebarContents, Group(contentGroup...), nil)
			pp.Render(w)
		})

		if err := errors.Join(
			setupExamplesClickToEdit(examplesRouter),
			setupExamplesBulkUpdate(examplesRouter),
			setupExamplesClickToLoad(examplesRouter),
			setupExamplesEditRow(examplesRouter),
			setupExamplesDeleteRow(examplesRouter),
			setupExamplesLazyLoad(examplesRouter),
			setupExamplesFetchIndicator(examplesRouter),
			setupExampleInlineValidation(examplesRouter),
			setupExamplesInfiniteScroll(examplesRouter),
			setupExamplesActiveSearch(examplesRouter),
			setupExamplesProgressBar(examplesRouter),
			setupExamplesValueSelect(examplesRouter),
			setupExamplesAnimations(examplesRouter),
			setupExamplesFileUpload(examplesRouter),
			setupExamplesDialogsBrowser(examplesRouter),
			setupExamplesLazyTabs(examplesRouter),
			//
			setupExamplesShoelaceKitchensink(examplesRouter),
		); err != nil {
			panic(fmt.Sprintf("error setting up examples routes: %s", err))
		}
	})

	return nil
}
