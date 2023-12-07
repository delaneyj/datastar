package webui

import (
	"context"
	"fmt"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/gomponents-iconify/iconify/simple_icons"
	"github.com/delaneyj/gomponents-iconify/iconify/tabler"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func Page(children ...NODE) NODE {
	linkPages := []string{
		"Examples",
		"Docs",
		"Essays",
	}
	type ExternalPage struct {
		Icon NodeFunc
		Link string
	}
	externalPages := []ExternalPage{
		{
			Icon: simple_icons.Discord,
			Link: "https://discord.com/channels/1035247242887561326/1149367785374359613",
		},
		{
			Icon: simple_icons.Github,
			Link: "https://github.com/delaneyj/datastar",
		},
		{
			Icon: simple_icons.Npm,
			Link: "https://www.npmjs.com/package/@sudodevnull/datastar",
		},
	}

	return HTML5(HTML5Props{
		Title:       "Datastar ",
		Language:    "en",
		Description: `Datastar is a declarative frontend framework that takes the best of modern tooling and combines them with a heavy dose of declarative hypermedia into a single framework that is blazingly easy to use.`,
		Head: NODES{
			LINK(
				REL("icon"),
				HREF(staticPath("favicon.svg")),
			),
			LINK(
				REL("stylesheet"),
				HREF("https://fonts.googleapis.com/css?family=Orbitron|Inter|JetBrains+Mono&display=swap"),
			),
			LINK(
				REL("stylesheet"),
				TYPE("text/css"),
				HREF(staticPath("tailwind.css")),
			),
			LINK(
				REL("stylesheet"),
				HREF("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/themes/dark.css"),
			),
			SCRIPT(
				TYPE("module"),
				SRC("https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/shoelace-autoloader.js"),
			),
		},
		Body: NODES{
			CLS(`
				w-full h-screen overflow-hidden
				grid
				grid-rows-[auto,auto,1fr]
				grid-cols-[1fr]
			`),
			DIV(
				CLS("py-2 flex flex-col items-center bg-cover bg-opacity-50 text-white bg-center"),
				STYLE(fmt.Sprintf("background-image: url(%s);", staticPath("bg.jpg"))),
				DIV(
					CLS("w-full flex flex-wrap justify-center md:justify-between items-center gap-6 px-4  backdrop-blur-sm py-1 bg-base-200 bg-opacity-50"),
					A(
						CLS("flex gap-2 items-center text-5xl font-display"),
						TXT("Datastar"),
						material_symbols.AwardStarOutline(),
						HREF("/"),
					),
					DIV(
						CLS("flex flex-col gap-1 md:items-end"),
						DIV(TXT("Declarative Frontend Framework")),
						DIV(
							CLS("flex gap-1 items-center"),
							DIV(
								CLS("font-mono text-accent font-bold text-xs"),
								TXT("v"+packageJSON.Version),
							),
							DIV(
								CLS("badge badge-accent flex-1 gap-1 text-xs p-1 w-full md:w-auto "),
								tabler.FileZip(),
								TXT(UpsertIIfeBuildSize()+" w/ all plugins"),
							),
						),
					),
				),
			),
			DIV(
				CLS("bg-base-200 text-base-content text-sm flex justify-between items-center gap-6 px-4 py-1"),
				DIV(
					CLS("flex gap-2"),
					RANGE(linkPages, func(p string) NODE {
						return A(
							CLS("btn btn-ghost btn-sm"),
							TXT(p),
							HREF(fmt.Sprintf("/%s", toolbelt.Lower(toolbelt.Snake(p)))),
						)
					}),
				),
				DIV(
					CLS("flex gap-2"),
					RANGE(externalPages, func(p ExternalPage) NODE {
						return A(
							CLS("btn btn-ghost btn-sm flex justify-center items-center rounded-full"),
							p.Icon(CLS("text-2xl")),
							HREF(p.Link),
						)
					}),
				),
			),
			DIV(
				datastar.ViewTransition("'page'"),
				CLS("overflow-auto scrollbar scrollbar-thumb-primary scrollbar-track-secondary flex flex-col"),
				GRP(children...),
			),
			SCRIPT(
				TYPE("module"),
				DEFER,
				RAW(
					fmt.Sprintf(`
import { runDatastarWithAllPlugins } from '%s'
window.ds = runDatastarWithAllPlugins()
window.dispatchEvent(new CustomEvent('datastar-ready'))
`,
						staticPath("datastar.js"),
					),
				),
			),
		},
	})
}

type routerFunc func(ctx context.Context, r chi.Router) error

func Route(ctx context.Context, r chi.Router, path string, fn routerFunc) (err error) {
	r.Route(path, func(router chi.Router) {
		err = fn(ctx, router)
	})
	return err
}
