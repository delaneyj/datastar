package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleReplaceUrlFromSignals(t *testing.T) {
	setupPageTest(t, "examples/replace_url_from_signals", func(runner runnerFn) {
		runner("observe url replacement", func(t *testing.T, page *rod.Page) {
			initial := page.MustInfo().URL

			page.MustWait(`() => window.location.href !== "` + initial + `"`)

			result := page.MustInfo().URL
			assert.NotEqual(t, initial, result)
		})
	})
}
