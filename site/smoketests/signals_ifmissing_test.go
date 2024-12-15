package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleSignalsIfmissing(t *testing.T) {
	setupPageTest(t, "examples/signals_ifmissing", func(runner runnerFn) {
		runner("check the signals", func(t *testing.T, page *rod.Page) {

			initial := page.MustElement("#placeholder").MustText()
			assert.Empty(t, initial)

			page.MustWait(`() => document.querySelector("#placeholder").innerText !== ""`)

			result := page.MustElement("#placeholder").MustText()
			assert.NotEqual(t, initial, result)
			assert.Equal(t, "1234", result)
		})
	})
}
