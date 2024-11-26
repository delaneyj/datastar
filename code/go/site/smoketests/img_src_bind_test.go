package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleImgSrcBind(t *testing.T) {
	g := setup(t)

	page := g.page("examples/img_src_bind")
	assert.NotNil(t, page)

	t.Run("image source binding", func(t *testing.T) {
		el := page.MustElement("#file_upload > img")
		initial := el.MustProperty("src").Str()
		assert.Equal(t, "https://picsum.photos/id/237/640/320", initial)

		page.MustElement("#file_upload > button").MustClick()
		result := el.MustProperty("src").Str()

		assert.NotEqual(t, initial, result)
	})
}
