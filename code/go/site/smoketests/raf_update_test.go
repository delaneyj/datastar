package smoketests

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestExamplesRafUpdate(t *testing.T) {
	page := testExamplesPage(t, "raf_update")

	timeEl := page.MustElement("#time")
	last := ""
	for i := 0; i < 3; i++ {
		current, err := timeEl.Text()
		assert.NoError(t, err)

		assert.NotEqual(t, last, current)
		last = current
		time.Sleep(1001 * time.Millisecond)
	}
}
