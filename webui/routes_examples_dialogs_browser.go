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
				BUTTON().
					ID("dialogs").
					CLASS("btn btn-primary").
					DATASTAR_MERGE_STORE(&Store{Prompt: "foo"}).
					DATASTAR_FETCH_URL("'/examples/dialogs___browser/sure'").
					DATASTAR_ON("click", `$prompt = prompt('Enter a string',$prompt); $confirm = confirm('Are you sure?'); $confirm && $$get`).
					CLASS("flex flex-col gap-4").
					Children(
						Text("Click Me"),
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
				DIV().
					ID("dialogs").
					CLASS("flex flex-col gap-4").
					Children(
						Tern(
							store.Confirm,
							Group(
								DIV(
									TextF("You clicked the button and confirmed with prompt of "),
									SPAN().CLASS("font-bold text-accent").Text(store.Prompt),
									Text("!"),
								),
								BUTTON().
									CLASS("btn btn-secondary").
									DATASTAR_FETCH_URL("'/examples/dialogs___browser/data'").
									DATASTAR_ON("click", datastar.GET_ACTION).
									Children(
										material_symbols.ArrowBack(),
										Text("Reset"),
									),
							),
							DIV().
								CLASS("alert alert-error").
								Children(
									material_symbols.ErrorIcon(),
									Text("You clicked the button and did not confirm! Should not see this"),
								),
						),
					),
			)
		})
	})

	return nil
}
