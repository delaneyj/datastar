package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleIndicator(t *testing.T) {
	g := setup(t)

	page := g.page("examples/indicator")
	assert.NotNil(t, page)

	t.Run("greeting", func(t *testing.T) {
		btn := page.MustElement("button")

		greeting := page.MustElement("#greeting")
		greetingText := greeting.MustText()
		assert.Equal(t, "", greetingText)

		btn.MustClick()
		page.MustWaitIdle()
		waitForElementWithIDToStartWith(t, page, greeting, "Hello")

		updatedGreeting := greeting.MustText()

		assert.Contains(t, updatedGreeting, "Hello")
	})

}
