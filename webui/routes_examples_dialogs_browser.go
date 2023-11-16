package webui

import (
	"context"
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/delaneyj/gomponents-iconify/iconify/material_symbols"
	"github.com/delaneyj/toolbelt"
	. "github.com/delaneyj/toolbelt/gomps"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDialogsBrowser(ctx context.Context, examplesRouter chi.Router) error {
	examplesRouter.Route("/dialogs___browser", func(dialogsBrowserRouter chi.Router) {
		dialogsBrowserRouter.Get("/", func(w http.ResponseWriter, r *http.Request) {
			examplePage(w, r)
		})

		type Store struct {
			Prompt  string `json:"prompt"`
			Confirm bool   `json:"confirm"`
		}

		dialogsBrowserRouter.Get("/data", func(w http.ResponseWriter, r *http.Request) {
			sse := toolbelt.NewSSE(w, r)
			datastar.RenderFragment(
				sse,
				BUTTON(
					ID("dialogs"),
					CLS("btn btn-primary"),
					datastar.MergeStore(&Store{Prompt: "foo"}),
					datastar.Prompt("prompt", "Enter a string"),
					datastar.Confirm("confirm", "Are you sure?"),
					datastar.FetchURL("'/examples/dialogs___browser/sure'"),
					datastar.On("click", `$prompt = prompt('Enter a string',$prompt); $confirm = confirm('Are you sure?'); $confirm && $$get`),
					CLS("flex flex-col gap-4"),
					TXT("Click Me"),
					material_symbols.QuestionMark(),
				),
			)
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
					TERN(
						store.Confirm,
						func() NODE {
							return GRP(
								DIV(
									TXTF("You clicked the button and confirmed with prompt of "),
									SPAN(
										CLS("font-bold text-accent"),
										TXT(store.Prompt),
									),
									TXT("!"),
								),
								BUTTON(
									CLS("btn btn-secondary"),
									datastar.FetchURL("'/examples/dialogs___browser/data'"),
									datastar.On("click", datastar.GET_ACTION),
									material_symbols.ArrowBack(),
									TXT("Reset"),
								),
							)
						},
						func() NODE {
							return DIV(
								CLS("alert alert-error"),
								material_symbols.Error(),
								TXT("You clicked the button and did not confirm! Should not see this"),
							)
						},
					),
				),
			)
		})
	})

	return nil
}
