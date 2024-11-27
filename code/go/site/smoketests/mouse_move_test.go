package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleMouseMove(t *testing.T) {
	t.Skip("skipping TestExampleMouseMove")
	g := setup(t)

	page := g.page("examples/mouse_move")
	assert.NotNil(t, page)

}
