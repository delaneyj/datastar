package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleReplaceUrlFromSignals(t *testing.T) {
	g := setup(t)

	page := g.page("examples/replace_url_from_signals")
	assert.NotNil(t, page)

	t.Run("observe url replacement", func(t *testing.T) {
		initial := page.MustInfo().URL

		page.MustWait(`() => window.location.href !== "` + initial + `"`)

		result := page.MustInfo().URL
		assert.NotEqual(t, initial, result)
	})
}
