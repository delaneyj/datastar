package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleDisableButton(t *testing.T) {
	g := setup(t)

	page := g.page("examples/disable_button")
	assert.NotNil(t, page)

	t.Run("disabled button click", func(t *testing.T) {
		btn := page.MustElement("#target")
		initial := btn.MustAttribute("data-bind-disabled")
		assert.Equal(t, "shouldDisable.value", *initial)

		btn.MustClick()
		result := btn.MustAttribute("disabled")
		assert.Equal(t, "true", *result)
	})
}
