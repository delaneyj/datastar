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
	g := setup(t)

	page := g.page("examples/multi_select")
	assert.NotNil(t, page)

	t.Run("multi-select", func(t *testing.T) {
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
}
