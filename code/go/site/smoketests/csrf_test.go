package smoketests

import (
	"encoding/json"
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/go-rod/rod/lib/utils"
	"github.com/stretchr/testify/assert"
)

type csrfHeaders struct {
	AcceptLanguage string `json:"Accept-Language"`
	ContentType    string `json:"Content-Type"`
	Referer        string `json:"Referer"`
	UserAgent      string `json:"User-Agent"`
	XCsrfToken     string `json:"X-CSRF-Token"`
	Accept         string `json:"accept"`
}

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

		var e proto.NetworkRequestWillBeSent
		wait := page.WaitEvent(&e)

		btn.MustClick()
		wait()

		headers := utils.Dump(e.Request.Headers)

		var result csrfHeaders
		err := json.Unmarshal([]byte(headers), &result)
		if err != nil {
			t.Error("error unmarshalling", err)
		}

		assert.Equal(t, expected, result.XCsrfToken)
	})
}
