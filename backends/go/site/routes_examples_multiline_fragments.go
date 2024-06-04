package site

import (
	"net/http"

	"github.com/delaneyj/datastar"
	"github.com/go-chi/chi/v5"
)

func setupExamplesMultilineFragments(examplesRouter chi.Router) error {
	examplesRouter.Get("/multiline_fragments/data", func(w http.ResponseWriter, r *http.Request) {
		sse := datastar.NewSSE(w, r)

		datastar.RenderFragmentString(sse, `
<div id="replaceMe">
			<pre>
This is a multiline fragment.

Used when you are writing a lot of text by hand
			</pre>
		</div>
		`)
	})

	return nil
}
