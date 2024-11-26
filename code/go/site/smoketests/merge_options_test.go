package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleMergeOptions(t *testing.T) {
	g := setup(t)

	t.Run("morph", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial, _ := page.MustElement("#target").Attribute("style")
		assert.Nil(t, initial)

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(1)").MustClick()

		result := page.MustElement("#target").MustAttribute("style")
		assert.Equal(t, "background-color:#a6cee3;color:black;", *result)
	})

	t.Run("inner", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial := page.MustElement("#target").MustText()

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(2)").MustClick()

		result := page.MustElement("#target").MustText()
		assert.NotEqual(t, initial, result)
	})

	t.Run("outer", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial, _ := page.MustElement("#target").Attribute("style")
		assert.Nil(t, initial)

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(3)").MustClick()

		result := page.MustElement("#target").MustAttribute("style")
		assert.Equal(t, "background-color:#b2df8a;color:black;", *result)
	})

	t.Run("prepend", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial := page.MustElement("#target").MustHTML()

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(4)").MustClick()

		result := page.MustElement("#target").MustHTML()

		assert.NotEqual(t, initial, result)
	})

	t.Run("append", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial := page.MustElement("#target").MustHTML()

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(5)").MustClick()

		result := page.MustElement("#target").MustHTML()

		assert.NotEqual(t, initial, result)
	})

	t.Run("before", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		contents := page.MustElement("#contents").MustElements("div")
		assert.Len(t, contents, 2)

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(6)").MustClick()

		updated := page.MustElement("#contents").MustElements("div")
		assert.Len(t, updated, 3)
	})

	t.Run("after", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		contents := page.MustElement("#contents").MustElements("div")
		assert.Len(t, contents, 2)

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(7)").MustClick()

		updated := page.MustElement("#contents").MustElements("div")
		assert.Len(t, updated, 3)
	})

	t.Run("upsertAttributes", func(t *testing.T) {
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial, _ := page.MustElement("#target").Attribute("style")
		assert.Nil(t, initial)

		page.MustElement("#contents > div:nth-of-type(2) > button:nth-of-type(8)").MustClick()

		result := page.MustElement("#target").MustAttribute("style")
		assert.Equal(t, "background-color:#ff7f00;color:black;", *result)
	})
}
