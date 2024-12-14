package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleIndicator(t *testing.T) {
	setupPageTest(t, "examples/indicator", func(runner runnerFn) {
		runner("greeting", func(t *testing.T, page *rod.Page) {
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
	})
}
