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
		wait, handle := page.MustHandleDialog()

		go btn.MustClick()

		wait()
		handle(true, "test")
		handle(true, "")

		result := page.MustElement("span.font-bold").MustText()

		assert.Equal(t, "test", result)
	})
}
