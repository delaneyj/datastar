package webui

import (
	"bytes"
	"compress/gzip"
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/game_icons"
	"github.com/delaneyj/gostar/elements/iconify/gridicons"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/gostar/elements/iconify/mdi"
	"github.com/delaneyj/gostar/elements/iconify/ph"
	"github.com/delaneyj/gostar/elements/iconify/svg_spinners"
	"github.com/delaneyj/gostar/elements/iconify/vscode_icons"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
)

var iifeBuildSize string

func UpsertIIfeBuildSize() string {
	if iifeBuildSize != "" {
		return iifeBuildSize
	}
	build, err := staticFS.ReadFile("static/datastar.iife.js")
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

func setupHome(ctx context.Context, router *chi.Mux) error {

	type Feature struct {
		Description string
		Icon        ElementRenderer
		Details     ElementRenderer
	}

	features := []Feature{
		{
			Description: "Fine Grained Reactivity via Signals",
			Icon:        ph.GitDiff(),
			Details:     DIV(Text("No Virtual DOM. proxy wrappers, or re-rendering the entire page on every change.  Take the best available options and use hassle free.")),
		},
		{
			Description: "Fully Compliant",
			Icon:        mdi.LanguageHtmlFive(),
			Details:     DIV(Text("No monkey patching, custom elements or attributes.  Just plain old HTML5 but works out of the box with custom web components.")),
		},
		{
			Description: "Everything is an Plugin",
			Icon:        gridicons.Plugins(),
			Details:     DIV(Text("Disagree with the built-in behavior? No problem, just write your own plugin in a type safe way.  Take what you need, leave what you don't.")),
		},
		{
			Description: "Declarative Batteries Included (but optional)",
			Icon:        game_icons.Batteries(),
			Details: DIV().
				CLASS("breadcrumbs").
				Children(
					UL().
						CLASS("flex flex-wrap gap-2 justify-center items-center").
						Children(
							LI().Children(Text("Custom Actions")),
							LI().Children(Text("Attribute Binding")),
							LI().Children(Text("Focus")),
							LI().Children(Text("Signals")),
							LI().Children(Text("DOM Events")),
							LI().Children(Text("Refs")),
							LI().Children(Text("Intersects")),
							LI().Children(Text("Two-Way Binding")),
							LI().Children(Text("Visibility")),
							LI().Children(Text("Teleporting")),
							LI().Children(Text("Text Replacement")),
							LI().Children(Text("HTMX like features")),
							LI().Children(Text("Server Sent Events")),
							LI().Children(Text("Redirects")),
							LI().Children(Text("View Transition API")),
							LI().Children(Text("BigInt Support")),
						),
				),
		},
	}

	languages := []func(...ElementRenderer) *vscode_icons.VscodeIconsIcon{
		vscode_icons.FileTypeAssembly,
		vscode_icons.FileTypeApl,
		vscode_icons.FileTypeC,
		vscode_icons.FileTypeCeylon,
		vscode_icons.FileTypeCpp,
		vscode_icons.FileTypeCobol,
		vscode_icons.FileTypeCoffeescript,
		vscode_icons.FileTypeClojure,
		vscode_icons.FileTypeCrystal,
		vscode_icons.FileTypeCsharp,
		vscode_icons.FileTypeDartlang,
		vscode_icons.FileTypeElixir,
		vscode_icons.FileTypeErlang,
		vscode_icons.FileTypeFsharp,
		vscode_icons.FileTypeFortran,
		vscode_icons.FileTypeGoGopher,
		vscode_icons.FileTypeGroovy,
		vscode_icons.FileTypeHaskell,
		vscode_icons.FileTypeHaxe,
		vscode_icons.FileTypeJava,
		vscode_icons.FileTypeJs,
		vscode_icons.FileTypeJulia,
		vscode_icons.FileTypeKotlin,
		vscode_icons.FileTypeLisp,
		vscode_icons.FileTypeLolcode,
		vscode_icons.FileTypeLua,
		vscode_icons.FileTypeNim,
		vscode_icons.FileTypeOcaml,
		vscode_icons.FileTypePerl,
		vscode_icons.FileTypePhp,
		vscode_icons.FileTypePython,
		vscode_icons.FileTypeR,
		vscode_icons.FileTypeRuby,
		vscode_icons.FileTypeRust,
		vscode_icons.FileTypeScala,
		vscode_icons.FileTypeShell,
		vscode_icons.FileTypeSwift,
		vscode_icons.FileTypeTypescript,
		vscode_icons.FileTypeVb,
		vscode_icons.FileTypeZig,
	}

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		Page(
			DIV().
				CLASS("flex flex-col md:items-center text-center md:text-xl p-1 md:p-4 gap-8").
				Children(
					DIV().
						CLASS("md:max-w-4xl flex flex-col items-center justify-center gap-16").
						Children(
							DIV().
								CLASS("flex flex-col gap-6").
								Children(
									H3().
										CLASS("text-3xl font-bold").
										Children(Text("Global count example from Backend")),
									DIV().
										ID("global-count-example").
										CLASS("flex justify-center p-4 items-center gap-2").
										DATASTAR_FETCH_URL("'/api/globalCount'").
										DATASTAR_ON("load", datastar.GET_ACTION).
										Children(
											SPAN().
												CLASS("text-2xl").
												Text("Loading example on delay..."),
											svg_spinners.Eclipse().
												CLASS("datastar-indicator"),
										),
									H5().
										CLASS("text-2xl font-bold").
										Children(Text("Open the console to see the Fetch/XHR traffic")),
								),
							P().
								CLASS("text-xl md:text-3xl font-bold py-8").
								Children(Text("Takes the best of modern tooling and combines them with a heavy dose of declarative hypermedia into a single framework that is blazingly easy to use. 🚀")),
							DIV().
								CLASS("card w-full shadow-2xl ring-4 bg-base-300 ring-secondary text-secondary-content").
								Children(
									DIV().
										CLASS("card-body flex flex-col justify-center items-center").
										Children(
											UL().
												CLASS("flex flex-col gap-6 justify-center items-center text-2xl gap-4  max-w-xl").
												Children(
													Range(features, func(f Feature) ElementRenderer {
														return LI().
															Children(
																DIV().
																	CLASS("flex flex-col gap-1 justify-center items-center").
																	Children(
																		DIV().
																			CLASS("flex gap-2 items-center").
																			Children(
																				f.Icon,
																				Text(f.Description),
																			),
																		DIV().
																			CLASS("text-lg opacity-50 p-2 rounded").
																			Children(
																				f.Details,
																			),
																	),
															)
													}),
												),
										),
								),
						),
					DIV().
						CLASS("flex flex-col md:max-w-4xl gap-4 items-center").
						DATASTAR_MERGE_STORE(map[string]any{
							"label": "HTML on whatever backend you like",
							"v":     1,
						}).
						Children(
							DIV().
								CLASS("flex flex-col gap-2 items-center").
								Children(
									H1().
										CLASS("text-2xl md:text-6xl font-bold").
										DATASTAR_TEXT("$label"),
									INPUT().
										CLASS("input input-bordered w-full").
										DATASTAR_MODEL("label"),
								),
							DIV().
								CLASS("flex flex-wrap gap-1 md:gap-2 justify-center items-center text-6xl").
								Children(
									Range(languages, func(fn func(...ElementRenderer) *vscode_icons.VscodeIconsIcon) ElementRenderer {
										return DIV().
											CLASS("avatar avatar-xl").
											Children(
												fn().CLASS("w-16 h-12 md:w-24 md:h-24 mask bg-gradient-to-t from-base-200 to-base-300 p-2 md:p-4 mask-hexagon"),
											)
									}),
								),
							A().
								CLASS("link link-accent text-xl md:text-4xl").
								HREF("https://htmx.org/essays/hypermedia-on-whatever-youd-like/").
								Children(
									Text("It's the best idea since web rings"),
								),
						),
					DIV().
						Children(
							DIV().
								CLASS("w-full flex gap-2 items-center").
								Children(
									A().
										CLASS("btn md:btn-lg flex-1").
										HREF("/essays/2023-09-01_why-another-framework").
										Children(
											material_symbols.Help().
												CLASS("md:visible hidden"),
											Text("Why another framework?"),
										),
									A().
										CLASS("btn md:btn-lg flex-1 btn-accent").
										HREF("/examples").
										Children(
											mdi.RocketLaunch().
												CLASS("md:visible hidden"),
											Text("Show me what you got!"),
										),
									A().
										CLASS("btn md:btn-lg flex-1").
										HREF("/docs").
										Children(
											mdi.Book().
												CLASS("md:visible hidden"),
											Text("I'm do my own research"),
										),
								),
						),
				),
		).Render(w)
	})

	return nil
}
