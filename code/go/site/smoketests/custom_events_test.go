package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleCustomEvents(t *testing.T) {
	g := setup(t)

	page := g.page("examples/custom_events")
	assert.NotNil(t, page)

	t.Run("observe custom event", func(t *testing.T) {
		evt := "myevent"

		// setup listener
		page.MustEval(`() => {
				addEventListener('` + evt + `', function(event) {
					window.__CUSTOM_EVENT = event;
				});
			}
    	`)

		// wait until an event is captured in global scope
		page.MustWait(`() => (window.__CUSTOM_EVENT !== undefined && window.__CUSTOM_EVENT !== undefined)`)

		// capture event details
		result := page.MustEval(`() => window.__CUSTOM_EVENT.detail`).Str()

		assert.Contains(t, result, "eventTime")
	})
}
