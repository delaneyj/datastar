package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleTitleUpdateBackend(t *testing.T) {
	g := setup(t)

	page := g.page("examples/title_update_backend")
	assert.NotNil(t, page)

	t.Run("observe title change", func(t *testing.T) {
		initial := page.MustEval(`() => document.title`).Str()

		page.MustWait(`() => document.title !== "` + initial + `"`)

		result := page.MustEval(`() => document.title`).Str()

		assert.NotEqual(t, initial, result)
	})
}
