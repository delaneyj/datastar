package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleUpdateStore(t *testing.T) {
	g := setup(t)

	page := g.page("examples/update_store")
	assert.NotNil(t, page)

	t.Run("apply random signal patch", func(t *testing.T) {
		initial := page.MustElement("pre").MustHTML()

		page.MustElementR("button", "Apply random signal patch").MustClick()

		result := page.MustElement("pre").MustHTML()

		assert.NotEqual(t, initial, result)
	})

	t.Run("remove 2 random", func(t *testing.T) {
		initial := page.MustElement("pre").MustHTML()

		page.MustElementR("button", "Remove 2 random").MustClick()

		page.MustWaitIdle()

		result := page.MustElement("pre").MustHTML()

		assert.NotEqual(t, initial, result)
	})
}
