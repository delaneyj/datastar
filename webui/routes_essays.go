package webui

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	. "github.com/delaneyj/toolbelt/gomps"
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
	"mvdan.cc/xurls/v2"
)

func setupEssays(ctx context.Context, router *chi.Mux) error {

	const essaysPath = "static/essays"
	dirEntries, err := staticFS.ReadDir(essaysPath)
	if err != nil {
		return fmt.Errorf("error reading essays dir: %w", err)
	}

	type Essay struct {
		Name  string
		Title string
		Body  NODE
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

		title := strings.Replace(de.Name(), "-", " ", -1)
		title = strings.Replace(title, ".md", "", -1)
		title = titleCaser.String(title)

		essay := Essay{
			Name:  de.Name()[0 : len(de.Name())-3],
			Title: title,
			Body:  RAW(buf.String()),
		}
		essays[essay.Name] = essay

	}

	router.Route("/essays", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			essayEntries := lo.Values(essays)

			Render(w, Page(
				DIV(
					CLS("flex flex-col items-center p-16"),
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
										TXT(e.Title),
										HREF("/essays/"+e.Name),
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
						CLS("prose lg:prose-xl xl:prose-2xl"),
						contents,
					),
				),
			))
		})

	})

	return nil
}
