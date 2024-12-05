package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleMultilineExpressions(t *testing.T) {
	g := setup(t)

	page := g.page("examples/multiline_expressions")
	assert.NotNil(t, page)

	t.Run("observe change", func(t *testing.T) {
		selector := "article > div"
		initial := page.MustElement(selector).MustText()

		page.MustWait(`() => document.querySelector("` + selector + `").innerText !== "` + initial + `"`)
		result := page.MustElement(selector).MustText()

		assert.NotEqual(t, initial, result)
	})
}
