package smoketests

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestExampleBadApple(t *testing.T) {
	g := setup(t)

	page := g.page("examples/bad_apple")
	assert.NotNil(t, page)

	t.Run("bad apple 30fps", func(t *testing.T) {
		selector := "#contents > div > pre"
		initial := page.MustElement(selector).MustText()
		start := time.Now()

		page.MustWait(`() => document.querySelector("` + selector + `").innerText.includes("@")`)
		t.Logf("TestExampleBadApple - bad apple 30fps - MustWait duration: %s", time.Since(start))

		result := page.MustElement(selector).MustText()

		assert.NotEqual(t, initial, result)
	})

}
