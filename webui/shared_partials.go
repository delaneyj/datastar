package webui

import (
	"context"
	"fmt"

	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/gostar/elements/iconify/simple_icons"
	"github.com/delaneyj/gostar/elements/iconify/tabler"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func Page(children ...ElementRenderer) ElementRenderer {
	linkPages := []string{
		"Examples",
		"Docs",
		"Essays",
	}
	type ExternalPage struct {
		Icon func(...ElementRenderer) *simple_icons.SimpleIconsIcon
		Link string
	}
	externalPages := []ExternalPage{
		{
			Icon: simple_icons.Discord,
			Link: "https://discord.gg/CHvPMrAp6F",
		},
		{
			Icon: simple_icons.Github,
			Link: "https://github.com/delaneyj/datastar/tree/main/library",
		},
		{
			Icon: simple_icons.Npm,
			Link: "https://www.npmjs.com/package/@sudodevnull/datastar",
		},
	}

	return HTML().
		TITLE("Datastar ").
		LANG("en").
		Children(
			HEAD(
				META().NAME("description").CONTENT("Datastar is a declarative frontend framework that takes the best of modern tooling and combines them with a heavy dose of declarative hypermedia into a single framework that is blazingly easy to use."),
				LINK().REL("icon").HREF(staticPath("favicon.svg")),
				LINK().REL("stylesheet").HREF("https://fonts.googleapis.com/css?family=Orbitron|Inter|JetBrains+Mono&display=swap"),
				LINK().REL("stylesheet").TYPE("text/css").HREF(staticPath("tailwind.css")),
				LINK().REL("stylesheet").HREF("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/themes/dark.css"),
				SCRIPT().TYPE("module").SRC("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/shoelace-autoloader.js"),
			),
			BODY().
				CLASS(`w-full h-screen overflow-hidden grid grid-rows-[auto,auto,1fr] grid-cols-[1fr]`).Children(
				DIV().
					CLASS("py-2 flex flex-col items-center bg-cover bg-opacity-50 text-white bg-center").
					STYLEF("background-image", "url(%s);", staticPath("bg.jpg")).
					Children(
						DIV().
							CLASS("w-full flex flex-wrap justify-center md:justify-between items-center gap-6 px-4  backdrop-blur-sm py-1 bg-base-200 bg-opacity-50").
							Children(
								A().
									CLASS("flex gap-2 items-center text-5xl font-display").
									HREF("/").
									Children(
										Text("Datastar"),
										material_symbols.AwardStarOutline(),
									),
								DIV().
									CLASS("flex flex-col gap-1 md:items-end").
									Children(
										DIV().Text("Declarative Frontend Framework"),
										DIV().
											CLASS("flex gap-1 items-center").
											Children(
												DIV().
													CLASS("font-mono text-accent font-bold text-xs").
													TextF("v%s", packageJSON.Version),
												DIV().
													CLASS("badge badge-accent flex-1 gap-1 text-xs p-1 w-full md:w-auto ").
													Children(
														tabler.FileZip(),
														TextF("< %s w/ all plugins", UpsertIIfeBuildSize()),
													),
											),
									),
							),
					),
				DIV().
					CLASS("bg-base-200 text-base-content text-sm flex justify-between items-center gap-6 px-4 py-1").
					Children(
						DIV().
							CLASS("flex gap-2").
							Children(
								Range(linkPages, func(p string) ElementRenderer {
									return A().
										CLASS("btn btn-ghost btn-sm").
										Text(p).
										HREF(fmt.Sprintf("/%s", toolbelt.Lower(toolbelt.Snake(p))))
								}),
							),
						DIV().
							CLASS("flex gap-2").
							Children(
								Range(externalPages, func(p ExternalPage) ElementRenderer {
									return A().
										CLASS("btn btn-ghost btn-sm flex justify-center items-center rounded-full").
										Children(
											p.Icon().CLASS("text-2xl"),
										).
										HREF(p.Link)
								}),
							),
					),
				DIV().
					CLASS("overflow-auto scrollbar scrollbar-thumb-primary scrollbar-track-secondary flex flex-col").
					DATASTAR_VIEW_TRANSITION("'page'").
					Children(children...),
				SCRIPT().
					TYPE("module").
					SRC(staticPath("datastar.js")).
					DEFER(),
			),
		)
}

type routerFunc func(ctx context.Context, r chi.Router) error

func Route(ctx context.Context, r chi.Router, path string, fn routerFunc) (err error) {
	r.Route(path, func(router chi.Router) {
		err = fn(ctx, router)
	})
	return err
}
