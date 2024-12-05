package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleQuickPrimerGo(t *testing.T) {
	g := setup(t)

	page := g.page("examples/quick_primer_go")
	assert.NotNil(t, page)

	t.Run("text input", func(t *testing.T) {
		initial := page.MustElement("main > div:nth-of-type(1)").MustText()

		input := page.MustElement("main > input:nth-of-type(1)")
		input.MustSelectAllText().MustInput("")
		input.MustInput("test")

		result := page.MustElement("main > div:nth-of-type(1)").MustText()

		assert.NotEqual(t, initial, result)
	})

	t.Run("toggle button", func(t *testing.T) {
		initial := page.MustElement("main > div:nth-of-type(2)").MustAttribute("style")
		assert.Equal(t, "display: none;", *initial)

		btn := page.MustElementR("button", "Toggle")
		btn.MustClick()

		result := page.MustElement("main > div:nth-of-type(2)").MustAttribute("style")
		assert.Equal(t, "", *result)
	})

	t.Run("send state", func(t *testing.T) {
		t.Skip("skipping send state, button is not being clicked")
		selector := "#output"
		initial := page.MustElement(selector).MustText()

		t.Logf("initial: %s", initial)

		btn := page.MustElementR("button", "Send State")
		btn.MustClick()

		page.MustWaitDOMStable()
		page.MustScreenshot("send.png")

		result := page.MustElement(selector).MustText()
		t.Logf("result: %s", result)

		assert.NotEqual(t, initial, result)
	})

	t.Run("get state", func(t *testing.T) {
		selector := "#output2"
		initial := page.MustElement(selector).MustText()

		btn := page.MustElementR("button", "Get State")
		btn.MustClick()

		page.MustWaitDOMStable()

		result := page.MustElement(selector).MustText()

		assert.NotEqual(t, initial, result)
	})
}
