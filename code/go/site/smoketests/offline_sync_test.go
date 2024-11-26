package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
)

func TestExampleOfflineSync(t *testing.T) {
	g := setup(t)

	page := g.page("examples/offline_sync")
	assert.NotNil(t, page)

	t.Run("offline sync", func(t *testing.T) {
		initial := page.MustElement("#results").MustText()
		assert.Equal(t, "Go offline, then online to see the store sync", initial)

		_ = proto.NetworkEmulateNetworkConditions{Offline: true}.Call(page)
		_ = proto.NetworkEmulateNetworkConditions{Offline: false}.Call(page)

		result := page.MustElement("#results").MustText()

		assert.NotEqual(t, initial, result)
	})
}
