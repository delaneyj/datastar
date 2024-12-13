package smoketests

import (
	"path/filepath"
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleFileUpload(t *testing.T) {
	setupPageTest(t, "examples/file_upload", func(runner runnerFn) {
		runner("upload a file", func(t *testing.T, page *rod.Page) {
			el := page.MustElement(`[type=file]`)
			el.MustSetFiles(
				filepath.FromSlash("site/smoketests/file_upload_test.go"),
			)

			list := el.MustEval("() => Array.from(this.files).map(f => f.name)").Arr()
			assert.Len(t, list, 1)
			assert.Equal(t, "file_upload_test.go", list[0].String())
		})
	})
}
