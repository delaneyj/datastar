package site

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	datastar "github.com/starfederation/datastar/code/go/sdk"
)

func setupExamplesMultilineFragments(examplesRouter chi.Router) error {
	examplesRouter.Get("/multiline_fragments/data", func(w http.ResponseWriter, r *http.Request) {
		datastar.NewSSE(w, r).MergeFragments(`
<div id="replaceMe">
	<pre>
This is a multiline fragment.

Used when you are writing a lot of text by hand
	</pre>
</div>
`,
		)
	})

	return nil
}
