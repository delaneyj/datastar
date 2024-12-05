package smoketests

import (
	"testing"

	"github.com/go-rod/rod"
	datastar "github.com/starfederation/datastar/sdk/go"
	"github.com/stretchr/testify/assert"
)

func TestExampleMergeOptions(t *testing.T) {
	g := setup(t)

	getTarget := func(page *rod.Page) *rod.Element {
		target := page.MustElement("#imTheTarget")
		assert.NotNil(t, target)
		return target
	}

	setupMergeModeTest := func(
		t *testing.T, mergeMode datastar.FragmentMergeMode,
		fn func(t *testing.T, page *rod.Page),
	) {
		mmStr := string(mergeMode)
		page := g.page("examples/merge_options")
		assert.NotNil(t, page)

		initial, _ := getTarget(page).Attribute("style")
		assert.Nil(t, initial)

		mergeModeBtn := page.MustElement("#" + mmStr)
		mergeModeBtn.MustClick()
		page.MustWaitIdle()

		fn(t, page)
	}

	t.Run("morph", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeMorph,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				waitForElementWithIDToStartWith(t, page, target, "Update")
				result := target.MustAttribute("style")
				assert.Contains(t, *result, "background-color:#a6cee3")
			},
		)
	})

	t.Run("inner", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeInner,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				waitForElementWithIDToStartWith(t, page, target, "Update")
				result := target.MustText()
				assert.Contains(t, result, "Update")
			},
		)
	})

	t.Run("outer", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeOuter,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				result := target.MustText()
				assert.Contains(t, result, "Update")
			},
		)
	})

	t.Run("prepend", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModePrepend,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				actualTarget := target.MustElements("div")[0]
				result := actualTarget.MustHTML()
				assert.Contains(t, result, "background-color:#33a02c")
			},
		)
	})

	t.Run("append", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeAppend,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				actualTarget := target.MustElement("div")
				result := actualTarget.MustHTML()
				assert.Contains(t, result, "background-color:#fb9a99")
			},
		)
	})

	t.Run("before", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeBefore,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				actualTarget := target.MustParent().MustElement("div")
				result := actualTarget.MustHTML()
				assert.Contains(t, result, "background-color:#e31a1c")
			},
		)
	})

	t.Run("after", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeAfter,
			func(t *testing.T, page *rod.Page) {
				target := getTarget(page)
				actualTarget := target.MustNext()
				result := actualTarget.MustHTML()
				assert.Contains(t, result, "background-color:#fdbf6f")
			},
		)
	})

	t.Run("upsertAttributes", func(t *testing.T) {
		setupMergeModeTest(
			t, datastar.FragmentMergeModeUpsertAttributes,
			func(t *testing.T, page *rod.Page) {
				// waitForElementWithIDToStartWith(t, page, target, "Update")
				target := getTarget(page)
				result := target.MustAttribute("style")
				assert.NotNil(t, result)
				assert.Contains(t, *result, "background-color:#ff7f00")
			},
		)
	})
}
