package smoketests

import (
	"strings"
	"testing"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/proto"
	"github.com/stretchr/testify/assert"
)

func TestExampleOfflineSync(t *testing.T) {
	setupPageTest(t, "examples/offline_sync", func(runner runnerFn) {
		runner("offline sync", func(t *testing.T, page *rod.Page) {
			results := page.MustElement("#results")
			initial := results.MustText()
			assert.Equal(t, "Go offline, then online to see the signals sync", initial)

			err := proto.NetworkEmulateNetworkConditions{Offline: true}.Call(page)
			assert.NoError(t, err)

			err = proto.NetworkEmulateNetworkConditions{Offline: false}.Call(page)
			assert.NoError(t, err)

			waitForElementWithIDToStartWith(t, page, results, "Synchronized offline data!")
			assert.True(t, strings.Contains(results.MustText(), "existingSignals"))
		})
	})
}
