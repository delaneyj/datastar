package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleTitleUpdateBackend(t *testing.T) {
	setupPageTest(t, "examples/title_update_backend", func(runner runnerFn) {
		runner("observe title change", func(t *testing.T, page *rod.Page) {
			initial := page.MustEval(`() => document.title`).Str()

			page.MustWait(`() => document.title !== "` + initial + `"`)

			result := page.MustEval(`() => document.title`).Str()

			assert.NotEqual(t, initial, result)
		})
	})
}
