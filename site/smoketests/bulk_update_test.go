package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleBulkUpdate(t *testing.T) {
	g := setup(t)

	t.Run("bulk update active", func(t *testing.T) {
		page := g.page("examples/bulk_update")
		assert.NotNil(t, page)

		selectAllInput := page.MustElement("#bulk_update > table > thead > tr > th > input")
		selectAllInput.MustClick()

		activateBtn := page.MustElement("#bulk_update > div > button")
		activateBtn.MustClick()

		contact_0 := page.MustElement("#contact_0 > td:nth-child(4)")
		assert.Equal(t, "Active", contact_0.MustText())

		contact_1 := page.MustElement("#contact_1 > td:nth-child(4)")
		assert.Equal(t, "Active", contact_1.MustText())

		contact_2 := page.MustElement("#contact_2 > td:nth-child(4)")
		assert.Equal(t, "Active", contact_2.MustText())

		contact_3 := page.MustElement("#contact_3 > td:nth-child(4)")
		assert.Equal(t, "Active", contact_3.MustText())
	})

	t.Run("bulk update inactive", func(t *testing.T) {
		page := g.page("examples/bulk_update")
		assert.NotNil(t, page)

		selectAllInput := page.MustElement("#bulk_update > table > thead > tr > th > input")
		selectAllInput.MustClick()

		inactivateBtn := page.MustElement("#bulk_update > div > button:nth-of-type(2)")
		inactivateBtn.MustClick()

		contact_0 := page.MustElement("#contact_0 > td:nth-child(4)")
		assert.Equal(t, "Inactive", contact_0.MustText())

		contact_1 := page.MustElement("#contact_1 > td:nth-child(4)")
		assert.Equal(t, "Inactive", contact_1.MustText())

		contact_2 := page.MustElement("#contact_2 > td:nth-child(4)")
		assert.Equal(t, "Inactive", contact_2.MustText())

		contact_3 := page.MustElement("#contact_3 > td:nth-child(4)")
		assert.Equal(t, "Inactive", contact_3.MustText())

	})
}
