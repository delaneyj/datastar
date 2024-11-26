package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleLazyTabs(t *testing.T) {
	g := setup(t)

	page := g.page("examples/lazy_tabs")
	assert.NotNil(t, page)

	t.Run("click through lazy tabs", func(t *testing.T) {
		tabs := page.MustElement(".tabs.tabs-bordered").MustElements("button")
		initial := page.MustElement("#tab_content").MustText()

		for _, btn := range tabs {
			btn.MustClick()
			result := page.MustElement("#tab_content").MustText()
			assert.NotEqual(t, initial, result)
		}
	})
}
