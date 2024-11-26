package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleOnLoad(t *testing.T) {
	g := setup(t)

	page := g.page("examples/on_load")
	assert.NotNil(t, page)

	t.Run("element contains session contents", func(t *testing.T) {
		selector := "#replaceMe"
		result := page.MustElement(selector).MustText()

		assert.Contains(t, result, "map[baz:42 foo:bar]")
	})
}
