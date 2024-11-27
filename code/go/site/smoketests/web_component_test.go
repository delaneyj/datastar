package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/input"
	"github.com/stretchr/testify/assert"
)

func TestExampleWebComponent(t *testing.T) {
	g := setup(t)

	page := g.page("examples/web_component")
	assert.NotNil(t, page)

	t.Run("observe web component", func(t *testing.T) {
		page.MustElement("article > div > input").MustInput("tes")
		page.MustElement("article > div > input").MustType(input.KeyT)

		result := page.MustElement("div > span").MustText()

		assert.Equal(t, "tset", result)
	})
}
