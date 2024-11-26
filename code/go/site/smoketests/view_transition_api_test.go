package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleViewTransitionApi(t *testing.T) {
	g := setup(t)

	page := g.page("examples/view_transition_api")
	assert.NotNil(t, page)
}
