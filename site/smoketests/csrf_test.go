package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/grafana/regexp"

	"github.com/stretchr/testify/assert"
)

func TestExampleCsrf(t *testing.T) {
	g := setup(t)
	page := g.page("examples/csrf")
	assert.NotNil(t, page)

	t.Run("csrf token is present in request header", func(t *testing.T) {
		btn := page.MustElement("#update_me > button")
		onClickContentPtr, err := btn.Attribute("data-on-click")
		assert.Nil(t, err)
		assert.NotNil(t, onClickContentPtr)

		crsfTokenRegex := regexp.MustCompile(`'X-CSRF-Token':'([^']*)'`)
		matches := crsfTokenRegex.FindAllStringSubmatch(*onClickContentPtr, -1)
		assert.Len(t, matches, 1)
		assert.Len(t, matches[0], 2)
		assert.NotEmpty(t, matches[0][1])
		expectedToken := matches[0][1]

		waitForElementWithIDToStartWith(t, page, btn, "Send update")

		page.MustScreenshotFullPage("wtf.png")
		e := proto.NetworkRequestWillBeSent{}
		wait := page.WaitEvent(&e)
		btn.MustClick()
		wait()
		actual := e.Request.Headers["X-CSRF-Token"].Str()
		assert.Equal(t, expectedToken, actual)
	})
}
