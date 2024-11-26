package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleValueSelect(t *testing.T) {
	g := setup(t)

	page := g.page("examples/value_select")
	assert.NotNil(t, page)
}
