package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleStoreIfmissing(t *testing.T) {
	g := setup(t)

	page := g.page("examples/store_ifmissing")
	assert.NotNil(t, page)
}
