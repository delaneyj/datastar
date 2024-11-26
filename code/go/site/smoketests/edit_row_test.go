package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleEditRow(t *testing.T) {
	g := setup(t)

	page := g.page("examples/edit_row")
	assert.NotNil(t, page)

	t.Run("edit a row", func(t *testing.T) {
		editBtn := page.MustElement("#contact_0 > td:nth-child(3) > button")
		editBtn.MustClick()

		nameInput := page.MustElement("#contact_0 > td:nth-child(1) > input")
		nameInput.MustSelectAllText().MustInput("")
		nameInput.MustInput("Test")

		emailInput := page.MustElement("#contact_0 > td:nth-child(2) > input")
		emailInput.MustSelectAllText().MustInput("")
		emailInput.MustInput("Test")

		saveBtn := page.MustElement("#contact_0 > td:nth-child(3) > div > button:nth-child(2)")
		saveBtn.MustClick()

		name := page.MustElement("#contact_0 > td:nth-child(1) > div:nth-child(1)").MustText()
		assert.Equal(t, "Test", name)

		email := page.MustElement("#contact_0 > td:nth-child(2) > div:nth-child(1)").MustText()
		assert.Equal(t, "Test", email)
	})

	t.Run("reset", func(t *testing.T) {
		editBtn := page.MustElement("#contact_0 > td:nth-child(3) > button")
		editBtn.MustClick()

		nameInput := page.MustElement("#contact_0 > td:nth-child(1) > input")
		nameInput.MustSelectAllText().MustInput("")
		nameInput.MustInput("Test")

		emailInput := page.MustElement("#contact_0 > td:nth-child(2) > input")
		emailInput.MustSelectAllText().MustInput("")
		emailInput.MustInput("Test")

		saveBtn := page.MustElement("#contact_0 > td:nth-child(3) > div > button:nth-child(2)")
		saveBtn.MustClick()

		name := page.MustElement("#contact_0 > td:nth-child(1) > div:nth-child(1)").MustText()
		assert.Equal(t, "Test", name)

		email := page.MustElement("#contact_0 > td:nth-child(2) > div:nth-child(1)").MustText()
		assert.Equal(t, "Test", email)

		resetBtn := page.MustElement("#edit_row > div > button")
		resetBtn.MustClick()

		resetName := page.MustElement("#contact_0 > td:nth-child(1) > div:nth-child(1)").MustText()
		assert.NotEqual(t, resetName, name)

	})
}
