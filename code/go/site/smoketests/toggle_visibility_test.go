package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleToggleVisibility(t *testing.T) {
	g := setup(t)

	page := g.page("examples/toggle_visibility")
	assert.NotNil(t, page)
}
