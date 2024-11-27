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
