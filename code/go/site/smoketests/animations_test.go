package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleAnimations(t *testing.T) {
	g := setup(t)

	page := g.page("examples/animations")
	assert.NotNil(t, page)

	t.Run("click and fade out", func(t *testing.T) {
		selector := "#fade_out_swap"
		btn := page.MustElement(selector)

		btn.MustClick()
		btn.WaitInvisible()

		exists, el, err := page.Has(selector)

		assert.Nil(t, el)
		assert.NoError(t, err)
		assert.False(t, exists)
	})

	t.Run("click and fade in", func(t *testing.T) {
		selector := "#fade_me_in"
		btn := page.MustElement(selector)

		btn.MustClick()
		btn.WaitVisible()

		exists, el, err := page.Has(selector)

		assert.NotNil(t, el)
		assert.NoError(t, err)
		assert.True(t, exists)
	})

	t.Run("in flight indicator", func(t *testing.T) {
		page.MustElement("input.flex-1").Input("test")

		page.MustElement("#submit_request_in_flight").MustClick()

		indicator := page.MustElement("#request_in_flight > div > div > div")
		indicator.WaitInvisible()

		result := page.MustElement("#request_in_flight").MustText()

		assert.Equal(t, "Submitted!", result)
	})
}
