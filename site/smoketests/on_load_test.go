package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleOnLoad(t *testing.T) {
	setupPageTest(t, "examples/on_load", func(runner runnerFn) {
		runner("element contains session contents", func(t *testing.T, page *rod.Page) {
			selector := "#replaceMe"
			result := page.MustElement(selector).MustText()

			assert.Contains(t, result, "map[baz:42 foo:bar]")
		})
	})
}
