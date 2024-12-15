package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleClickToLoad(t *testing.T) {
	setupPageTest(t, "examples/click_to_load", func(runner runnerFn) {
		runner("click to load", func(t *testing.T, page *rod.Page) {
			table := page.MustElement(".table")

			rows := table.MustElements("tr")
			assert.Len(t, rows, 11)

			btn := page.MustElement("#more_btn")
			btn.MustClick()
			page.MustWaitStable()

			updatedRows := table.MustElements("tr")
			assert.Len(t, updatedRows, 21)
		})
	})
}
