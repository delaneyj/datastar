package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleToggleVisibility(t *testing.T) {
	setupPageTest(t, "examples/toggle_visibility", func(runner runnerFn) {
		runner("toggle", func(t *testing.T, page *rod.Page) {
			initial := page.MustElement("#container > div").MustAttribute("style")
			assert.Equal(t, "display: none;", *initial)

			btn := page.MustElementR("button", "Toggle")
			btn.MustClick()

			result := page.MustElement("#container > div").MustAttribute("style")
			assert.Equal(t, "", *result)
		})
	})
}
