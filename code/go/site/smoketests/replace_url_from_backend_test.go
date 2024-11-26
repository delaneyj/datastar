package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleReplaceUrlFromBackend(t *testing.T) {
	g := setup(t)

	page := g.page("examples/replace_url_from_backend")
	assert.NotNil(t, page)
}
