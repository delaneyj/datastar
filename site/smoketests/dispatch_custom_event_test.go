package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleDispatchCustomEvent(t *testing.T) {
	setupPageTest(t, "examples/dispatch_custom_event", func(runner runnerFn) {
		runner("observe dispatched custom event", func(t *testing.T, page *rod.Page) {
			selector := "#container"
			el := page.MustElement(selector)
			initial := el.MustText()

			page.MustWait(`() => document.querySelector("` + selector + `").innerText !== ""`)

			result := el.MustText()

			assert.NotEqual(t, initial, result)
		})
	})
}
