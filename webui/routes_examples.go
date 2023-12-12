package webui

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/go-sanitize/sanitize"
)

var sanitizer *sanitize.Sanitizer

func examplePage(w http.ResponseWriter, r *http.Request, children ...NODE) error {
	nameParts := strings.Split(r.URL.Path, "/")
	name := nameParts[len(nameParts)-1]
	markdownPath := fmt.Sprintf("static/examples/%s.md", name)

	mdBytes, err := staticFS.ReadFile(markdownPath)
	if err != nil {
		return fmt.Errorf("error reading examples dir: %w", err)
	}

	mdBuf := bytes.NewBuffer(nil)
	if err := markdownConverter.Convert(mdBytes, mdBuf); err != nil {
		return fmt.Errorf("error converting markdown: %w", err)
	}

	back := A(
		HREF("/examples"),
		CLS("btn btn-primary"),
		material_symbols.ArrowBack(),
		TXT("Back to Examples"),
	)

	Render(w, Page(
		DIV(
			CLS("flex flex-col items-center p-8 gap-8"),
			back,
			DIV(
				CLS("flex flex-col max-w-5xl w-full prose"),
				RAW(mdBuf.String()),
				GRP(children...),
			),
			back,
		),
	))

	return nil
}

func setupExamples(ctx context.Context, router *chi.Mux) (err error) {
	sanitizer, err = sanitize.New()
	if err != nil {
		return fmt.Errorf("error creating sanitizer: %w", err)
	}
	return Route(ctx, router, "/examples", func(ctx context.Context, examplesRouter chi.Router) error {
		type Example struct {
			Pattern     string
			Description string
		}
		type ExampleGroup struct {
			Label    string
			Examples []Example
		}
		examples := []ExampleGroup{
			{
				Label: "Ported HTMX Examples*",
				Examples: []Example{
					{Pattern: "Click to Edit", Description: "Demonstrates inline editing of a data object"},
					{Pattern: "Bulk Update", Description: "Demonstrates bulk updating of multiple rows of data"},
					{Pattern: "Click to Load", Description: "Demonstrates loading data on demand"},
					{Pattern: "Delete Row", Description: "Demonstrates row deletion in a table"},
					{Pattern: "Edit Row", Description: "Demonstrates how to edit rows in a table"},
					{Pattern: "Lazy Load", Description: "Demonstrates how to lazy load content"},
					{Pattern: "Inline Validation", Description: "Demonstrates how to do inline field validation"},
					{Pattern: "Infinite Scroll", Description: "Demonstrates infinite scrolling of a page"},
					{Pattern: "Active Search", Description: "Demonstrates the active search box pattern"},
					{Pattern: "Progress Bar", Description: "Demonstrates a job-runner like progress bar"},
					{Pattern: "Value Select", Description: "Demonstrates making the values of a select dependent on another select"},
					{Pattern: "Animations", Description: "Demonstrates various animation techniques"},
					{Pattern: "File Upload", Description: "Demonstrates how to upload a file via ajax with a progress bar"},
					{Pattern: "Dialogs - Browser", Description: "Demonstrates the prompt and confirm dialogs"},
					{Pattern: "Dialogs - DaisyUI", Description: "Demonstrates modal dialogs using Bootstrap"},
					{Pattern: "Lazy Tabs", Description: "Demonstrates how to lazy load tabs"},
					// {Pattern: "Tabs (Using Hyperscript)", Description: "Demonstrates how to display and select tabs using Hyperscript"},
					// {Pattern: "Keyboard Shortcuts", Description: "Demonstrates how to create keyboard shortcuts for htmx enabled elements"},
					// {Pattern: "Sortable", Description: "Demonstrates how to use htmx with the Sortable.js plugin to implement drag-and-drop reordering"},
					// {Pattern: "Updating Other Content", Description: "Demonstrates how to update content beyond just the target elements"},
					// {Pattern: "Confirm", Description: "Demonstrates how to implement a custom confirmation dialog with htmx"},
				},
			},
			{
				Label: "Web Components Examples*",
				Examples: []Example{
					{Pattern: "Shoelace Kitchensink", Description: "Demonstrates the Shoelace Web Components library"},
				},
			},
		}

		examplesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			Render(w, Page(
				DIV(
					CLS("flex flex-col items-center p-16"),
					DIV(
						CLS("flex flex-col gap-8 max-w-5xl"),
						RANGE(examples, func(g ExampleGroup) NODE {
							return DIV(
								DIV(
									DIV(
										CLS("text-4xl font-bold text-primary"),
										TXT(g.Label+"*"),
									),
									HR(
										CLS("divider border-primary"),
									),
								),
								TABLE(
									CLS("table w-full"),
									THEAD(TR(
										TH(TXT("Pattern")),
										TH(TXT("Description")),
									)),
									TBODY(
										RANGE(g.Examples, func(e Example) NODE {
											return TR(
												CLS("hover"),
												TD(A(
													CLS("link-secondary disable"),
													HREF("/examples/"+toolbelt.Cased(e.Pattern, toolbelt.Snake, toolbelt.Lower)),
													TXT(e.Pattern),
												)),
												TD(
													CLS("text-sm"),
													TXT(e.Description),
												),
											)
										}),
									),
								),
							)
						}),
						DIV(
							CLS("text-accent font-bold italic"),
							TXT("All examples use server-side logic in Go but you can use any language you like."),
						),
					),
				),
			))
		})

		if err := errors.Join(
			setupExamplesClickToEdit(ctx, examplesRouter),
			setupExamplesBulkUpdate(ctx, examplesRouter),
			setupExamplesClickToLoad(ctx, examplesRouter),
			setupExamplesEditRow(ctx, examplesRouter),
			setupExamplesDeleteRow(ctx, examplesRouter),
			setupExamplesLazyLoad(ctx, examplesRouter),
			setupExampleInlineValidation(ctx, examplesRouter),
			setupExamplesInfiniteScroll(ctx, examplesRouter),
			setupExamplesActiveSearch(ctx, examplesRouter),
			setupExamplesProgressBar(ctx, examplesRouter),
			setupExamplesValueSelect(ctx, examplesRouter),
			setupExamplesAnimations(ctx, examplesRouter),
			setupExamplesFileUpload(ctx, examplesRouter),
			setupExamplesDialogsBrowser(ctx, examplesRouter),
			setupExamplesDialogsDaisyUI(ctx, examplesRouter),
			setupExamplesLazyTabs(ctx, examplesRouter),
			//
			setupExamplesShoelaceKitchensink(ctx, examplesRouter),
		); err != nil {
			return fmt.Errorf("error setting up examples routes: %w", err)
		}

		return nil
	})
}

var SignalStore = GRP(
	H4(TXT("Signal Store")),
	PRE(datastar.Text("ds.JSONStringify(ctx.store)")),
)
