package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleUpdateStore(t *testing.T) {
	g := setup(t)

	page := g.page("examples/update_store")
	assert.NotNil(t, page)
}
