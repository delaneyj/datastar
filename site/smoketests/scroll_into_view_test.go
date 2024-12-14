package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleScrollIntoView(t *testing.T) {
	setupPageTest(t, "examples/scroll_into_view", func(runner runnerFn) {
		runner("smooth", func(t *testing.T, page *rod.Page) {
			pos := page.Mouse.Position()
			assert.InDelta(t, 0, pos.X, 5.0)
			assert.InDelta(t, 0, pos.Y, 5.0)

			btn := page.MustElement("#scrollIntoViewButton")
			btn.MustClick()

			page.MustWaitIdle()

			pos = page.Mouse.Position()
			assert.Greater(t, pos.X, 500.0)
			assert.Greater(t, pos.Y, 200.0)
		})
	})
}
