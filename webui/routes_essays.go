package webui

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	chromahtml "github.com/alecthomas/chroma/v2/formatters/html"
	. "github.com/delaneyj/gostar/elements"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
	"github.com/yuin/goldmark"
	emoji "github.com/yuin/goldmark-emoji"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"go.abhg.dev/goldmark/anchor"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
	"gopkg.in/typ.v4/slices"
	"mvdan.cc/xurls/v2"
)

var markdownConverter = goldmark.New(
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
		highlighting.NewHighlighting(
			highlighting.WithStyle("gruvbox"),
			highlighting.WithFormatOptions(
				chromahtml.WithLineNumbers(true),
			),
		),
	),
	goldmark.WithParserOptions(
		parser.WithAutoHeadingID(),
		parser.WithAttribute(),
	),
	goldmark.WithRendererOptions(
		html.WithHardWraps(),
		html.WithXHTML(),
		html.WithUnsafe(),
	),
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
		Body        ElementRenderer
		LastUpdated time.Time
	}

	essays := map[string]Essay{}
	titleCaser := cases.Title(language.English)

	for _, de := range dirEntries {
		fullPath := filepath.Join(essaysPath, de.Name())
		source, err := staticFS.ReadFile(fullPath)
		if err != nil {
			return fmt.Errorf("error reading essay %s: %w", de.Name(), err)
		}

		var buf bytes.Buffer
		if err := markdownConverter.Convert(source, &buf); err != nil {
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
			Body:        Text(buf.String()),
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

			Page(
				DIV(
					DIV(
						DIV(
							H1(Text("Essays")).CLASS("text-xl md:text-6xl font-bold text-primary"),
							HR().CLASS("divider border-primary"),
						),
						UL(
							Range(essayEntries, func(e Essay) ElementRenderer {
								return LI(
									A(
										SPAN(Text(humanize.Time(e.LastUpdated))).CLASS("text-lg text-accent"),
										SPAN(Text(e.Title)).CLASS("text-center"),
									).
										HREF("/essays/" + e.Name).
										CLASS("flex flex-col gap-2 justify-center items-center"),
								).CLASS("text-center")
							}),
						).CLASS("menu text-xl md:text-4xl gap-8"),
					).CLASS("flex flex-col gap-4"),
				).CLASS("flex flex-col justify-center p-16"),
			).Render(w)
		})

		essaysRouter.Get("/{essayName}", func(w http.ResponseWriter, r *http.Request) {
			essayName := chi.URLParam(r, "essayName")
			essay, ok := essays[essayName]

			var contents ElementRenderer
			if !ok {
				contents = ERR(fmt.Errorf("essay not found"))
			} else {
				contents = essay.Body
			}

			Page(
				DIV(
					DIV(
						DIV(
							A(Text("Other Essays")).HREF("/essays").CLASS("btn btn-primary btn-sm"),
						).CLASS("flex justify-start w-full"),
						DIV(
							H3(Text(essay.LastUpdated.Format("January 2, 2006"))).CLASS("text-6xl font-bold text-accent"),
							contents,
						),
					).CLASS("prose-sm md:prose lg:prose-xl xl:prose-2xl flex flex-col gap-8"),
				).CLASS("flex flex-col items-center justify-center p-8"),
			).Render(w)
		})

	})

	return nil
}
