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
		page.MustWaitIdle()

		wait, handle := page.MustHandleDialog()
		go btn.MustClick()

		wait()

		page.MustWaitIdle()
		handle(true, "test")
		handle(true, "")
		page.MustWaitIdle()

		confirmation := page.MustElement("#confirmation")
		confirmationText := confirmation.MustText()
		assert.Equal(t, "test", confirmationText)
	})
}
