package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleCloak(t *testing.T) {
	setupPageTest(t, "examples/cloak", func(runner runnerFn) {
		runner("cloak", func(t *testing.T, page *rod.Page) {
			element := page.MustElement("#datastar-2692078454")
			initial, err := element.Attribute("class")
			if err != nil {
				t.Fatal("failed to get initial class: %w", err)
			}

			assert.Equal(t, "", *initial)
		})
	})
}
