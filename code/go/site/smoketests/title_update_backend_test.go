package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleTitleUpdateBackend(t *testing.T) {
	g := setup(t)

	page := g.page("examples/title_update_backend")
	assert.NotNil(t, page)
}
