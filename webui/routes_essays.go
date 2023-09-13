package webui

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
	"github.com/yuin/goldmark"
	emoji "github.com/yuin/goldmark-emoji"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"go.abhg.dev/goldmark/anchor"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"gopkg.in/typ.v4/slices"
	"mvdan.cc/xurls/v2"
)

func setupEssays(ctx context.Context, router *chi.Mux) error {

	const essaysPath = "static/essays"
	dirEntries, err := staticFS.ReadDir(essaysPath)
	if err != nil {
		return fmt.Errorf("error reading essays dir: %w", err)
	}

	type Essay struct {
		Name        string
		Title       string
		Body        NODE
		LastUpdated time.Time
	}

	essays := map[string]Essay{}
	titleCaser := cases.Title(language.English)

	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			extension.NewLinkify(
				extension.WithLinkifyAllowedProtocols([][]byte{
					[]byte("http:"),
					[]byte("https:"),
				}),
				extension.WithLinkifyURLRegexp(
					xurls.Strict(),
				),
			),
			emoji.Emoji,
			&anchor.Extender{},
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
			parser.WithAttribute(),
		),
		goldmark.WithRendererOptions(
			html.WithHardWraps(),
			html.WithXHTML(),
		),
	)

	for _, de := range dirEntries {
		fullPath := filepath.Join(essaysPath, de.Name())
		source, err := staticFS.ReadFile(fullPath)
		if err != nil {
			return fmt.Errorf("error reading essay %s: %w", de.Name(), err)
		}

		var buf bytes.Buffer
		if err := md.Convert(source, &buf); err != nil {
			return fmt.Errorf("error converting essay %s: %w", de.Name(), err)
		}

		parts := strings.Split(de.Name(), "_")
		if len(parts) != 2 {
			return fmt.Errorf("invalid essay name: %s", de.Name())
		}

		lastUpdated, err := time.Parse("2006-01-02", parts[0])
		if err != nil {
			return fmt.Errorf("invalid essay name: %s", de.Name())
		}

		title := strings.Replace(parts[1], "-", " ", -1)
		title = strings.Replace(title, ".md", "", -1)
		title = titleCaser.String(title)

		essay := Essay{
			Name:        de.Name()[0 : len(de.Name())-3],
			Title:       title,
			Body:        RAW(buf.String()),
			LastUpdated: lastUpdated,
		}
		essays[essay.Name] = essay
	}

	router.Route("/essays", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			essayEntries := lo.Values(essays)

			slices.SortFunc(essayEntries, func(a, b Essay) bool {
				return a.LastUpdated.After(b.LastUpdated)
			})

			Render(w, Page(
				DIV(
					CLS("flex flex-col justify-center p-16"),
					DIV(
						CLS("flex flex-col gap-4"),
						DIV(
							H1(
								CLS("text-6xl font-bold text-primary"),
								TXT("Essays"),
							),
							HR(
								CLS("divider border-primary"),
							),
						),
						UL(
							CLS("menu text-4xl gap-8"),
							RANGE(essayEntries, func(e Essay) NODE {
								return LI(
									CLS("text-center"),
									A(
										HREF("/essays/"+e.Name),
										CLS("flex flex-col gap-2"),
										SPAN(
											CLS("text-lg text-accent"),
											TXT(humanize.Time(e.LastUpdated)),
										),
										SPAN(TXT(e.Title)),
									),
								)
							}),
						),
					),
				),
			))
		})

		essaysRouter.Get("/{essayName}", func(w http.ResponseWriter, r *http.Request) {
			essayName := chi.URLParam(r, "essayName")
			essay, ok := essays[essayName]

			var contents NODE
			if !ok {
				contents = ERR(fmt.Errorf("essay not found"))
			} else {
				contents = essay.Body
			}

			Render(w, Page(
				DIV(
					CLS("flex flex-col items-center justify-center p-8"),
					DIV(
						CLS("prose lg:prose-xl xl:prose-2xl flex flex-col gap-8"),
						DIV(
							CLS("flex justify-start w-full"),
							A(
								CLS("btn btn-primary btn-sm"),
								TXT("Other Essays"),
								HREF("/essays"),
							),
						),

						DIV(
							H3(
								CLS("text-6xl font-bold text-accent"),
								TXT(essay.LastUpdated.Format("January 2, 2006")),
							),
							contents,
						),
					),
				),
			))
		})

	})

	return nil
}
