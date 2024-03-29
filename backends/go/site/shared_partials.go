package site

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"log"
	"net/http"
	"strings"

	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/mdi"
	"github.com/delaneyj/gostar/elements/iconify/simple_icons"
	"github.com/delaneyj/toolbelt"
	"github.com/dustin/go-humanize"
	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/parser"
	"github.com/samber/lo"
)

func page(children ...ElementRenderer) ElementRenderer {

	return Group(
		NewElement("!DOCTYPE").Attr("html", ""),
		HTML().
			LANG("en").
			Children(
				TITLE().Text("DATASTAR"),
				HEAD(
					META().CHARSET("UTF-8"),
					META().NAME("viewport").CONTENT("width=device-width, initial-scale=1"),
					META().NAME("description").CONTENT("Datastar is declarative real-time hypermedia framework"),
					//favicon png
					LINK().REL("icon").HREF(staticPath("images/datastar_icon.svg")),
					// LINK().REL("stylesheet").HREF("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/themes/light.css"),
					// SCRIPT().TYPE("module").SRC("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.14.0/cdn/shoelace-autoloader.js"),
					LINK().REL("stylesheet").HREF(staticPath("css/site.css")),
					cdnLink("@unocss/reset/tailwind.min.css"),
					cdnLink("animate.css@4.1.1/animate.min.css"),
					STYLE().Text(`
					.un-cloak {
						display: none;
					  }
					`),
				),
				BODY().
					CLASS("font-sans min-h-screen un-cloak").
					Children(
						DIV().
							CLASS("bg-accent-900 text-primary-50 w-full h-full").
							Children(children...),
					),
				SCRIPT(Text(`
				function initHotReload() {
				console.log("Hot reload initializing")
				if (typeof(EventSource) !== "undefined") {
					const es = new EventSource("/__hotreload");
					es.onmessage = function(event) {
						location.reload();
					}
					es.onerror = function(err) {
						console.log("lost connection to server, reloading");
						setTimeout(() => {
						location.reload();
						}, 250);
					};
				}
				}
				initHotReload();
				// 							`)),
				SCRIPT().
					TYPE("module").
					SRC(staticPath("library/datastar.js")).
					DEFER(),
			),
	)

}

func cdnLink(css string) ElementRenderer {
	return LINK().REL("stylesheet").HREF("https://cdn.jsdelivr.net/npm/" + css)
}

var iifeBuildSize string

func upsertIIfeBuildSize() string {
	if iifeBuildSize != "" {
		return iifeBuildSize
	}
	build, err := staticFS.ReadFile("static/library/datastar.iife.js")
	if err != nil {
		panic(err)
	}
	buf := bytes.NewBuffer(nil)
	w, err := gzip.NewWriterLevel(buf, gzip.BestCompression)
	if err != nil {
		panic(err)
	}

	if _, err := w.Write(build); err != nil {
		panic(err)
	}
	w.Close()
	iifeBuildSize = humanize.Bytes(uint64(buf.Len()))
	return iifeBuildSize
}

func markdownRenders(staticMdPath string) (mdElementRenderers map[string]ElementRenderer, mdAnchors map[string][]string, err error) {
	mdDir := "static/md/" + staticMdPath
	docs, err := staticFS.ReadDir(mdDir)
	if err != nil {
		return nil, nil, fmt.Errorf("error reading docs dir: %w", err)
	}

	// regExpImg := regexp.MustCompile(`(?P<whole>!\[[^\]]+]\((?P<path>[^)]+)\))`)
	// prefix := []byte("/static/")

	mdElementRenderers = map[string]ElementRenderer{}
	mdAnchors = map[string][]string{}
	for _, de := range docs {
		fullPath := mdDir + "/" + de.Name()

		b, err := staticFS.ReadFile(fullPath)
		if err != nil {
			return nil, nil, fmt.Errorf("error reading doc %s: %w", de.Name(), err)
		}

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
		mdElementRenderers[name] = Text(renderedHTML)
		mdAnchors[name] = anchors
	}

	return mdElementRenderers, mdAnchors, nil
}

