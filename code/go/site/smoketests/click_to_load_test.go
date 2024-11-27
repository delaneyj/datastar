package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleClickToLoad(t *testing.T) {
	g := setup(t)
	page := g.page("examples/click_to_load")
	assert.NotNil(t, page)

	t.Run("click to load", func(t *testing.T) {
		table := page.MustElement(".table")

		rows := table.MustElements("tr")
		assert.Len(t, rows, 11)

		btn := page.MustElement("#more_btn")
		btn.MustClick()
		page.MustWaitStable()

		updatedRows := table.MustElements("tr")
		assert.Len(t, updatedRows, 21)
	})
}
