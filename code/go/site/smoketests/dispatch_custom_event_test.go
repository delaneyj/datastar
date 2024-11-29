package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleDispatchCustomEvent(t *testing.T) {
	g := setup(t)

	page := g.page("examples/dispatch_custom_event")
	assert.NotNil(t, page)

	t.Run("observe dispatched custom event", func(t *testing.T) {
		selector := "#container"
		el := page.MustElement(selector)
		initial := el.MustText()

		page.MustWait(`() => document.querySelector("` + selector + `").innerText !== ""`)

		result := el.MustText()

		assert.NotEqual(t, initial, result)
	})
}
