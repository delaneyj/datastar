package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleStoreChanged(t *testing.T) {
	g := setup(t)

	page := g.page("examples/store_changed")
	assert.NotNil(t, page)
}
