package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
)

func TestExampleSortable(t *testing.T) {
	g := setup(t)

	page := g.page("examples/sortable")
	assert.NotNil(t, page)

	t.Run("click and drag", func(t *testing.T) {
		initial := page.MustElement("#sortContainer").MustHTML()

		// DOM helper to see coords of items
		// document.addEventListener("mousemove", (e) => console.log({x: e.clientX, y: e.clientY}))
		page.MustElement("#sortContainer > div:nth-of-type(1)").MustClick()
		// mouse will be at the first item (x: 760.5, y: 665)

		page.Mouse.MustDown("left")
		page.Mouse.MoveLinear(proto.NewPoint(760.5, 735.0), 1)
		page.Mouse.MustUp("left")

		page.MustWaitStable()

		result := page.MustElement("#sortContainer").MustHTML()

		assert.NotEqual(t, initial, result)
	})
}
