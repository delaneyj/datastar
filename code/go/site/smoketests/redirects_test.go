package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleRedirects(t *testing.T) {
	g := setup(t)

	page := g.page("examples/redirects")
	assert.NotNil(t, page)
}
