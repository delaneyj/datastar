package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleScrollIntoView(t *testing.T) {
	g := setup(t)

	page := g.page("examples/scroll_into_view")
	assert.NotNil(t, page)

	t.Run("smooth", func(t *testing.T) {
		btn := page.MustElement("#scrollIntoViewButton")
		btn.MustClick()

		page.MustWaitIdle()

		pos := page.Mouse.Position()
		assert.InDelta(t, 760, pos.X, 5.0)
		assert.InDelta(t, 400, pos.Y, 5.0)
	})

}
