package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleMultilineExpressions(t *testing.T) {
	setupPageTest(t, "examples/multiline_expressions", func(runner runnerFn) {
		runner("observe change", func(t *testing.T, page *rod.Page) {
			selector := "article > div"
			initial := page.MustElement(selector).MustText()

			page.MustWait(`() => document.querySelector("` + selector + `").innerText !== "` + initial + `"`)
			result := page.MustElement(selector).MustText()

			assert.NotEqual(t, initial, result)
		})
	})
}
