package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExamplePrefetch(t *testing.T) {
	g := setup(t)

	page := g.page("examples/prefetch")
	assert.NotNil(t, page)
}
