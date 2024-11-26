package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleCloak(t *testing.T) {
	g := setup(t)

	page := g.page("examples/cloak")
	assert.NotNil(t, page)

	t.Run("cloak", func(t *testing.T) {
		element := page.MustElement("#datastar--0")
		initial, err := element.Attribute("class")
		if err != nil {
			t.Fatal("failed to get initial class: %w", err)
		}

		assert.Equal(t, "", *initial)
	})
}
