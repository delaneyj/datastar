package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/delaneyj/gostar/elements/iconify/material_symbols"
	"github.com/go-chi/chi/v5"
)

func setupExamplesDialogsBrowser(examplesRouter chi.Router) error {
	type Store struct {
		Prompt  string `json:"prompt"`
		Confirm bool   `json:"confirm"`
	}

	examplesRouter.Get("/dialogs_browser/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		datastar.RenderFragment(
			sse,
			BUTTON().
				ID("dialogs").
				CLASS("flex items-center justify-center gap-1 px-2 py-1 rounded-sm text-xs bg-primary-600 hover:bg-primary-500").
				DATASTAR_STORE(&Store{Prompt: "foo"}).
				DATASTAR_ON("click", `$prompt = prompt('Enter a string',$prompt);$confirm = confirm('Are you sure?');$confirm && $$get('/examples/dialogs_browser/sure')`).
				Children(
					Text("Click Me"),
					material_symbols.QuestionMark(),
				),
		)
	})

	examplesRouter.Get("/dialogs_browser/sure", func(w http.ResponseWriter, r *http.Request) {
		store := &Store{}
		if err := datastar.QueryStringUnmarshal(r, store); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		sse := datastar.NewSSE(w, r)
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
								CLASS("flex items-center gap-1 px-2 py-1 rounded-sm text-xs bg-accent-600 hover:bg-accent-500").
								DATASTAR_ON("click", datastar.GET("/examples/dialogs___browser/data")).
								Children(
									material_symbols.ArrowBack(),
									Text("Reset"),
								),
						),
						DIV().
							CLASS("flex gap-2 items-center justify-between font-regular relative mb-4 block w-full rounded-lg bg-red-500 p-4 text-base leading-5 text-white opacity-100").
							Children(
								material_symbols.ErrorIcon(),
								Text("You clicked the button and did not confirm! Should not see this"),
							),
					),
				),
		)
	})

	return nil
}
