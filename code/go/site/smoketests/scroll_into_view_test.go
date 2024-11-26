package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleScrollIntoView(t *testing.T) {
	g := setup(t)

	page := g.page("examples/scroll_into_view")
	assert.NotNil(t, page)
}
