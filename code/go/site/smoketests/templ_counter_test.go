package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleTemplCounter(t *testing.T) {
	g := setup(t)

	page := g.page("examples/templ_counter")
	assert.NotNil(t, page)

	t.Run("increment global", func(t *testing.T) {
		initial := page.MustElement("#container > div:nth-of-type(2) > div > div:nth-of-type(2)").MustText()

		page.MustElementR("button", "Increment Global").MustClick()

		result := page.MustElement("#container > div:nth-of-type(2) > div > div:nth-of-type(2)").MustText()

		assert.NotEqual(t, initial, result)
	})

	t.Run("increment user", func(t *testing.T) {
		initial := page.MustElement("#container > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)").MustText()

		page.MustElementR("button", "Increment User").MustClick()

		result := page.MustElement("#container > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)").MustText()

		assert.NotEqual(t, initial, result)
	})
}
