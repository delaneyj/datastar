package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleLazyLoad(t *testing.T) {
	g := setup(t)

	page := g.page("examples/lazy_load")
	assert.NotNil(t, page)

	t.Run("observe lazy load", func(t *testing.T) {
		selector := "#lazy_load"

		initial := page.MustElement(selector).MustText()
		assert.Equal(t, "Loading...", initial)

		page.MustWait(`() => document.querySelector("` + selector + `").innerText === ""`)

		src := page.MustElement(selector).MustAttribute("src")

		assert.NotNil(t, src)
	})
}
