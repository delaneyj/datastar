package webui

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"regexp"

	chromahtml "github.com/alecthomas/chroma/v2/formatters/html"
	"github.com/delaneyj/gomponents-iconify/iconify/carbon"
	"github.com/delaneyj/gomponents-iconify/iconify/cil"
	"github.com/delaneyj/gomponents-iconify/iconify/clarity"
	"github.com/delaneyj/gomponents-iconify/iconify/file_icons"
	"github.com/delaneyj/gomponents-iconify/iconify/game_icons"
	"github.com/delaneyj/gomponents-iconify/iconify/gridicons"
	"github.com/delaneyj/gomponents-iconify/iconify/lucide"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/gomponents-iconify/iconify/mdi"
	"github.com/delaneyj/gomponents-iconify/iconify/ph"
	"github.com/delaneyj/gomponents-iconify/iconify/streamline"
	"github.com/delaneyj/gomponents-iconify/iconify/tabler"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/yuin/goldmark"
	emoji "github.com/yuin/goldmark-emoji"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"go.abhg.dev/goldmark/anchor"
	"go.abhg.dev/goldmark/mermaid"
	"mvdan.cc/xurls/v2"
)

func setupDocs(ctx context.Context, router *chi.Mux) error {

	docsPage := func(current string, children ...NODE) NODE {
		return Page(
			DIV(
				CLS("drawer lg:drawer-open"),
				INPUT(
					ID("drawer-toggle"),
					TYPE("checkbox"),
					CLS("drawer-toggle"),
				),
				DIV(
					CLS("drawer-content flex flex-col p-4"),
					DIV(

						LABEL(
							ATTR("for", "drawer-toggle"),
							CLS("btn btn-primary drawer-button lg:hidden mb-8"),
							material_symbols.Menu(),
						),
					),
					GRP(children...),
				),
				DIV(
					CLS("drawer-side bg-base-300 text-base-content"),
					LABEL(
						ATTR("for", "drawer-toggle"),
						CLS("drawer-overlay"),
					),
					UL(
						CLS("menu w-80"),
						LI(
							DETAILS(
								ATTR("open"),
								SUMMARY(TXT("Overview")),
								UL(
									LI(
										// CLS("disabled"),
										A(
											CLSS{"active": current == "overview-declarative"},
											mdi.Xml(),
											TXT("Declarative"),
											HREF("/docs/overview-declarative"),
										),
									),
									LI(
										// CLS("disabled"),
										A(
											CLSS{"active": current == "overview-plugins"},
											gridicons.Plugins(),
											TXT("Plugins"),
											HREF("/docs/overview-plugins"),
										),
									),
								),
							),
						),
						LI(
							DETAILS(
								ATTR("open"),
								SUMMARY(TXT("Included Plugins")),
								UL(
									LI(
										DETAILS(
											ATTR("open"),
											SUMMARY(TXT("Core")),
											UL(
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-core-reactivity"},
														streamline.InterfaceHierarchyTwoNodeOrganizationLinksStructureLinkNodesNetworkHierarchy(),
														TXT("Reactivity"),
														HREF("/docs/included-plugins-core-reactivity"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-core-sandboxed-functions"},
														material_symbols.Function(),
														TXT("Sandboxed Functions"),
														HREF("/docs/included-plugins-core-sandboxed-functions"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-core-events"},
														lucide.MousePointerClick(),
														TXT("Events"),
														HREF("/docs/included-plugins-core-events"),
													)),
											),
										),
									),
									LI(
										DETAILS(
											ATTR("open"),
											SUMMARY(TXT("UI")),
											UL(
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-visibility"},
														clarity.EyeShowSolid(),
														TXT("Visibility"),
														HREF("/docs/included-plugins-ui-visibility"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-text-node"},
														material_symbols.TextFields(),
														TXT("Text Node"),
														HREF("/docs/included-plugins-ui-text-node"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-bind-attribute"},
														file_icons.Binder(),
														TXT("Bind"),
														HREF("/docs/included-plugins-ui-bind-attribute"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-two-way-binding"},
														tabler.BoxModel(),
														TXT("Two-Way Binding"),
														HREF("/docs/included-plugins-ui-two-way-binding"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-refs"},
														carbon.AssemblyReference(),
														TXT("Refs"),
														HREF("/docs/included-plugins-ui-refs"),
													)),
												LI(
													// CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-focus"},
														material_symbols.CenterFocusStrong(),
														TXT("Focus"),
														HREF("/docs/included-plugins-ui-focus"),
													)),
												LI(
													CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-intersect"},
														ph.IntersectFill(),
														TXT("Intersect"),
														HREF("/docs/included-plugins-ui-intersect"),
													)),
												LI(
													CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-ui-teleport"},
														game_icons.Teleport(),
														TXT("Teleport"),
														HREF("/docs/included-plugins-ui-teleport"),
													)),
											),
										),
									),
									LI(
										DETAILS(
											ATTR("open"),
											SUMMARY(TXT("HTML Partials")),
											UL(
												LI(
													CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-html-partials-raw"},
														cil.Transfer(),
														TXT("Fragments"),
														HREF("/docs/included-plugins-html-partials-fragments"),
													)),
												LI(
													CLS("disabled"),
													A(
														CLSS{"active": current == "included-plugins-html-partials-raw"},
														material_symbols.Bookmark(),
														TXT("Headers"),
														HREF("/docs/included-plugins-html-partials-headers"),
													)),
											),
										),
									),
								),
							),
						),
					),
				),
			),
		)
	}

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
			&mermaid.Extender{
				RenderMode: mermaid.RenderModeClient,
			},
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
		),
	)

	docs, err := staticFS.ReadDir("static/docs")
	if err != nil {
		return fmt.Errorf("error reading docs dir: %w", err)
	}

	regExpImg := regexp.MustCompile(`(?P<whole>!\[[^\]]+]\((?P<path>[^)]+)\))`)
	prefix := []byte("/static/")

	docNodes := map[string]NODE{}
	for _, de := range docs {
		fullPath := "static/docs/" + de.Name()

		b, err := staticFS.ReadFile(fullPath)
		if err != nil {
			return fmt.Errorf("error reading doc %s: %w", de.Name(), err)
		}

		fixed := regExpImg.ReplaceAllFunc(b, func(whole []byte) []byte {
			match := regExpImg.FindSubmatch(whole)
			if len(match) != 3 {
				return whole
			}

			oldPath := match[2]
			if !bytes.HasPrefix(oldPath, prefix) {
				return whole
			}

			newPath := staticPath(string(oldPath[len(prefix):]))
			fixed := bytes.ReplaceAll(whole, oldPath, []byte(newPath))
			return fixed
		})

		buf := bytes.NewBuffer(nil)
		if err := md.Convert(fixed, buf); err != nil {
			return fmt.Errorf("error converting doc %s: %w", de.Name(), err)
		}

		name := de.Name()[0 : len(de.Name())-3]

		docNodes[name] = RAW(buf.String())
	}

	router.Route("/docs", func(docsRouter chi.Router) {
		docsRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/docs/overview-declarative", http.StatusFound)
		})

		docsRouter.Get("/{docName}", func(w http.ResponseWriter, r *http.Request) {
			docName := chi.URLParam(r, "docName")
			doc, ok := docNodes[docName]

			var contents NODE
			if !ok {
				contents = DIV(
					DIV(
						CLS("alert alert-error"),
						mdi.AlertOctagonOutline(),
						TXTF("'%s' doc not found!", docName),
					),
					IMG(
						SRC(staticPath("docs_missing.jpg")),
					),
				)
			} else {
				contents = doc
			}

			Render(w, docsPage(
				docName,
				DIV(
					CLS("prose xl:prose-xl "),
					contents,
				),
			))
		})

	})

	return nil
}
