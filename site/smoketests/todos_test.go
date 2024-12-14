package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/input"
	"github.com/stretchr/testify/assert"
)

func TestTodos(t *testing.T) {
	setupPageTest(t, "", func(runner runnerFn) {
		runner("add a todo", func(t *testing.T, page *rod.Page) {
			assert.NotNil(t, page)
			el := page.MustElementR("input", "What needs to be done?").MustInput("testing!")
			el.MustType(input.Enter)
		})
	})

}
