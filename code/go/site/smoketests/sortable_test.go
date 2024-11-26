package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleSortable(t *testing.T) {
	g := setup(t)

	page := g.page("examples/sortable")
	assert.NotNil(t, page)
}
