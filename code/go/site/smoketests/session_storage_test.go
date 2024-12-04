package smoketests

import (
	"testing"

	"github.com/Jeffail/gabs/v2"
	datastar "github.com/starfederation/datastar/sdk/go"
	"github.com/stretchr/testify/assert"
)

func TestExampleSessionStorage(t *testing.T) {
	g := setup(t)

	page := g.page("examples/session_storage")
	assert.NotNil(t, page)

	page.MustWaitIdle()

	checkSessionStorage := func() float64 {
		ss := page.MustEval(`k => sessionStorage[k]`, datastar.DatastarKey)
		marshalled := ss.String()
		c, err := gabs.ParseJSON([]byte(marshalled))
		assert.NoError(t, err)
		actual := c.Path("sessionId").Data().(float64)
		return actual
	}
	assert.Equal(t, float64(1234), checkSessionStorage())
}
