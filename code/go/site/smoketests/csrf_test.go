package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
)

func TestExampleCsrf(t *testing.T) {
	g := setup(t)

	page := g.page("examples/csrf")
	assert.NotNil(t, page)

	t.Run("csrf token is present in request header", func(t *testing.T) {
		btn := page.MustElement("#update_me > button")
		expected := btn.MustEval(`() => {
			const regex = /[A-Za-z0-9+/=]+==/;
			return document.querySelector("#update_me > button").dataset["onClick"].match(regex)[0]
		}`).Str()

		e := proto.NetworkRequestWillBeSent{}
		wait := page.WaitEvent(&e)

		go btn.MustClick()
		wait()

		actual := e.Request.Headers["X-CSRF-Token"].Str()

		assert.Equal(t, expected, actual)
	})
}
