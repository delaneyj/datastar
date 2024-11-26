package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExamplePrefetch(t *testing.T) {
	g := setup(t)

	t.Run("carousel next", func(t *testing.T) {
		page := g.page("examples/prefetch")
		assert.NotNil(t, page)

		initial := page.MustElement("#carousel > img").MustProperty("src").Str()

		btn := page.MustElement("#carousel > button:nth-of-type(2)")
		btn.MustClick()

		result := page.MustElement("#carousel").MustProperty("src").Str()

		assert.NotEqual(t, initial, result)
	})

	t.Run("carousel previous", func(t *testing.T) {
		page := g.page("examples/prefetch")
		assert.NotNil(t, page)

		initial := page.MustElement("#carousel > img").MustProperty("src").Str()

		btn := page.MustElement("#carousel > button:nth-of-type(1)")
		btn.MustClick()

		result := page.MustElement("#carousel").MustProperty("src").Str()

		assert.NotEqual(t, initial, result)

	})

}
