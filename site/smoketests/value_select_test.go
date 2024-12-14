package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleValueSelect(t *testing.T) {
	setupPageTest(t, "examples/value_select", func(runner runnerFn) {
		runner("submit a selection", func(t *testing.T, page *rod.Page) {

			page.MustElement("#value_select > select:nth-of-type(1)").MustSelect("Audi")
			page.MustElement("#value_select > select:nth-of-type(2)").MustSelect("A3")
			page.MustElementR("button", "Submit selected").MustClick()

			result := page.MustElement(".card-body").MustHTML()

			assert.Contains(t, result, "Audi")
			assert.Contains(t, result, "A3")
		})
	})
}
