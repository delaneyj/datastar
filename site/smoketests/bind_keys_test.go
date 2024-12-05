package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/input"
	"github.com/stretchr/testify/assert"
)

func TestExampleBindKeys(t *testing.T) {
	g := setup(t)

	page := g.page("examples/bind_keys")
	assert.NotNil(t, page)

	t.Run("ctrl+k", func(t *testing.T) {
		page.MustElement("#demo").MustClick()
		wait, handle := page.MustHandleDialog()

		go page.KeyActions().Press(input.ControlLeft).Type(input.KeyK).MustDo()

		wait()
		handle(true, "")
	})

	t.Run("enter", func(t *testing.T) {
		page.MustElement("#demo").MustClick()
		wait, handle := page.MustHandleDialog()

		go page.Keyboard.MustType(input.Enter)

		wait()
		handle(true, "")
	})
}
