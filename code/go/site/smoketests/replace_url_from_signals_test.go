package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleReplaceUrlFromSignals(t *testing.T) {
	g := setup(t)

	page := g.page("examples/replace_url_from_signals")
	assert.NotNil(t, page)
}
