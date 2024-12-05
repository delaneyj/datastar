package smoketests

import (
	"testing"

	"github.com/go-rod/rod/lib/input"
	"github.com/stretchr/testify/assert"
)

func TestExampleInlineValidation(t *testing.T) {
	g := setup(t)

	page := g.page("examples/inline_validation")
	assert.NotNil(t, page)

	t.Run("sign up", func(t *testing.T) {
		// email
		emailValidatorSelector := "div.form-control:nth-child(1) > label:nth-child(3)"
		emailValidatorMsg := page.MustElement(emailValidatorSelector).MustText()
		assert.Equal(t, "Email '' is already taken or is invalid. Please enter another email.", emailValidatorMsg)

		emailInput := page.MustElement("#inline_validation > div > div:nth-of-type(1) > input")
		emailInput.MustInput("test@test.co")

		emailInput.Type(input.KeyM) // actually triggers the debounce

		// first name
		firstNameValidatorSelector := "div.form-control:nth-child(2) > label:nth-child(3)"
		firstNameValidatorSelectorMsg := page.MustElement(firstNameValidatorSelector).MustText()
		assert.Equal(t, "First name must be at least 2 characters.", firstNameValidatorSelectorMsg)

		firstNameInput := page.MustElement("#inline_validation > div > div:nth-of-type(2) > input")
		firstNameInput.MustInput("tes")
		firstNameInput.Type(input.KeyT) // actually triggers the debounce

		// last name
		lastNameValidatorSelector := "div.form-control:nth-child(3) > label:nth-child(3)"
		lastNameValidatorSelectorMsg := page.MustElement(lastNameValidatorSelector).MustText()
		assert.Equal(t, "Last name must be at least 2 characters.", lastNameValidatorSelectorMsg)

		lastNameInput := page.MustElement("#inline_validation > div > div:nth-of-type(3) > input")
		lastNameInput.MustInput("tes")
		lastNameInput.Type(input.KeyT) // actually triggers the debounce

		page.MustWaitStable()

		emailNotValid, _, _ := page.Has(emailValidatorSelector)
		assert.False(t, emailNotValid)

		firstNameNotValid, _, _ := page.Has(firstNameValidatorSelector)
		assert.False(t, firstNameNotValid)

		lastNameNotValid, _, _ := page.Has(lastNameValidatorSelector)
		assert.False(t, lastNameNotValid)
	})
}
