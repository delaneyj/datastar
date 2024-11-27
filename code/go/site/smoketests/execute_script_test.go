package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
	"github.com/ysmood/gson"
)

func TestExampleExecuteScript(t *testing.T) {
	g := setup(t)

	page := g.page("examples/execute_script")
	assert.NotNil(t, page)

	t.Run("console log", func(t *testing.T) {
		btn := page.MustElement("article > div > button:nth-of-type(1)")
		btn.MustClick()

		results := make([]gson.JSON, 0, 1)

		page.EachEvent(func(e *proto.RuntimeConsoleAPICalled) (stop bool) {
			if e.Type == proto.RuntimeConsoleAPICalledTypeLog {
				// t.Log(page.MustObjectsToJSON(e.Args))
				results = append(results, page.MustObjectsToJSON(e.Args))
				if len(results) == 1 {
					return true
				}
			}
			return false
		})()

		assert.Equal(t, 1, len(results))
	})
	t.Run("console error", func(t *testing.T) {
		btn := page.MustElement("article > div > button:nth-of-type(2)")
		btn.MustClick()

		results := make([]gson.JSON, 0, 1)

		page.EachEvent(func(e *proto.RuntimeConsoleAPICalled) (stop bool) {
			if e.Type == proto.RuntimeConsoleAPICalledTypeError {
				// t.Log(page.MustObjectsToJSON(e.Args))
				results = append(results, page.MustObjectsToJSON(e.Args))
				if len(results) == 1 {
					return true
				}
			}
			return false
		})()

		assert.Equal(t, 1, len(results))
	})
}
