package smoketests

import (
	"testing"

	"github.com/Jeffail/gabs/v2"
	"github.com/stretchr/testify/assert"
)

func TestExamplePersist(t *testing.T) {
	g := setup(t)

	page := g.page("examples/persist")
	assert.NotNil(t, page)

	page.MustWaitIdle()

	expected := "foo"

	checkLocalStorage := func() string {
		fromLocalStorage := page.MustEval(`k => localStorage[k]`, "foo")
		marshalled := fromLocalStorage.String()
		c, err := gabs.ParseJSON([]byte(marshalled))
		assert.NoError(t, err)
		actual := c.Path("nested.test1").Data().(string)
		return actual
	}
	assert.Equal(t, expected, checkLocalStorage())

	page.MustWaitIdle()

	input := page.MustElement("#keyInput")

	revisedExpected := "This is a test"
	input.MustInput(revisedExpected)

	page.MustWaitIdle()
	assert.Equal(t, expected+revisedExpected, checkLocalStorage())

}
