package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/input"
	"github.com/stretchr/testify/assert"
)

func TestTodos(t *testing.T) {
	g := setup(t)

	t.Run("add a todo", func(t *testing.T) {
		page := g.page("")
		assert.NotNil(t, page)
		el := page.MustElementR("input", "What needs to be done?").MustInput("testing!")
		el.MustType(input.Enter)

		page.MustScreenshot("todo.png")

	})

}
