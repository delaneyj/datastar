package site

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"regexp"
	"slices"
	"strconv"
	"strings"

	"github.com/a-h/templ"
	"github.com/alecthomas/chroma"
	"github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/lexers"
	"github.com/alecthomas/chroma/styles"
	"github.com/delaneyj/toolbelt"
	"github.com/goccy/go-json"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/ast"
	mdhtml "github.com/gomarkdown/markdown/html"
	"github.com/gomarkdown/markdown/parser"
	datastar "github.com/starfederation/datastar/code/go/sdk"
	"github.com/valyala/bytebufferpool"
)

var (
	mdRenderer    func() *mdhtml.Renderer
	htmlHighlight func(w io.Writer, source, lang, defaultLang string) error
)

type CodeSnippet struct {
	Path               toolbelt.CasedString
	Extension          string
	Icon               string
	Content            string
	ContentHighlighted string
}

type CodeSnippetBlock struct {
	BasePath toolbelt.CasedString
	Snippets []CodeSnippet
}

var sdkIcons = map[string]string{
	"go": "vscode-icons:file-type-go-gopher",
	// "fs":      "vscode-icons:file-type-fsharp",
	// "cs":      "vscode-icons:file-type-csharp2",
	"php": "vscode-icons:file-type-php2",
	"ts":  "vscode-icons:file-type-typescript-official",
	// "js":      "vscode-icons:file-type-js-official",
	// "haskell": "vscode-icons:file-type-haskell",
	// "java":    "vscode-icons:file-type-java",
}
var sdkLanguageNames = map[string]string{
	"go":  "Go",
	"php": "PHP",
	"ts":  "TypeScript",
}
var sdksAvailable = []string{"go", "php", "ts"}

