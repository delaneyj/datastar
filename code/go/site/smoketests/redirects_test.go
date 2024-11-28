package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleRedirects(t *testing.T) {
	g := setup(t)

	page := g.page("examples/redirects")
	assert.NotNil(t, page)

	t.Run("redirection", func(t *testing.T) {
		btn := page.MustElementR("button", "Redirect")
		btn.MustClick()

		waitForURLToContain(page, "grugs_around_fire")

		url := page.MustInfo().URL
		assert.Contains(t, url, "grugs_around_fire")
	})
}