func header(r *http.Request) ElementRenderer {
	linkChildren := []ElementRenderer{
		linkChild("https://discord.gg/CHvPMrAp6F", simple_icons.Discord()).TARGET("_blank").REL("noopener", "noreferrer"),
		linkChild("https://github.com/delaneyj/datastar/tree/main/library", simple_icons.Github()).TARGET("_blank").REL("noopener", "noreferrer"),
		linkChild("https://www.npmjs.com/package/@sudodevnull/datastar", simple_icons.Npm()).TARGET("_blank").REL("noopener", "noreferrer"),
	}

	topLevelLinks := lo.Map([]string{
		"docs",
		"reference",
		"examples",
		"essays",
	}, func(name string, i int) ElementRenderer {
		return link("/"+name, name, strings.HasPrefix(r.URL.Path, "/"+name))
	})

	return DIV().
		CLASS("shadow-lg").
		Children(
			HEADER().CLASS("bg-accent-700 text-accent-200 px-4 py-2 flex flex-wrap gap-2 justify-between items-center").Children(
				DIV().CLASS("flex flex-wrap gap-2 items-end").Children(
					A().CLASS("flex gap-1").
						HREF("/").
						Children(
							DIV().CLASS("font-brand font-bold text-2xl uppercase hidden md:block").Text("Datastar"),
							datastarLogo().CLASS("h-8"),
						),
					DIV().
						CLASS("font-mono text-accent-300").
						TextF("v%s", packageJSON.Version),
				),
				DIV().
					CLASS("flex flex-wrap gap-3 uppercase font-brand text-xs md:text-sm lg:text-lg items-center").
					Children(topLevelLinks...),

				DIV().CLASS("hidden md:flex").Children(
					linkChildren...,
				),
			),
			HEADER().CLASS("md:hidden bg-accent-800 text-accent-200 px-4 py-2 flex flex-wrap gap-2 justify-between items-center").Children(
				BUTTON().
					CustomData("show", "!$sidebarOpen").
					DATASTAR_ON("click", "$sidebarOpen = true").
					CLASS("bg-accent-600 hover:bg-accent-700 text-primary-50 p-2 rounded-md").
					Children(mdi.Menu()),
				DIV().CLASS("flex gap-1 text-2xl").Children(linkChildren...),
			),
		)
}
func prosePage(r *http.Request, sidebarContents ElementRenderer, contents ElementRenderer, asideAnchors []string) ElementRenderer {
	log.Print(r.URL.Path)

	return page(
		highlightCSS,
		DIV().
			DATASTAR_MERGE_STORE(map[string]any{
				"sidebarOpen": false,
			}).
			CLASS("grid grid-rows-[auto_1fr] h-screen").
			Children(
				header(r),
				DIV().
					CLASS("flex justify-start overflow-hidden relative").
					Children(
						DynIf(sidebarContents != nil, func() ElementRenderer {
							return Group(
								DIV().
									CLASS("fixed inset-0 z-40 md:hidden").
									CustomData("show", "$sidebarOpen").
									Children(
										ASIDE().
											CLASS("px-4 py-8 w-64 bg-accent-800 text-accent-200 relative z-30 h-full flex flex-col gap-4").
											Children(
												DIV().
													CLASS("flex justify-end").
													Children(
														BUTTON().
															CLASS("text-xl p-2 rounded-full hover:bg-accent-600").
															DATASTAR_ON("click", "$sidebarOpen = false").
															TYPE("button").
															VALUE("Close sidebar").
															Children(mdi.Close()),
													),
												IMG().SRC(staticPath("images/datastar.svg")).ALT("logo").CLASS("h-8"),
												DIV(sidebarContents).CLASS("overflow-y-auto h-full flex flex-col"),
											),
										DIV().
											DATASTAR_ON("click", "$sidebarOpen = false").
											CLASS("fixed inset-0 bg-primary-900 bg-opacity-70 z-10"),
									),
								ASIDE(sidebarContents).
									CLASS("hidden md:flex flex-col px-4 py-8 min-w-64 bg-accent-800 text-accent-200 hidden md:visible gap-4"),
							)
						}),
						DIV().
							CLASS("md:flex md:justify-center px-2 py-4 md:px-4 w-full overflow-y-scroll scroll-mb-16").
							Children(
								DIV(contents).CLASS("prose prose-xs md:prose-2xl"),
							),
						DynIf(len(asideAnchors) > 0, func() ElementRenderer {
							return ASIDE().
								CLASS("min-w-52 py-4 h-screen text-accent-200 hidden lg:block transition-all").
								Children(
									DIV().
										CLASS("h-full border-l-2 border-accent-600 px-4 py-4 flex flex-col gap-4").
										Children(
											DIV().CLASS("border-b border-accent-600 w-full ").Text("On this page"),
											Range(asideAnchors, func(anchor string) ElementRenderer {
												kebab := toolbelt.Kebab(anchor)
												return link("#"+kebab, anchor, false).CLASS("font-light text-sm")
											}),
										),
								)
						}),
					),
			),
	)
}
