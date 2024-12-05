package smoketests

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestExampleDbmon(t *testing.T) {
	g := setup(t)

	page := g.page("examples/dbmon")
	assert.NotNil(t, page)

	t.Run("database monitoring", func(t *testing.T) {

		selector := "#dbmon > table"
		initial := page.MustElement(selector).MustHTML()
		start := time.Now()

		page.MustWait("() => document.querySelector(`" + selector + "`).innerHTML !== `" + initial + "`")
		t.Logf("TestExampleDbmon - database monitoring - MustWait duration: %s", time.Since(start))

		result := page.MustElement(selector).MustHTML()

		assert.NotEqual(t, initial, result)
	})

}
