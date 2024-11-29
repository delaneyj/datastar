package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleModelBinding(t *testing.T) {
	g := setup(t)

	page := g.page("examples/model_binding")
	assert.NotNil(t, page)

	t.Run("text box", func(t *testing.T) {
		textInput := page.MustElement("#container > input:nth-of-type(1)")
		textInput.MustSelectAllText().MustInput("")
		textInput.MustInput("banana")

		textArea := page.MustElement("#container > textarea")

		assert.Equal(t, "banana", textArea.MustText())
	})

	t.Run("select", func(t *testing.T) {
		selector := "#container > select"
		selectEl := page.MustElement(selector)

		selectEl.MustSelect("Option 4")
		assert.Equal(t, 3, selectEl.MustProperty("selectedIndex").Int())

		checkbox := page.MustElement("#container > div:nth-of-type(2) > div:nth-of-type(4) > label > input")
		assert.True(t, checkbox.MustProperty("checked").Bool())
	})
}
