package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleViewTransitionApi(t *testing.T) {
	g := setup(t)

	t.Run("fade transition", func(t *testing.T) {
		page := g.page("examples/view_transition_api")
		assert.NotNil(t, page)
		page.MustElementR("button", "Fade transition").MustClick()

		result := page.MustElement("#stuff > div").MustText()

		assert.NotEmpty(t, result)
	})

	t.Run("slide transition", func(t *testing.T) {
		page := g.page("examples/view_transition_api")
		assert.NotNil(t, page)
		page.MustElementR("button", "Slide transition").MustClick()

		result := page.MustElement("#stuff > div").MustText()

		assert.NotEmpty(t, result)
	})
}
