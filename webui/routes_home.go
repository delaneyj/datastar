package webui

import (
	"bytes"
	"compress/gzip"
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/carbon"
	"github.com/delaneyj/gomponents-iconify/iconify/game_icons"
	"github.com/delaneyj/gomponents-iconify/iconify/gridicons"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/gomponents-iconify/iconify/mdi"
	"github.com/delaneyj/gomponents-iconify/iconify/ph"
	"github.com/delaneyj/gomponents-iconify/iconify/tabler"
	"github.com/delaneyj/gomponents-iconify/iconify/vscode_icons"
	"github.com/delaneyj/gomponents-iconify/iconify/zondicons"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/dustin/go-humanize"
	"github.com/go-chi/chi/v5"
	"github.com/maragudk/gomponents"
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
		Icon        NODE
		Details     NODE
	}

	features := []Feature{
		{
			Description: "Fine Grained Reactivity via Signals",
			Icon:        ph.GitDiff(),
			Details:     DIV(TXT("No Virtual DOM. proxy wrappers, or re-rendering the entire page on every change.  Take the best available options and use hassle free.")),
		},
		{
			Description: "Fully Compliant",
			Icon:        mdi.LanguageHtmlFive(),
			Details:     DIV(TXT("No monkey patching, no custom elements, no custom attributes, no custom anything.  Just plain old HTML5.")),
		},
		{
			Description: "Everything is an Plugin",
			Icon:        gridicons.Plugins(),
			Details:     DIV(TXT("Disagree with the built-in behavior? No problem, just write your own plugin in a type safe way.  Take what you need, leave what you don't.")),
		},
		{
			Description: "Batteries Included (but optional)",
			Icon:        game_icons.Batteries(),
			Details: DIV(
				CLS("breadcrumbs"),
				UL(
					CLS(
						"flex flex-wrap gap-2 justify-center items-center",
					),
					LI(TXT("Custom Actions")),
					LI(TXT("Attribute Binding")),
					LI(TXT("Focus")),
					LI(TXT("Signals")),
					LI(TXT("DOM Events")),
					LI(TXT("Refs")),
					LI(TXT("Intersects")),
					LI(TXT("Two-Way Binding")),
					LI(TXT("Visibility")),
					LI(TXT("Teleporting")),
					LI(TXT("Text Replacement")),
					LI(TXT("HTMX like features")),
					LI(TXT("Server Sent Events")),
				),
			),
		},
	}

	languages := []NodeFunc{
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
		Render(w, Page(
			DIV(
				CLS("flex flex-col md:items-center text-center md:text-xl p-1 md:p-4"),
				DIV(
					CLS("md:max-w-4xl flex flex-col items-center justify-center gap-16"),
					DIV(
						CLS("flex flex-col gap-2 items-center"),
						datastar.MergeStore(map[string]any{
							"label": "HTML on whatever you like",
						}),
						DIV(
							H1(
								CLS("text-2xl md:text-6xl font-bold"),
								datastar.Text("$label"),
							),
							gomponents.El(
								"sl-input",
								ATTR("size", "small"),
								datastar.Model("label"),
							),
						),
						A(
							CLS("link link-accent text-xl md:text-4xl"),
							HREF("https://htmx.org/essays/hypermedia-on-whatever-youd-like/"),
							TXT("It's the best idea since web rings"),
						),
						DIV(
							CLS("flex flex-wrap gap-1 md:gap-2 justify-center items-center text-6xl"),
							RANGE(languages, func(fn NodeFunc) NODE {
								return DIV(
									CLS("avatar avatar-xl"),
									fn(
										CLS("w-16 h-12 md:w-24 md:h-24 mask bg-gradient-to-t from-base-200 to-base-300 p-2 md:p-4 mask-hexagon"),
									),
								)
							}),
						),
					),
					DIV(
						CLS("flex flex-col gap-2 w-full"),
						H3(
							CLS("text-3xl font-bold"),
							TXT("Simple count example code "),
						),
						DIV(
							CLS("bg-base-100 shadow-inner text-base-content p-1 md:p-4 rounded-box text-xs md:text-base"),
							HIGHLIGHT("html", `<body data-merge-store="{count:0}">
	<div>
		<button data-on-click="$count++">Increment +</button>
		<button data-on-click="$count--">Decrement -</button>
		<input type="number" data-model="count" />
	</div>
	<div data-text="$count">will get replaced with count</div>
</body>
`,
							),
						),
						DIV(
							CLS("flex flex-wrap gap-2 justify-center items-center"),
							DIV(
								CLS("badge badge-accent flex-1 gap-1 text-xs p-4"),
								tabler.FileZip(),
								TXT(UpsertIIfeBuildSize()+" w/ all plugins"),
							),
							DIV(
								CLS("badge badge-accent flex-1 gap-1 text-xs p-4"),
								DIV(
									CLS("flex flex-wrap gap-1"),
									carbon.ColumnDependency(),
									TXTF("%d Dependencies", len(packageJSON.Dependencies)),
								),
							),
							DIV(
								CLS("badge badge-accent flex-1 gap-1 text-xs p-4"),
								zondicons.Checkmark(),
								TXT("Fully Tree Shakeable"),
							),
						),
					),
					DIV(
						CLS("flex flex-col gap-6"),
						// 						H3(
						// 							CLS("text-3xl font-bold"),
						// 							TXT("Global count example from Backend"),
						// 						),
						// 						DIV(
						// 							ID("global-count-example"),
						// 							CLS("flex justify-center p-4 items-center gap-2"),
						// 							DATA("signal-get", "'/api/globalCount'"),
						// 							DATA("on-load", "@get"),
						// 							SPAN(TXT("Loading example on delay...")),
						// 							svg_spinners.Eclipse(
						// 								CLS("datastar-indicator"),
						// 							),
						// 						),
						// 						H5(
						// 							CLS("text-2xl font-bold"),
						// 							TXT("Open the console to see the Fetch/XHR traffic"),
						// 						),
						// 					),
						P(
							TXT("Takes the best of modern tooling and combines them with a heavy dose of declarative hypermedia into a single framework that is blazingly easy to use."),
						),
						DIV(
							CLS("card w-full shadow-2xl ring-4 bg-base-300 ring-secondary text-secondary-content"),
							DIV(
								CLS("card-body flex flex-col justify-center items-center"),
								UL(
									CLS("flex flex-col gap-6 justify-center items-center text-2xl gap-4  max-w-xl"),
									RANGE(features, func(f Feature) NODE {
										return LI(
											DIV(
												CLS("flex flex-col gap-1 justify-center items-center"),
												DIV(
													CLS("flex gap-2 items-center"),
													f.Icon,
													TXT(f.Description),
												),
												DIV(
													CLS("text-lg opacity-50 p-2 rounded"),

													f.Details,
												),
											),
										)
									}),
								),
							),
						),

						DIV(
							CLS("flex flex-col gap-2 justify-center items-center"),
							TXT("Built with "),
							DIV(
								CLS("flex gap-1 justify-center items-center text-5xl"),
								vscode_icons.FileTypeHtml(),
								material_symbols.AddRounded(CLS("text-3xl")),
								vscode_icons.FileTypeTypescriptOfficial(),
								material_symbols.AddRounded(CLS("text-3xl")),
								vscode_icons.FileTypeVite(),
								material_symbols.AddRounded(CLS("text-3xl")),
								vscode_icons.FileTypeGoGopher(),
							),
							DIV(
								CLS("flex gap-2 justify-center items-center"),
								TXT("by "),
								A(
									CLS("link-accent"),
									HREF("http://github.com/delaneyj"),
									TXT("Delaney"),
								),
								TXT("and looking for contributors!"),
							),
						),
						DIV(
							CLS("w-full flex gap-2 items-center"),
							A(
								CLS("btn md:btn-lg flex-1"),
								HREF("/essays/2023-09-01_why-another-framework"),
								material_symbols.Help(CLS("md:visible hidden")),
								TXT("Why another framework?"),
							),
							A(
								CLS("btn md:btn-lg flex-1 btn-accent"),
								HREF("/examples"),
								mdi.RocketLaunch(CLS("md:visible hidden")),
								TXT("Show me what you got!"),
							),
							A(
								CLS("btn md:btn-lg flex-1"),
								HREF("/docs"),
								mdi.Book(CLS("md:visible hidden")),
								TXT("I'm do my own research"),
							),
						),
					),
				),
			),
		))
	})

	return nil
}
