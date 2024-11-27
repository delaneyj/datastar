package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleDialogsBrowser(t *testing.T) {
	g := setup(t)

	page := g.page("examples/dialogs_browser")
	assert.NotNil(t, page)

	t.Run("launch dialog", func(t *testing.T) {
		btn := page.MustElement("#dialogs")

		waitForElementWithIDToHaveInnerText(t, page, btn)

		wait, handle := page.MustHandleDialog()
		go btn.MustClick()
		wait()
		handle(true, "test")
		handle(true, "")

		confirmation := page.MustElement("#confirmation")
		confirmationText := confirmation.MustText()
		assert.Equal(t, "test", confirmationText)
	})
}
