package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleDeleteRow(t *testing.T) {
	g := setup(t)

	page := g.page("examples/delete_row")
	assert.NotNil(t, page)

	t.Run("delete a row", func(t *testing.T) {
		selector := "#contact_0 > td:nth-of-type(4) > button"
		btn := page.MustElement(selector)

		wait, handle := page.MustHandleDialog()

		go btn.MustClick()

		wait()
		handle(true, "")

		page.MustWaitStable()

		exists, el, err := page.Has(selector)

		assert.Nil(t, el)
		assert.NoError(t, err)
		assert.False(t, exists)
	})
}
