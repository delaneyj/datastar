package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleDeleteRow(t *testing.T) {
	setupPageTest(t, "examples/delete_row", func(runner runnerFn) {
		runner("delete a row", func(t *testing.T, page *rod.Page) {
			selector := "#contact_0 > td:nth-of-type(4) > button"
			btn := page.MustElement(selector)

			wait, handle := page.MustHandleDialog()

			go btn.MustClick()

			wait()
			handle(true, "")

			page.MustWaitStable()

			exists, el, err := page.Has(selector)

			assert.Nil(t, el)
			assert.NoError(t, err)
			assert.False(t, exists)
		})
	})
}
