package smoketests

import (
	"strconv"
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func TestExampleActiveSearch(t *testing.T) {
	setupPageTest(t, "examples/active_search", func(runner runnerFn) {
		runner("search with first name", func(t *testing.T, page *rod.Page) {
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

		runner("search with last name", func(t *testing.T, page *rod.Page) {
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

		runner("search with email", func(t *testing.T, page *rod.Page) {
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
	})
}
