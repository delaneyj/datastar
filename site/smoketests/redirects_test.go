package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleRedirects(t *testing.T) {
	setupPageTest(t, "examples/redirects", func(runner runnerFn) {
		runner("redirection", func(t *testing.T, page *rod.Page) {
			btn := page.MustElementR("button", "Redirect")
			btn.MustClick()

			waitForURLToContain(page, "grugs_around_fire")

			url := page.MustInfo().URL
			assert.Contains(t, url, "grugs_around_fire")
		})
	})
}
