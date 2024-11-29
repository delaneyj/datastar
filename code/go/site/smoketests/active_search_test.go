package smoketests

import (
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExampleActiveSearch(t *testing.T) {
	g := setup(t)

	page := g.page("examples/active_search")
	assert.NotNil(t, page)

	t.Run("search with first name", func(t *testing.T) {
		firstName := page.MustElement("#active_search_rows > tr:nth-child(5) > td:nth-child(1)").MustText()

		search := page.MustElement("#searchInput")
		search.Input(firstName)

		scoreText := page.MustElement("#active_search_rows > tr:nth-child(1) > td:nth-child(4)").MustText()

		scoreFloat, err := strconv.ParseFloat(scoreText, 64)
		if err != nil {
			t.Fail()
		}

		assert.Greater(t, scoreFloat, 80.0)
	})

	t.Run("search with last name", func(t *testing.T) {
		lastName := page.MustElement("#active_search_rows > tr:nth-child(5) > td:nth-child(2)").MustText()

		search := page.MustElement("#searchInput")
		search.Input(lastName)

		scoreText := page.MustElement("#active_search_rows > tr:nth-child(1) > td:nth-child(4)").MustText()

		scoreFloat, err := strconv.ParseFloat(scoreText, 64)
		if err != nil {
			t.Fail()
		}

		assert.Greater(t, scoreFloat, 80.0)
	})

	t.Run("search with email", func(t *testing.T) {
		email := page.MustElement("#active_search_rows > tr:nth-child(5) > td:nth-child(3)").MustText()

		search := page.MustElement("#searchInput")
		search.Input(email)

		scoreText := page.MustElement("#active_search_rows > tr:nth-child(1) > td:nth-child(4)").MustText()

		scoreFloat, err := strconv.ParseFloat(scoreText, 64)
		if err != nil {
			t.Fail()
		}

		assert.Greater(t, scoreFloat, 80.0)
	})
}
