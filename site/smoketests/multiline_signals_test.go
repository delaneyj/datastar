package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleMultilineSignals(t *testing.T) {
	g := setup(t)

	page := g.page("examples/multiline_signals")
	assert.NotNil(t, page)

	t.Run("number", func(t *testing.T) {
		input := page.MustElement("article > div > input:nth-of-type(1)").MustText()
		assert.Equal(t, "1234", input)
	})

	t.Run("text", func(t *testing.T) {
		input := page.MustElement("article > div > input:nth-of-type(2)").MustText()
		assert.Equal(t, "bar", input)
	})
}
