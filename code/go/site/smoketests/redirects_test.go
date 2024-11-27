package smoketests

import (
	"encoding/json"
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
)

type redirect struct {
	RedirectTo string `json:"redirectTo"`
}

func TestExampleRedirects(t *testing.T) {
	g := setup(t)

	page := g.page("examples/redirects")
	assert.NotNil(t, page)

	t.Run("redirection", func(t *testing.T) {
		btn := page.MustElementR("button", "Redirect")

		var e proto.NetworkRequestWillBeSent
		wait := page.WaitEvent(&e)

		go btn.MustClick()
		wait()

		var result redirect
		err := json.Unmarshal([]byte(e.Request.PostData), &result)
		if err != nil {
			t.Error("error unmarshalling", err)
		}

		assert.Equal(t, "/essays/grugs_around_fire", result.RedirectTo)
	})
}
