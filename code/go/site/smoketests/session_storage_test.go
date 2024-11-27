package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleSessionStorage(t *testing.T) {
	t.Skip("skipping TestExampleSessionStorage")
	g := setup(t)

	page := g.page("examples/session_storage")
	assert.NotNil(t, page)
}
