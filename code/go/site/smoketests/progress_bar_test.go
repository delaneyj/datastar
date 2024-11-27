package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleProgressBar(t *testing.T) {
	g := setup(t)

	page := g.page("examples/progress_bar")
	assert.NotNil(t, page)

	t.Run("observe progress bar", func(t *testing.T) {
		selector := "#progress_bar"
		svg := page.MustElement(selector)

		initial := svg.MustHTML()

		page.MustWaitStable()

		result := page.MustElement(selector).MustHTML()

		assert.NotEqual(t, initial, result)
	})
}
