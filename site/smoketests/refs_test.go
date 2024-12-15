package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleRefs(t *testing.T) {
	setupPageTest(t, "examples/refs", func(runner runnerFn) {
		runner("observe ref", func(t *testing.T, page *rod.Page) {
			initial := page.MustElementR(".card-title", "I'm using content").MustText()
			assert.Contains(t, initial, "I'm a div that is getting referenced")
		})
	})
}
