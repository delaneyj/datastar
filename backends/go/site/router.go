package site

import (
	"bytes"
	"context"
	"embed"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/alecthomas/chroma"
	"github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/lexers"
	"github.com/alecthomas/chroma/styles"
	"github.com/benbjohnson/hashfs"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/gomarkdown/markdown/ast"
	mdhtml "github.com/gomarkdown/markdown/html"

	. "github.com/delaneyj/gostar/elements"
)

//go:embed static/*
var staticFS embed.FS

var (
	staticSys    = hashfs.NewFS(staticFS)
	highlightCSS *STYLEElement
	mdRenderer   func() *mdhtml.Renderer
)

func staticPath(path string) string {
	return "/" + staticSys.HashName("static/"+path)
}

func RunBlocking(port int) toolbelt.CtxErrFunc {
	upsertIIfeBuildSize()
	return func(ctx context.Context) error {

		b, err := staticFS.ReadFile("static/library/package.json")
		if err != nil {
			return fmt.Errorf("error reading package.json: %w", err)
		}

		packageJSON, err = UnmarshalPackageJSON(b)
		if err != nil {
			return fmt.Errorf("error unmarshaling package.json: %w", err)
		}

		router := chi.NewRouter()

		router.Use(
			middleware.Logger,
			middleware.Recoverer,
			toolbelt.CompressMiddleware(),
		)

		setupRoutes(router)

		srv := &http.Server{
			Addr:    fmt.Sprintf(":%d", port),
			Handler: router,
		}

		go func() {
			<-ctx.Done()
			srv.Shutdown(context.Background())
		}()

		return srv.ListenAndServe()

	}
}

