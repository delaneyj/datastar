package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleModelBinding(t *testing.T) {
	setupPageTest(t, "examples/model_binding", func(runner runnerFn) {
		runner("text box", func(t *testing.T, page *rod.Page) {
			textInput := page.MustElement("#container > input:nth-of-type(1)")
			textInput.MustSelectAllText().MustInput("")
			textInput.MustInput("banana")

			textArea := page.MustElement("#container > textarea")

			assert.Equal(t, "banana", textArea.MustText())
		})

		runner("select", func(t *testing.T, page *rod.Page) {
			selector := "#container > select"
			selectEl := page.MustElement(selector)

			selectEl.MustSelect("Option 4")
			assert.Equal(t, 3, selectEl.MustProperty("selectedIndex").Int())

			checkbox := page.MustElement("#container > div:nth-of-type(2) > div:nth-of-type(4) > label > input")
			assert.True(t, checkbox.MustProperty("checked").Bool())
		})
	})
}
