package webui

import (
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
	"github.com/maragudk/gomponents"
)

func setupExamplesDialogsDaisyUI(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/dialogs___daisy_ui", func(dialogsBrowserRouter chi.Router) {
		dialogsBrowserRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		type Store struct {
			Prompt string `json:"prompt"`
		}

		dialogNode := DIV(
			ID("dialogs"),
			datastar.MergeStore(&Store{Prompt: "foo"}),
			BUTTON(
				CLS("btn btn-primary"),
				ATTR("onclick", "my_modal_1.showModal()"),
				TXT("Click Me"),
			),
			gomponents.El("dialog",
				ID("my_modal_1"),
				CLS("modal text-base-content"),
				DIV(
					CLS("modal-box"),
					DIV(
						CLS("font-bold text-xl"),
						TXT("Hello!"),
					),
					DIV(
						CLS("form-control"),
						LABEL(
							CLS("label"),
							SPAN(
								CLS("label-text"),
								TXT("Enter a string"),
							),
						),
						INPUT(
							TYPE("text"),
							CLS("input input-bordered"),
							datastar.Model("prompt"),
						),
					),
					DIV(
						CLS("modal-action"),
						FORM(
							METHOD("dialog"),
							BUTTON(
								CLS("btn btn-ghost"),
								TXT("CLOSE"),
							),
						),
						BUTTON(
							CLS("btn btn-primary"),
							datastar.FetchURL("'/examples/dialogs___daisy_ui/sure'"),
							datastar.On("click", "$$get"),
							TXT("Submit"),
						),
					),
				),
			),
		)

		dialogsBrowserRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(sse, dialogNode)
		})

		dialogsBrowserRouter.Get("/sure", func(w http.ResponseWriter, r *http.Request) {
			store := &Store{}
			if err := datastar.QueryStringUnmarshal(r, store); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				DIV(
					ID("dialogs"),
					CLS("flex flex-col gap-4"),
					DIV(
						TXTF("You clicked the button and confirmed with prompt of  "),
						SPAN(
							CLS("font-bold text-accent"),
							TXT(store.Prompt),
						),
						TXT("!"),
					),
					A(
						CLS("btn btn-secondary"),
						HREF("/examples/dialogs___daisy_ui"),
						material_symbols.ArrowBack(),
						TXT("Reset"),
					),
				),
			)
		})
	})

	return nil
}
