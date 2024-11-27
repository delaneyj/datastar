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
		page.MustElementR("button", "Scroll into view").MustClick()

		assert.Equal(t, 760.5, page.Mouse.Position().X)
		assert.Equal(t, 400.0, page.Mouse.Position().Y)
	})

}
