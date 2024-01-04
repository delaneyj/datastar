package webui

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"regexp"

	chromahtml "github.com/alecthomas/chroma/v2/formatters/html"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/gridicons"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/gostar/elements/iconify/mdi"
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

	docsPage := func(current string, children ...ElementRenderer) ElementRenderer {
		return Page(
			DIV().
				CLASS("drawer lg:drawer-open").
				Children(
					INPUT().
						ID("drawer-toggle").
						TYPE("checkbox").
						CLASS("drawer-toggle"),
					DIV().
						CLASS("drawer-content flex flex-col text-sm md:text-md p-1 md:p-4 w-full gap-6").
						Children(
							LABEL(material_symbols.Menu()).
								CLASS("btn btn-primary drawer-button lg:hidden").
								FOR("drawer-toggle"),
							Group(children...),
						),
				),
			DIV().
				CLASS("drawer-side text-base-content").
				Children(
					LABEL().FOR("drawer-toggle").CLASS("drawer-overlay"),
					UL().
						CLASS("menu w-80 bg-base-200").
						Children(
							LI(
								DETAILS(
									SUMMARY(Text("Overview")),
									UL(
										LI(A().
											Children(
												mdi.Xml(), Text("Declarative"),
											).
											IfCLASS(current == "overview-declarative", "active").
											HREF("/docs/overview-declarative"),
										)),
									LI(A().
										Children(
											gridicons.Plugins(),
											Text("Plugins"),
										).
										IfCLASS(current == "overview-plugins", "active").
										HREF("/docs/overview-plugins"),
									),
								).OPEN(),
							),
						),
				),
		)

		// 	LABEL(
		// 		ATTR("for", "drawer-toggle"),
		// 		CLASS("drawer-overlay"),
		// 	),
		// 	UL(
		// 		CLASS("menu w-80 bg-base-200"),
		// 		LI(
		// 			DETAILS(
		// 				ATTR("open"),
		// 				SUMMARY(TXT("Overview")),
		// 				UL(
		// 					LI(
		// 						// CLASS("disabled"),
		// 						A(
		// 							CLASSS{"active": current == "overview-declarative"},
		// 							mdi.Xml(),
		// 							TXT("Declarative"),
		// 							HREF("/docs/overview-declarative"),
		// 						),
		// 					),
		// 					LI(
		// 						// CLASS("disabled"),
		// 						A(
		// 							CLASSS{"active": current == "overview-plugins"},
		// 							gridicons.Plugins(),
		// 							TXT("Plugins"),
		// 							HREF("/docs/overview-plugins"),
		// 						),
		// 					),
		// 				),
		// 			),
		// 		),
		// 		LI(
		// 			DETAILS(
		// 				ATTR("open"),
		// 				SUMMARY(TXT("Included Plugins")),
		// 				UL(
		// 					LI(
		// 						DETAILS(
		// 							ATTR("open"),
		// 							SUMMARY(TXT("Core")),
		// 							UL(
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-core-reactivity"},
		// 									streamline.InterfaceHierarchyTwoElementRendererOrganizationLinksStructureLinkElementRenderersNetworkHierarchy(),
		// 									TXT("Reactivity"),
		// 									HREF("/docs/included-plugins-core-reactivity"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-core-sandboxed-functions"},
		// 									material_symbols.Function(),
		// 									TXT("Sandboxed Functions"),
		// 									HREF("/docs/included-plugins-core-sandboxed-functions"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-core-events"},
		// 									lucide.MousePointerClick(),
		// 									TXT("Events"),
		// 									HREF("/docs/included-plugins-core-events"),
		// 								)),
		// 							),
		// 						),
		// 					),
		// 					LI(
		// 						DETAILS(
		// 							ATTR("open"),
		// 							SUMMARY(TXT("UI")),
		// 							UL(
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-visibility"},
		// 									clarity.EyeShowSolid(),
		// 									TXT("Visibility"),
		// 									HREF("/docs/included-plugins-ui-visibility"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-text-ElementRenderer"},
		// 									material_symbols.TextFields(),
		// 									TXT("Text ElementRenderer"),
		// 									HREF("/docs/included-plugins-ui-text-ElementRenderer"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-bind-attribute"},
		// 									file_icons.Binder(),
		// 									TXT("Bind"),
		// 									HREF("/docs/included-plugins-ui-bind-attribute"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-two-way-binding"},
		// 									tabler.BoxModel(),
		// 									TXT("Two-Way Binding"),
		// 									HREF("/docs/included-plugins-ui-two-way-binding"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-refs"},
		// 									carbon.AssemblyReference(),
		// 									TXT("Refs"),
		// 									HREF("/docs/included-plugins-ui-refs"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-focus"},
		// 									material_symbols.CenterFocusStrong(),
		// 									TXT("Focus"),
		// 									HREF("/docs/included-plugins-ui-focus"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-intersect"},
		// 									ph.IntersectFill(),
		// 									TXT("Intersects"),
		// 									HREF("/docs/included-plugins-ui-intersects"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-ui-teleport"},
		// 									game_icons.Teleport(),
		// 									TXT("Teleport"),
		// 									HREF("/docs/included-plugins-ui-teleport"),
		// 								)),
		// 							),
		// 						),
		// 					),
		// 					LI(
		// 						DETAILS(
		// 							ATTR("open"),
		// 							SUMMARY(TXT("HTML Partials")),
		// 							UL(
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-html-partials-raw"},
		// 									cil.Transfer(),
		// 									TXT("Fragments"),
		// 									HREF("/docs/included-plugins-html-partials-fragments"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-html-partials-raw"},
		// 									material_symbols.Bookmark(),
		// 									TXT("Headers"),
		// 									HREF("/docs/included-plugins-html-partials-headers"),
		// 								)),
		// 								LI(A(
		// 									CLASSS{"active": current == "included-plugins-html-partials-sse"},
		// 									streamline.InterfaceDownloadLaptopArrowComputerDownDownloadInternetLaptopNetworkServerUpload(),
		// 									TXT("Server Sent Events"),
		// 									HREF("/docs/included-plugins-html-partials-sse"),
		// 								)),
		// 							),
		// 						),
		// 					),
		// 				),
		// 			),
		// 		),
		// 		LI(
		// 			CLASS("disabled"),
		// 			SUMMARY(TXT("Make Your Own Plugins")),
		// 			UL(
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-intro"},
		// 						gridicons.Plugins(),
		// 						TXT("Intro"),
		// 						HREF("/docs/make-your-own-plugins-intro"),
		// 					),
		// 				),
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-dataStack"},
		// 						mdi.Database(),
		// 						TXT("Data Stack"),
		// 						HREF("/docs/make-your-own-plugins-dataStack"),
		// 					),
		// 				),
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-reactivity"},
		// 						streamline.InterfaceHierarchyTwoElementRendererOrganizationLinksStructureLinkElementRenderersNetworkHierarchy(),
		// 						TXT("Reactivity"),
		// 						HREF("/docs/make-your-own-plugins-reactivity"),
		// 					),
		// 				),
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-actions"},
		// 						mdi.PlayCircleOutline(),
		// 						TXT("Actions"),
		// 						HREF("/docs/make-your-own-plugins-actions"),
		// 					),
		// 				),
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-required"},
		// 						mdi.AlertCircleOutline(),
		// 						TXT("Required"),
		// 						HREF("/docs/make-your-own-plugins-required"),
		// 					),
		// 				),
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-modifiers"},
		// 						gis.ModifyLine(),
		// 						TXT("Modifiers"),
		// 						HREF("/docs/make-your-own-plugins-modifiers"),
		// 					),
		// 				),
		// 				LI(
		// 					CLASS("disabled"),
		// 					A(
		// 						CLASSS{"active": current == "make-your-own-plugins-expression"},
		// 						mdi.FunctionVariant(),
		// 						TXT("Expression"),
		// 						HREF("/docs/make-your-own-plugins-expression"),
		// 					)
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

	docElementRenderers := map[string]ElementRenderer{}
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

		docElementRenderers[name] = Text(buf.String())
	}

	router.Route("/docs", func(docsRouter chi.Router) {
		docsRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, "/docs/overview-declarative", http.StatusFound)
		})

		docsRouter.Get("/{docName}", func(w http.ResponseWriter, r *http.Request) {
			docName := chi.URLParam(r, "docName")
			doc, ok := docElementRenderers[docName]

			var contents ElementRenderer
			if !ok {
				contents = DIV(
					DIV(
						mdi.AlertOctagonOutline(),
						TextF("'%s' doc not found!", docName),
					).CLASS("alert alert-error"),
					IMG().SRC(staticPath("docs_missing.jpg")),
				)
			} else {
				contents = doc
			}

			docsPage(
				docName,
				DIV(
					contents,
				).CLASS("prose xl:prose-xl "),
			).Render(w)
		})

	})

	return nil
}