func setupRoutes(router chi.Router) error {
	defer router.Handle("/static/*", hashfs.FileServer(staticSys))
	defer router.Get("/__hotreload", func(w http.ResponseWriter, r *http.Request) {
		sse := toolbelt.NewSSE(w, r)

		<-r.Context().Done()
		sse.Send("reload", toolbelt.WithSSERetry(250))
	})

	htmlFormatter := html.New(html.WithClasses(true), html.TabWidth(2))
	if htmlFormatter == nil {
		return fmt.Errorf("couldn't create html formatter")
	}
	styleName := "nord"
	highlightStyle := styles.Get(styleName)
	if highlightStyle == nil {
		return fmt.Errorf("couldn't find style %s", styleName)
	}
	highlightCSSBuffer := &bytes.Buffer{}
	if err := htmlFormatter.WriteCSS(highlightCSSBuffer, highlightStyle); err != nil {
		return fmt.Errorf("error writing highlight css: %w", err)
	}
	highlightCSS = STYLE().Text(highlightCSSBuffer.String())

	mdRenderer = func() *mdhtml.Renderer {
		return mdhtml.NewRenderer(mdhtml.RendererOptions{
			Flags: mdhtml.CommonFlags | mdhtml.HrefTargetBlank,
			RenderNodeHook: func(w io.Writer, node ast.Node, entering bool) (ast.WalkStatus, bool) {

				// based on https://github.com/alecthomas/chroma/blob/master/quick/quick.go
				htmlHighlight := func(w io.Writer, source, lang, defaultLang string) error {
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

				renderCode := func(w io.Writer, codeBlock *ast.CodeBlock) {
					defaultLang := ""
					lang := string(codeBlock.Info)
					htmlHighlight(w, string(codeBlock.Literal), lang, defaultLang)
				}

				if code, ok := node.(*ast.CodeBlock); ok {
					renderCode(w, code)
					return ast.GoToNext, true
				}
				return ast.GoToNext, false
			},
		})
	}

	if err := errors.Join(
		setupAPI(router),
		setupHome(router),
		setupDocs(router),
		setupReferenceRoutes(router),
		setupExamples(router),
		setupEssays(router),
	); err != nil {
		return fmt.Errorf("error setting up routes: %w", err)
	}

	return nil
}

func buttonLink(isAccent ...bool) *AElement {
	bg := "bg-primary-600 hover:bg-primary-700"
	if len(isAccent) > 0 && isAccent[0] {
		bg = "bg-accent-600 hover:bg-accent-700"
	}

	return A().
		CLASS(
			"font-brand font-bold p-4 cursor-pointer text-primary-50 rounded-md  text-center flex gap-2 items-center justify-center",
			bg,
		)
}

func link(href, text string, isHighlighted bool) *AElement {
	return A().
		IfCLASS(isHighlighted, "text-accent-200 hover:text-accent-100 underline decoration-primary-300").
		IfCLASS(!isHighlighted, "text-primary-300 hover:text-primary-200 no-underline").
		CLASS("font-bold").
		HREF(href).
		Text(text)
}

func linkChild(href string, children ...ElementRenderer) *AElement {
	return A(children...).CLASS("hover:bg-accent-500 rounded-full p-2").HREF(href)
}

func datastarLogo() *SVGSVGElement {
	return SVG_SVG().
		VIEW_BOX("0 0 128 128").
		Children(
			SVG_PATH().
				FILL("currentColor").
				D("M124.317 3.683c-.538-.515-1.268-.912-1.897-1.01a27.833 27.833 0 0 0-3.451-.304c-.985-.029-2.582.033-3.564.112-17.149 1.385-33.377 8.61-47.923 17.546-.98.601-2.551 1.604-3.503 2.249-8.577 5.806-16.27 12.957-22.41 21.308-.583.794-1.835 1.339-2.817 1.259-9.968-.814-20.434 2.617-26.808 10.5-.723.893-1.783 2.429-2.407 3.394-3.68 5.69-6.321 12.243-7.146 18.953-.14 1.141.237 3.022 1.255 3.513 1.46.703 3.4.235 5.226-.06 1.132-.184 2.998-.288 4.141-.414l14.352-1.575c.98-.108 1.927.592 2.005 1.574.47 5.897-2.002 11.47-3.318 17.187-.571 2.481 1.301 4.663 4.034 4.034 5.716-1.316 11.288-3.79 17.185-3.32.982.079 1.682 1.026 1.574 2.005l-1.574 14.354c-.125 1.142-.23 3.007-.414 4.14-.295 1.825-.764 3.766-.06 5.225.49 1.018 2.373 1.397 3.514 1.257 6.71-.825 13.263-3.466 18.953-7.146.965-.624 2.5-1.684 3.394-2.407 7.883-6.374 11.312-16.842 10.499-26.81-.08-.982.466-2.232 1.26-2.815 8.351-6.14 15.5-13.835 21.306-22.412.645-.952 1.648-2.524 2.25-3.503 8.935-14.546 16.16-30.774 17.545-47.923.08-.982.141-2.579.112-3.564a27.814 27.814 0 0 0-.303-3.45c-.098-.628-.495-1.36-1.01-1.897zM88.447 31.37c3.95 0 8.38 4.43 8.38 8.38 0 .054-3.604 3.84-8.867 7.502-2.924 2.144-9.243 2.604-8.672 5.944.575 3.37 6.625 1.883 9.938 3.118 5.484 1.898 10.716 4.28 10.718 4.287 1.377 3.703-1.699 9.3-5.456 10.523-.098.032-4.726-2.361-9.744-6.041-2.858-2.079-5.209-7.83-8.282-6.333-3.04 1.48.227 6.917.292 10.62-.17 2.81.169 8.835-.975 11.303-3.162 2.414-9.343 1.286-11.79-1.851-.189-.243.856-5.697 2.729-11.108 1.234-3.443 5.96-7.486 3.605-9.841-2.382-2.382-6.496 2.273-9.939 3.507-5.573 1.93-10.937 2.665-11.205 2.437-2.979-2.54-4.255-8.506-1.852-11.596 3.697-.695 7.772-.911 11.596-.877 3.572.065 8.914 3.316 10.426.292 1.534-3.067-4.223-5.521-6.431-8.38-1.038-1.857-5.834-8.027-5.944-9.84 1.164-3.791 6.912-6.762 10.62-5.36.066.025 2.451 5.791 4.19 10.816 1.235 3.443-.123 9.56 3.216 10.036 3.354.48 3.768-5.781 5.846-8.77 3.701-5.046 7.53-8.768 7.6-8.768z"),
			SVG_PATH().
				FILL("currentColor").
				D("M26.794 83.953C19.57 83.732 15.15 93.67 13.47 99.89c-1.422 5.67-7.77 15.862-4.497 19.135 3.273 3.273 13.464-3.075 19.136-4.497 6.22-1.68 16.157-6.1 15.936-13.322-5.283.223-12.989 5.243-19.165 3.279a2.212 2.212 0 0 1-1.365-1.366c-1.965-6.176 3.054-13.883 3.278-19.166z"),
		)
}
