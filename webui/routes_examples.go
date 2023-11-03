package webui

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

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

	Render(w, Page(
		DIV(
			CLS("flex flex-col items-center p-8"),
			DIV(
				CLS("flex flex-col max-w-5xl w-full prose"),
				RAW(mdBuf.String()),
				GRP(children...),
			),
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
		examples := []Example{
			{
				Pattern:     "Click to Edit",
				Description: "Demonstrates inline editing of a data object",
			},
			{
				Pattern:     "Bulk Update",
				Description: "Demonstrates bulk updating of multiple rows of data",
			},
		}
		exampleRows := RANGE(examples, func(e Example) NODE {
			return TR(
				TD(
					A(
						HREF("/examples/"+toolbelt.Cased(e.Pattern, toolbelt.Snake, toolbelt.Lower)),
						CLS("flex flex-col gap-2"),
						TXT(e.Pattern),
					),
				),
				TD(
					CLS("text-sm"),
					TXT(e.Description),
				),
			)
		})
		examplesRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			Render(w, Page(
				DIV(
					CLS("flex flex-col justify-center p-16"),
					DIV(
						CLS("flex flex-col gap-4"),
						DIV(
							DIV(
								CLS("text-4xl font-bold text-primary"),
								TXT("Examples*"),
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
							TBODY(exampleRows),
						),
						DIV(
							CLS("text-accent font-bold italic"),
							TXT("* All examples use server-side logic in Go but you can use any language you like."),
						),
					),
				),
			))
		})

		if err := errors.Join(
			setupExamplesClickToEdit(ctx, examplesRouter),
			setupExamplesBulkUpdate(ctx, examplesRouter),
		); err != nil {
			return fmt.Errorf("error setting up examples routes: %w", err)
		}

		return nil
	})
}
