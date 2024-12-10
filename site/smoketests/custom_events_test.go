package smoketests

import (
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestExampleCustomEvents(t *testing.T) {
	g := setup(t)

	page := g.page("examples/custom_events")
	assert.NotNil(t, page)

	t.Run("observe custom event", func(t *testing.T) {

		evtCountEl := page.MustElement("#eventCount")

		count := func() int {
			evtCountRaw := evtCountEl.MustText()
			evtCount, err := strconv.Atoi(evtCountRaw)
			assert.NoError(t, err)
			return evtCount
		}

		prev := count()
		for i := 0; i < 2; i++ {
			time.Sleep(1 * time.Second)
			evtCountAgain := count()
			assert.Greater(t, evtCountAgain, prev)
			prev = evtCountAgain
		}
	})
}
