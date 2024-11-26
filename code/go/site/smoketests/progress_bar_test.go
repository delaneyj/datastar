package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleProgressBar(t *testing.T) {
	g := setup(t)

	page := g.page("examples/progress_bar")
	assert.NotNil(t, page)
}
