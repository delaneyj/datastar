package smoketests

import (
	"fmt"
	"testing"

	"github.com/go-rod/rod"
	"github.com/stretchr/testify/assert"
)

func waitForElementWithIDToHaveInnerText(t *testing.T, page *rod.Page, el *rod.Element) {
	id, err := el.Attribute("id")
	assert.NoError(t, err)
	assert.NotNil(t, id)

	js := fmt.Sprintf(`() => {
		const q = document.querySelector('#%s')
		return q.innerText != ''
	}`, *id)
	page.MustWait(js)
}

func waitForElementWithIDToStartWith(t *testing.T, page *rod.Page, el *rod.Element, text string) {
	id, err := el.Attribute("id")
	assert.NoError(t, err)
	assert.NotNil(t, id)

	js := fmt.Sprintf(`() => {
		const q = document.querySelector('#%s')
		return q.innerText.startsWith('%s')
	}`, *id, text)
	page.MustWait(js)
}

func waitForURLToContain(t *testing.T, page *rod.Page, text string) {
	js := fmt.Sprintf(`() => {
		return window.location.href.includes('%s')
	}`, text)
	page.MustWait(js)
}
