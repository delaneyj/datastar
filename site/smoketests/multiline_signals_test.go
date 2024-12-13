package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleMultilineSignals(t *testing.T) {
	setupPageTest(t, "examples/multiline_signals", func(runner runnerFn) {
		runner("number", func(t *testing.T, page *rod.Page) {
			input := page.MustElement("article > div > input:nth-of-type(1)").MustText()
			assert.Equal(t, "1234", input)
		})

		runner("text", func(t *testing.T, page *rod.Page) {
			input := page.MustElement("article > div > input:nth-of-type(2)").MustText()
			assert.Equal(t, "bar", input)
		})
	})
}
