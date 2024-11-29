package smoketests

import (
	"testing"
	"time"

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

		// This is a workaround for the dialog not being available after wiat
		time.Sleep(1 * time.Second)

		wait()

		handle(true, "test")
		handle(true, "")

		confirmation := page.MustElement("#confirmation")
		confirmationText := confirmation.MustText()
		assert.Equal(t, "test", confirmationText)
	})
}
