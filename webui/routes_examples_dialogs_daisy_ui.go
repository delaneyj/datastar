package webui

import (
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDialogsDaisyUI(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/dialogs___daisy_ui", func(dialogsBrowserRouter chi.Router) {
		dialogsBrowserRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		type Store struct {
			Prompt string `json:"prompt"`
		}

		dialogNode := DIV().
			ID("dialogs").
			DATASTAR_MERGE_STORE(&Store{Prompt: "foo"}).
			Children(
				BUTTON().
					CLASS("btn btn-primary").
					Attr("onclick", "my_modal_1.showModal()").
					Text("Click Me"),
				DIALOG().
					ID("my_modal_1").
					CLASS("modal text-base-content").
					Children(
						DIV().
							CLASS("modal-box").
							Children(
								DIV().
									CLASS("font-bold text-xl").
									Text("Hello!"),
								DIV().
									CLASS("form-control").
									Children(
										LABEL().
											CLASS("label").
											Children(
												SPAN().
													CLASS("label-text").
													Text("Enter a string"),
											),
										INPUT().
											TYPE("text").
											CLASS("input input-bordered").
											DATASTAR_MODEL("prompt"),
									),
								DIV().
									CLASS("modal-action").
									Children(
										FORM().
											METHOD("dialog").
											Children(
												BUTTON().
													CLASS("btn btn-ghost").
													Text("CLOSE"),
											),
										BUTTON().
											CLASS("btn btn-primary").
											DATASTAR_FETCH_URL("'/examples/dialogs___daisy_ui/sure'").
											DATASTAR_ON("click", "$$get").
											Text("Submit"),
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
				DIV().
					ID("dialogs").
					CLASS("flex flex-col gap-4").
					Children(
						DIV(
							TextF("You clicked the button and confirmed with prompt of "),
							SPAN().CLASS("font-bold text-accent").Text(store.Prompt),
							Text("!"),
						),
						A().
							CLASS("btn btn-secondary").
							HREF("/examples/dialogs___daisy_ui").
							Children(
								material_symbols.ArrowBack(),
								Text("Reset"),
							),
					),
			)
		})
	})

	return nil
}
