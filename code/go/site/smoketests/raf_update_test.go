package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleRafUpdate(t *testing.T) {
	g := setup(t)

	page := g.page("examples/raf_update")
	assert.NotNil(t, page)

	t.Run("observe raf", func(t *testing.T) {
		initial := page.MustElement("pre").MustText()

		page.MustWait("() => document.querySelector(`pre`).innerText !== `" + initial + "`")

		result := page.MustElement("pre").MustText()

		assert.NotEqual(t, initial, result)
	})
}
