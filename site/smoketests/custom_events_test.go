package smoketests

import (
	"strconv"
	"testing"
	"time"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleCustomEvents(t *testing.T) {
	setupPageTest(t, "examples/custom_events", func(runner runnerFn) {
		runner("observe custom event", func(t *testing.T, page *rod.Page) {

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
	})
}
