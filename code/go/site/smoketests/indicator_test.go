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
		btn := page.MustElement("#greetingBtn")

		greeting := page.MustElement("#greeting").MustText()
		assert.Equal(t, "", greeting)

		btn.MustClick()
		page.MustWait(`() => document.querySelector("#greeting").innerText.includes("Hello")`)

		updatedGreeting := page.MustElement("#greeting").MustText()

		assert.Contains(t, updatedGreeting, "Hello")
	})

}
