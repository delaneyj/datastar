package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleRafUpdate(t *testing.T) {
	setupPageTest(t, "examples/raf_update", func(runner runnerFn) {
		runner("observe raf", func(t *testing.T, page *rod.Page) {
			initial := page.MustElement("pre").MustText()

			page.MustWait("() => document.querySelector(`pre`).innerText !== `" + initial + "`")

			result := page.MustElement("pre").MustText()

			assert.NotEqual(t, initial, result)
		})
	})
}
