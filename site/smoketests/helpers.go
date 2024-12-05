package smoketests

import (
	"fmt"
	"strings"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func waitForElementWithIDToStartWith(t assert.TestingT, page *rod.Page, el *rod.Element, text string) {
	id, err := el.Attribute("id")
	assert.NoError(t, err)
	assert.NotNil(t, id)

	js := fmt.Sprintf(`() => {
		const q = document.querySelector('#%s')
		return q.innerText.startsWith('%s')
	}`, *id, text)
	page.MustWait(js)
}

func waitForURLToContain(page *rod.Page, text string) {
	js := fmt.Sprintf(`() => {
		return window.location.href.includes('%s')
	}`, text)
	page.MustWait(js)
}

func waitForSelectorToNotHaveInnerTextEqual(page *rod.Page, selector, text string) {
	text = strings.ReplaceAll(text, "\n", "\\n")
	js := fmt.Sprintf(`() => {
		const q = document.querySelector('%s')
		return q.innerText != '%s'
	}`, selector, text)
	page.MustWait(js)
}
