package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExamplePersist(t *testing.T) {
	t.Skip("skipping TestExamplePersist")
	g := setup(t)

	page := g.page("examples/persist")
	assert.NotNil(t, page)
}
