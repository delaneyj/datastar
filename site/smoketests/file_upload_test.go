package smoketests

import (
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleFileUpload(t *testing.T) {
	g := setup(t)

	page := g.page("examples/file_upload")
	assert.NotNil(t, page)

	t.Run("upload a file", func(t *testing.T) {
		el := page.MustElement(`[type=file]`)
		el.MustSetFiles(
			filepath.FromSlash("site/smoketests/file_upload_test.go"),
		)

		list := el.MustEval("() => Array.from(this.files).map(f => f.name)").Arr()
		assert.Len(t, list, 1)
		assert.Equal(t, "file_upload_test.go", list[0].String())
	})
}
