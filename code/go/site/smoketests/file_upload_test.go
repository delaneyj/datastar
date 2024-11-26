package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleFileUpload(t *testing.T) {
	g := setup(t)

	page := g.page("examples/file_upload")
	assert.NotNil(t, page)
}
