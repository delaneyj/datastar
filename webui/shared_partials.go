package webui

import (
	"fmt"
	"log"
	"sync/atomic"

	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/gomponents-iconify/iconify/skill_icons"
	. "github.com/delaneyj/toolbelt/gomps"
)

func Page(children ...NODE) NODE {
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
		},
		Body: NODES{
			CLS("flex flex-col w-full min-h-screen scrollbar scrollbar-thumb-primary scrollbar-track-secondary"),

			DIV(
				CLS("p-4 flex flex-col items-center bg-cover bg-opacity-50 text-white bg-center"),
				STYLE(fmt.Sprintf("background-image: url(%s);", staticPath("bg.jpg"))),
				DIV(
					CLS("w-full flex justify-between items-center gap-2  backdrop-blur-sm py-2"),
					A(
						CLS("flex gap-2 items-center text-5xl font-display"),
						TXT("Datastar"),
						material_symbols.AwardStarOutline(),
						HREF("/"),
					),
					DIV(
						CLS("flex flex-col items-end"),
						DIV(TXT("Declarative Frontend Framework")),
						DIV(
							CLS("font-mono text-accent font-bold"),
							TXT("v"+packageJSON.Version),
						),
					),
				),
			),
			DIV(
				CLS("flex justify-end gap-6 px-4 py-1 bg-base-200 text-base-content text-sm"),
				A(
					CLS("btn btn-primary btn-ghost btn-sm"),
					TXT("Docs"),
					HREF("/docs"),
				),
				A(
					CLS("btn btn-primary btn-ghost btn-sm"),
					TXT("Essays"),
					HREF("/essays"),
				),
				DIV(
					CLS("join"),
					A(
						CLS("btn btn-ghost btn-sm"),
						skill_icons.Discord(CLS("text-2xl")),
						HREF("https://discord.com/channels/1035247242887561326/1149367785374359613"),
					),
					A(
						CLS("btn btn-ghost btn-sm"),
						skill_icons.GithubLight(CLS("text-2xl")),
						HREF("https://github.com/delaneyj/datastar"),
					),
				),
			),
			GRP(children...),
			SCRIPT(
				TYPE("module"),
				RAW(fmt.Sprintf(`
import { addAllIncludedPlugins } from '%s'
addAllIncludedPlugins()
`, staticPath("datastar.js"),
				)),
			),
		},
	})
}

var globalCount = new(int32)

func globalCountExample() NODE {
	count := atomic.LoadInt32(globalCount)
	log.Print(count)
	return DIV(
		ID("global-count-example"),
		CLS("flex flex-col gap-2"),
		DATAF("signal-count", "%d", count),
		DIV(
			CLS("flex gap-2 justify-between items-center"),
			BUTTON(
				CLS("btn btn-primary"),
				DATA("on-click", "$count++"),
				TXT("Increment Local State  +"),
			),
			BUTTON(
				CLS("btn btn-primary"),
				DATA("on-click", "$count--"),
				TXT("Decrement Local State -"),
			),
			INPUT(
				CLS("input input-bordered"),
				TYPE("number"),
				NAME("count"),
				DATA("model", "count"),
			),
			DIV(DATA("text", "`Count is ${$count}`")),
		),
		DIV(
			CLS("flex gap-4"),
			BUTTON(
				CLS("btn btn-secondary btn-lg flex-1"),
				DATA("signal-get", "'/api/globalCount'"),
				DATA("on-click", "@get"),
				TXT("Load global count"),
				material_symbols.Download(),
			),
			BUTTON(
				CLS("btn btn-secondary btn-lg flex-1"),
				DATA("signal-post", "'/api/globalCount'"),
				DATA("on-click", "@post"),
				TXT("Store global count"),
				material_symbols.Upload(),
			),
		),
	)
}
