package smoketests

import (
	"encoding/json"
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

type carSignals struct {
	Cars []string `json:"cars"`
}

func TestExampleMultiSelect(t *testing.T) {
	setupPageTest(t, "examples/multi_select", func(runner runnerFn) {
		runner("multi-select", func(t *testing.T, page *rod.Page) {
			selectEl := page.MustElement("select")

			// unselect
			selectEl.Select([]string{"What's your favorite car"}, false, rod.SelectorTypeText)

			// select
			selectEl.MustSelect("Volvo", "Saab", "Opel")

			pre := page.MustElement("pre")

			signals := &carSignals{}
			json.Unmarshal([]byte(pre.MustText()), signals)

			assert.Len(t, signals.Cars, 3)
		})
	})
}
