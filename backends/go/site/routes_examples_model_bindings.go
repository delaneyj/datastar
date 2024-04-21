package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/martinusso/inflect"
	"github.com/samber/lo"
)

func setupExamplesModelBinding(examplesRouter chi.Router) error {
	type Store struct {
		BindText      string `json:"bindText"`
		BindNumber    int    `json:"bindNumber"`
		BindBool      bool   `json:"bindBool"`
		BindSelection int    `json:"bindSelection"`
	}

	examplesRouter.Get("/model_binding/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		store := Store{
			BindText:      "foo",
			BindNumber:    42,
			BindSelection: 1,
			BindBool:      true,
		}

		optionValues := lo.Range(7)
		selectOptions := lo.Map(optionValues, func(i, index int) ElementRenderer {
			return OPTION().VALUEF("%d", i).TextF("Option %d", i)
		})
		radioOptions := lo.Map(optionValues, func(i, index int) ElementRenderer {
			return LABEL().
				CLASS("font-brand font-bold text-xl flex items-center gap-2").
				Children(
					INPUT().
						TYPE("radio").
						DATASTAR_MODEL("bindSelection").
						VALUEF("%d", i),
					TextF("%s Option", inflect.Ordinalize(i)),
				)
		})

		datastar.RenderFragment(
			sse,
			DIV().
				ID("container").
				CLASS("flex flex-col gap-4").
				DATASTAR_STORE(store).
				Children(
					INPUT().
						TYPE("text").
						CLASS("border border-accent-500 bg-accent-700 rounded px-4 py-2 w-full py text-accent-200").
						DATASTAR_MODEL("bindText"),
					INPUT().
						TYPE("number").
						CLASS("border border-accent-500 bg-accent-700 rounded px-4 py-2 w-full py text-accent-200").
						DATASTAR_MODEL("bindNumber"),
					TEXTAREA().
						CLASS("border border-accent-500 bg-accent-700 rounded px-4 py-2 w-full py text-accent-200").
						DATASTAR_MODEL("bindText"),
					LABEL().
						CLASS("flex items-center gap-1").
						Children(
							SPAN().Text("Checkbox"),
							INPUT().
								TYPE("checkbox").
								CLASS("border border-accent-500 bg-accent-700 rounded px-4 py-2 w-full py text-accent-200").
								DATASTAR_MODEL("bindBool"),
						),

					SELECT().
						CLASS("border border-accent-500 bg-accent-700 rounded px-4 py-2 w-full py text-accent-200").
						DATASTAR_MODEL("bindSelection").
						Children(selectOptions...),
					DIV().
						CLASS("flex flex-col").
						Children(radioOptions...),

					CODE().
						CLASS("border text-primary-200 border-primary-500 rounded p-8").
						Children(PRE().DATASTAR_TEXT("JSON.stringify(ctx.store(),null,2)")),
				),
		)
	})

	return nil
}
