package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleToggleVisibility(t *testing.T) {
	g := setup(t)

	page := g.page("examples/toggle_visibility")
	assert.NotNil(t, page)

	t.Run("toggle", func(t *testing.T) {
		initial := page.MustElement("#container > div").MustAttribute("style")
		assert.Equal(t, "display: none;", *initial)

		btn := page.MustElementR("button", "Toggle")
		btn.MustClick()

		result := page.MustElement("#container > div").MustAttribute("style")
		assert.Equal(t, "", *result)
	})
}
