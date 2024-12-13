package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/input"
	"github.com/stretchr/testify/assert"
)

func TestExampleWebComponent(t *testing.T) {
	setupPageTest(t, "examples/web_component", func(runner runnerFn) {
		runner("observe web component", func(t *testing.T, page *rod.Page) {
			page.MustElement("article > div > input").MustInput("tes")
			page.MustElement("article > div > input").MustType(input.KeyT)

			result := page.MustElement("div > span").MustText()

			assert.Equal(t, "tset", result)
		})
	})
}
