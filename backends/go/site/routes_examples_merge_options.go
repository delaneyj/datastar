package site

import (
	"bytes"
	"log"
	"net/http"
	"time"

	"github.com/delaneyj/datastar"
	. "github.com/delaneyj/gostar/elements"
	"github.com/go-chi/chi/v5"
	"github.com/samber/lo"
	"github.com/zeebo/xxh3"
)

func setupExamplesMergeOptions(examplesRouter chi.Router) error {
	setupContents := DIV().
		ID("contents").
		CLASS("flex flex-col gap-8").
		Children(
			DIV().ID("target").TextF("Target DIV"),
			DIV().CLASS("flex gap-2 flex-wrap").
				Children(
					Range(datastar.ValidFragmentMergeTypes, func(mergeMode datastar.FragmentMergeType) ElementRenderer {
						return BUTTON().
							CLASS("border-2 border-accent-500 px-4 py-2 rounded text-accent-200").
							DATASTAR_ON("click", datastar.GET("/examples/merge_options/%s", mergeMode)).
							Text(string(mergeMode))
					}),
				),
			BUTTON().
				CLASS("bg-accent-500 px-4 py-2 rounded text-accent-200").
				DATASTAR_ON("click", datastar.GET("/examples/merge_options/reset")).
				Text("Reset"),
		)

	examplesRouter.Get("/merge_options/reset", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)
		buf := bytes.NewBuffer(nil)
		setupContents.Render(buf)
		log.Printf("contents: %s", buf.String())
		datastar.RenderFragment(sse, setupContents)
	})

	brewerColorsBG := []string{
		"#a6cee3",
		"#1f78b4",
		"#b2df8a",
		"#33a02c",
		"#fb9a99",
		"#e31a1c",
		"#fdbf6f",
		"#ff7f00",
		"#cab2d6",
		"#6a3d9a",
		"#ffff99",
		"#b15928",
	}

	brewrColorsFG := []string{
		"black",
		"white",
		"black",
		"black",
		"black",
		"white",
		"black",
		"black",
		"black",
		"white",
		"black",
		"white",
	}

	examplesRouter.Get("/merge_options/{mergeMode}", func(w http.ResponseWriter, r *http.Request) {
		mergeModeRaw := chi.URLParam(r, "mergeMode")
		mergeMode := datastar.FragmentMergeType(mergeModeRaw)
		if !lo.Contains(datastar.ValidFragmentMergeTypes, mergeMode) {
			http.Error(w, "invalid merge mode", http.StatusBadRequest)
			return
		}

		sse := datastar.NewSSE(w, r)

		idx := lo.IndexOf(datastar.ValidFragmentMergeTypes, mergeMode)
		if mergeMode == datastar.FragmentMergeDeleteElement {
			datastar.Delete(sse, "#target")
			return
		} else {
			now := time.Now().UTC().Format(time.RFC3339)
			h := xxh3.HashString(now)
			updatedTarget := DIV().
				ID("target").
				STYLE("background-color", brewerColorsBG[idx]).
				STYLE("color", brewrColorsFG[idx]).
				CLASS("p-4 rounded").
				TextF("Update %x at %s", h, now)
			datastar.RenderFragment(sse, updatedTarget, datastar.WithMergeType(mergeMode))
		}
	})

	return nil
}
