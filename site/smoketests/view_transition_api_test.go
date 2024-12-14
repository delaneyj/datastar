package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleViewTransitionApi(t *testing.T) {
	t.Run("fade transition", func(t *testing.T) {
		setupPageTest(t, "examples/view_transition_api", func(runner runnerFn) {
			runner("fade transition", func(t *testing.T, page *rod.Page) {
				assert.NotNil(t, page)
				page.MustElementR("button", "Fade transition").MustClick()

				result := page.MustElement("#stuff > div").MustText()

				assert.NotEmpty(t, result)
			})
		})
	})

	t.Run("slide transition", func(t *testing.T) {
		setupPageTest(t, "examples/view_transition_api", func(runner runnerFn) {
			runner("slide transition", func(t *testing.T, page *rod.Page) {
				assert.NotNil(t, page)
				page.MustElementR("button", "Slide transition").MustClick()

				result := page.MustElement("#stuff > div").MustText()

				assert.NotEmpty(t, result)
			})
		})
	})

}
