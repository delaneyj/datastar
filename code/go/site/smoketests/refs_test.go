package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleRefs(t *testing.T) {
	g := setup(t)

	page := g.page("examples/refs")
	assert.NotNil(t, page)
}
