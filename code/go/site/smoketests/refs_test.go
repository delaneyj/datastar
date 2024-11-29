package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleRefs(t *testing.T) {
	g := setup(t)

	page := g.page("examples/refs")
	assert.NotNil(t, page)

	t.Run("observe ref", func(t *testing.T) {
		initial := page.MustElementR(".card-title", "I'm using content").MustText()
		assert.Contains(t, initial, "I'm a div that is getting referenced")
	})
}
