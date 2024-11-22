package smoketests

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleActiveSearch(t *testing.T) {
	page := testExamplesPage(t, "active_search")
	searchPlaceholder := page.MustElement(`[data-testid="search"]`)
	assert.Equal(t, "Search...", searchPlaceholder.MustText())
}