func markdownRenders(ctx context.Context, staticMdPath string) (mdElementRenderers map[string]string, mdAnchors map[string][]string, err error) {
	if mdRenderer == nil {
		htmlFormatter := html.New(html.WithClasses(true), html.TabWidth(2))
		if htmlFormatter == nil {
			return nil, nil, fmt.Errorf("couldn't create html formatter")
		}
		styleName := "nord"
		highlightStyle := styles.Get(styleName)
		if highlightStyle == nil {
			return nil, nil, fmt.Errorf("couldn't find style %s", styleName)
		}
		highlightCSSBuffer := &bytes.Buffer{}
		if err := htmlFormatter.WriteCSS(highlightCSSBuffer, highlightStyle); err != nil {
			return nil, nil, fmt.Errorf("error writing highlight css: %w", err)
		}
		highlightCSS = templ.ComponentFunc(func(ctx context.Context, w io.Writer) error {
			_, err := io.WriteString(w, fmt.Sprintf(`<style>%s</style>`, highlightCSSBuffer.String()))
			return err
		})
		// based on https://github.com/alecthomas/chroma/blob/master/quick/quick.go
		htmlHighlight = func(w io.Writer, source, lang, defaultLang string) error {
			if lang == "" {
				lang = defaultLang
			}
			l := lexers.Get(lang)
			if l == nil {
				l = lexers.Analyse(source)
			}
			if l == nil {
				l = lexers.Fallback
			}
			l = chroma.Coalesce(l)

			it, err := l.Tokenise(nil, source)
			if err != nil {
				return err
			}
			return htmlFormatter.Format(w, highlightStyle, it)
		}

		mdRenderer = func() *mdhtml.Renderer {
			return mdhtml.NewRenderer(mdhtml.RendererOptions{
				Flags: mdhtml.CommonFlags | mdhtml.HrefTargetBlank,
				RenderNodeHook: func(w io.Writer, node ast.Node, entering bool) (ast.WalkStatus, bool) {
					skipDefaultRenderer := false
					switch n := node.(type) {
					case *ast.CodeBlock:
						defaultLang := ""
						lang := string(n.Info)
						htmlHighlight(w, string(n.Literal), lang, defaultLang)
						skipDefaultRenderer = true
					case *ast.Heading:
						if entering {
							break
						}
						buf := bytebufferpool.Get()
						defer bytebufferpool.Put(buf)
						level := strconv.Itoa(n.Level)
						if level != "1" {
							buf.WriteString(`<a class="prose link-neutral" href="#`)
							buf.WriteString(n.HeadingID)
							buf.WriteString(`">#</a>`)
						}
						buf.WriteString(`</h`)
						buf.WriteString(level)
						buf.WriteString(`>`)
						buf.WriteTo(w)
						skipDefaultRenderer = true
					}
					return ast.GoToNext, skipDefaultRenderer
				},
			})
		}
	}

	mdDir := "static/md/" + staticMdPath
	docs, err := staticFS.ReadDir(mdDir)
	if err != nil {
		return nil, nil, fmt.Errorf("error reading docs dir: %w", err)
	}

	// regExpImg := regexp.MustCompile(`(?P<whole>!\[[^\]]+]\((?P<path>[^)]+)\))`)
	// prefix := []byte("/static/")

	codeSnippets := regexp.MustCompile(`!!!CODE_SNIPPET:(?<basePath>[^!]*)!!!`)
	// Icon or mascot from https://icones.js.org/collection/vscode-icons

	mdElementRenderers = map[string]string{}
	mdAnchors = map[string][]string{}
	for _, de := range docs {
		fullPath := mdDir + "/" + de.Name()

		b, err := staticFS.ReadFile(fullPath)
		if err != nil {
			return nil, nil, fmt.Errorf("error reading doc %s: %w", de.Name(), err)
		}

		// Package version
		b = bytes.ReplaceAll(b, []byte("PACKAGE_VERSION"), []byte(datastar.Version))

		// code snippets
		for _, matches := range codeSnippets.FindAllSubmatch(b, -1) {
			fullMatch := matches[0]
			basePath := string(matches[1])
			fullBasePath := "static/code_snippets/" + basePath
			fullWithTestExtension := fullBasePath + ".txt"
			baseDir := filepath.Dir(fullWithTestExtension)
			fileEntries, err := staticFS.ReadDir(baseDir)
			if err != nil {
				return nil, nil, fmt.Errorf("error reading code snippet dir %s: %w", baseDir, err)
			}
			if len(fileEntries) == 0 {
				return nil, nil, fmt.Errorf("no files found in code snippet dir %s", baseDir)
			}

			snippetBlock := CodeSnippetBlock{
				BasePath: toolbelt.ToCasedString(basePath),
				Snippets: make([]CodeSnippet, 0, len(fileEntries)),
			}

			// Find the file with the full base path prefix
			for _, fileEntry := range fileEntries {
				name := fileEntry.Name()
				fileFullPath := filepath.Join(baseDir, name)
				if !strings.HasPrefix(fileFullPath, fullBasePath) {
					continue
				}

				ext := filepath.Ext(name)[1:] // remove the dot

				codeSnippetRaw, err := staticFS.ReadFile(fileFullPath)
				if err != nil {
					return nil, nil, fmt.Errorf("error reading code snippet %s: %w", fileFullPath, err)
				}
				codeSnippet := string(codeSnippetRaw)

				buf := bytebufferpool.Get()
				defer bytebufferpool.Put(buf)

				if err := htmlHighlight(buf, codeSnippet, ext, ""); err != nil {
					return nil, nil, fmt.Errorf("error highlighting code snippet %s: %w", fileFullPath, err)
				}

				snippet := CodeSnippet{
					Extension:          ext,
					Icon:               sdkIcons[ext],
					Content:            codeSnippet,
					ContentHighlighted: buf.String(),
				}
				snippetBlock.Snippets = append(snippetBlock.Snippets, snippet)
			}
			slices.SortFunc(snippetBlock.Snippets, func(a, b CodeSnippet) int {
				return strings.Compare(a.Extension, b.Extension)
			})
			buf := bytebufferpool.Get()
			defer bytebufferpool.Put(buf)

			c := codeSnippetFragment(snippetBlock)
			c.Render(ctx, buf)

			b = bytes.ReplaceAll(b, fullMatch, buf.Bytes())
		}

		// Get all anchors
		anchors := []string{}
		lines := strings.Split(string(b), "\n")
		for _, line := range lines {
			if strings.HasPrefix(line, "#") {
				parts := strings.Split(line, " ")
				anchor := strings.Join(parts[1:], " ")
				anchors = append(anchors, anchor)
			}
		}

		mdParser := parser.NewWithExtensions(parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock | parser.Footnotes)
		doc := mdParser.Parse(b)
		renderedHTML := string(markdown.Render(doc, mdRenderer()))

		name := de.Name()[0 : len(de.Name())-3]
		mdElementRenderers[name] = renderedHTML
		mdAnchors[name] = anchors
	}

	return mdElementRenderers, mdAnchors, nil
}

func KVPairsAttrs(kvPairs ...string) templ.Attributes {
	if len(kvPairs)%2 != 0 {
		panic("kvPairs must be a multiple of 2")
	}
	attrs := templ.Attributes{}
	for i := 0; i < len(kvPairs); i += 2 {
		attrs[kvPairs[i]] = kvPairs[i+1]
	}
	return attrs
}

func logJSON(message string, v any) {
	b, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		panic(err)
	}
	log.Printf("%s: %s", message, string(b))
}
