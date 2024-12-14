package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleProgressBar(t *testing.T) {
	setupPageTest(t, "examples/progress_bar", func(runner runnerFn) {
		runner("observe progress bar", func(t *testing.T, page *rod.Page) {
			selector := "#progress_bar"
			svg := page.MustElement(selector)

			initial := svg.MustHTML()

			page.MustWaitStable()

			result := page.MustElement(selector).MustHTML()

			assert.NotEqual(t, initial, result)
		})
	})
}
