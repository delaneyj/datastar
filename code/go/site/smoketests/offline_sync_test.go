package smoketests

import (
	"strings"
	"testing"

	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
)

func TestExampleOfflineSync(t *testing.T) {
	g := setup(t)

	page := g.page("examples/offline_sync")
	assert.NotNil(t, page)

	t.Run("offline sync", func(t *testing.T) {
		results := page.MustElement("#results")
		initial := results.MustText()
		assert.Equal(t, "Go offline, then online to see the store sync", initial)

		err := proto.NetworkEmulateNetworkConditions{Offline: true}.Call(page)
		assert.NoError(t, err)

		err = proto.NetworkEmulateNetworkConditions{Offline: false}.Call(page)
		assert.NoError(t, err)

		waitForElementWithIDToStartWith(t, page, results, "Synchronized offline data!")
		assert.True(t, strings.Contains(results.MustText(), "stuffAlreadyInStore"))
	})
}
