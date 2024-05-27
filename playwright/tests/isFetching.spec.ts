import { Locator, expect, test } from "@playwright/test";

test.describe("Edit Row UI Suite", () => {
  let loadingIndicator: Locator, greeting: Locator, greetingButton: Locator;

  const loadingIsVisible = async (shouldBeVisible = true) => {
    console.log({ loadingIndicator });
    const o = await loadingIndicator.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue("opacity");
    });
    const isVisible = o === "1";
    await expect(isVisible).toBe(shouldBeVisible);
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/is_fetching");

    loadingIndicator = page.locator("#fetchingIndicator");
    greeting = page.locator("#greeting");
    greetingButton = page.locator("#greetingButton");

    await expect(loadingIndicator).toBeAttached();
    await expect(greeting).toBeAttached();

    await loadingIsVisible(false);
    await expect(greetingButton).toBeVisible();
    await expect(loadingIndicator).toContainText("Loading Signal");
  });

  test("test is loading identifier", async ({ page }) => {
    await greetingButton.click();
    await expect(greeting).toContainText("Calculating...");
    await page.waitForTimeout(100);
    await loadingIsVisible(true);

    await page.waitForTimeout(1500);
    await loadingIsVisible(false);
    await expect(greeting).toContainText("Hello, the time is");
  });
});
