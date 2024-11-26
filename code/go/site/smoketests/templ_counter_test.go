package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleTemplCounter(t *testing.T) {
	g := setup(t)

	page := g.page("examples/templ_counter")
	assert.NotNil(t, page)
}
