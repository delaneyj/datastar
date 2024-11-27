package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleValueSelect(t *testing.T) {
	g := setup(t)

	page := g.page("examples/value_select")
	assert.NotNil(t, page)

	t.Run("submit a selection", func(t *testing.T) {

		page.MustElement("#value_select > select:nth-of-type(1)").MustSelect("Audi")
		page.MustElement("#value_select > select:nth-of-type(2)").MustSelect("A3")
		page.MustElementR("button", "Submit selected").MustClick()

		result := page.MustElement(".card-body").MustHTML()

		assert.Contains(t, result, "Audi")
		assert.Contains(t, result, "A3")
	})
}
