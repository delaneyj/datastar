package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleInfiniteScroll(t *testing.T) {
	g := setup(t)

	page := g.page("examples/infinite_scroll")
	assert.NotNil(t, page)

	t.Run("trigger infinite scroll", func(t *testing.T) {
		table := page.MustElement("#infinite_scroll > table")
		rows := table.MustElements("tr")
		assert.Len(t, rows, 11)

		page.MustElement("#infinite_scroll").MustClick()
		page.Mouse.MustScroll(0, 2000)

		updatedRows := table.MustElements("tr")
		assert.Len(t, updatedRows, 21)
	})
}
