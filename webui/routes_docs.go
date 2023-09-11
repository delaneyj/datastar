package webui

import (
	"context"
	"net/http"

	"github.com/delaneyj/gomponents-iconify/iconify/carbon"
	"github.com/delaneyj/gomponents-iconify/iconify/cil"
	"github.com/delaneyj/gomponents-iconify/iconify/clarity"
	"github.com/delaneyj/gomponents-iconify/iconify/file_icons"
	"github.com/delaneyj/gomponents-iconify/iconify/gridicons"
	"github.com/delaneyj/gomponents-iconify/iconify/lucide"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/gomponents-iconify/iconify/mdi"
	"github.com/delaneyj/gomponents-iconify/iconify/ph"
	"github.com/delaneyj/gomponents-iconify/iconify/streamline"
	"github.com/delaneyj/gomponents-iconify/iconify/tabler"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupDocs(ctx context.Context, router *chi.Mux) error {

	router.Route("/docs", func(essaysRouter chi.Router) {
		essaysRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			Render(w, Page(
				DIV(
					CLS("drawer lg:drawer-open"),
					INPUT(
						ID("drawer-toggle"),
						TYPE("checkbox"),
						CLS("drawer-toggle"),
					),
					DIV(
						CLS("drawer-content flex flex-col items-center justify-center"),
						DIV(TXT("Page Content")),
						LABEL(
							ATTR("for", "drawer-toggle"),
							CLS("btn btn-primary drawer-button lg:hidden"),
							TXT("Close"),
						),
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
											A(
												mdi.Xml(),
												TXT("Declarative"),
												HREF("#"),
											),
										),
										LI(
											A(
												gridicons.Plugins(),
												TXT("Plugins"),
												HREF("#"),
											),
										),
									),
								),
							),
							LI(
								DETAILS(
									ATTR("open"),
									SUMMARY(TXT("Built-in Plugins")),
									UL(
										LI(
											DETAILS(
												ATTR("open"),
												SUMMARY(TXT("Core")),
												UL(
													LI(A(
														streamline.InterfaceHierarchyTwoNodeOrganizationLinksStructureLinkNodesNetworkHierarchy(),
														TXT("Reactivity"),
														HREF("#"),
													)),
													LI(A(
														material_symbols.Function(),
														TXT("Sandboxed Functions"),
														HREF("#"),
													)),
													LI(A(
														// clarity.EyeShowSolid(),
														lucide.MousePointerClick(),
														TXT("Events"),
														HREF("#"),
													)),
												),
											),
										),
										LI(
											DETAILS(
												ATTR("open"),
												SUMMARY(TXT("Client State")),
												UL(
													LI(A(
														clarity.EyeShowSolid(),
														TXT("Visibility"),
														HREF("#"),
													)),
													LI(A(
														material_symbols.TextFields(),
														TXT("Text Node"),
														HREF("#"),
													)),
													LI(A(
														file_icons.Binder(),
														TXT("Bind"), HREF("#"),
													)),
													LI(A(
														tabler.BoxModel(),
														TXT("Model"), HREF("#"),
													)),
													LI(A(
														carbon.AssemblyReference(),
														TXT("Refs"),
														HREF("#"),
													)),
													LI(A(
														material_symbols.CenterFocusStrong(),
														TXT("Focus"),
														HREF("#"),
													)),
													LI(A(
														ph.IntersectFill(),
														TXT("Intersect"),
														HREF("#"),
													)),
												),
											),
										),
										LI(
											DETAILS(
												ATTR("open"),
												SUMMARY(TXT("HTML Partials")),
												UL(
													LI(A(
														cil.Transfer(),
														TXT("Fragments"),
														HREF("#"),
													)),
													LI(A(
														material_symbols.Bookmark(),
														TXT("Headers"),
														HREF("#"),
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
			))
		})
	})

	return nil
}
