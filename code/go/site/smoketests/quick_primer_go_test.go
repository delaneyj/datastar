package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleQuickPrimerGo(t *testing.T) {
	g := setup(t)

	page := g.page("examples/quick_primer_go")
	assert.NotNil(t, page)
}
