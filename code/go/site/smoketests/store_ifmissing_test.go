package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleStoreIfmissing(t *testing.T) {
	g := setup(t)

	page := g.page("examples/store_ifmissing")
	assert.NotNil(t, page)

	t.Run("check the store", func(t *testing.T) {

		initial := page.MustElement("#placeholder").MustText()
		assert.Empty(t, initial)

		page.MustWait(`() => document.querySelector("#placeholder").innerText !== ""`)

		result := page.MustElement("#placeholder").MustText()
		assert.NotEqual(t, initial, result)
		assert.Equal(t, "1234", result)
	})
}
