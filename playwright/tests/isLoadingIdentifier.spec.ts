import { expect, test } from "@playwright/test";

test.describe("Edit Row UI Suite", () => {
  let loadingIndicator, greeting, greetingButton;
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/is_loading_identifier");

    loadingIndicator = page.locator("#loadingIndicator");
    greeting = page.locator("#greeting");
    greetingButton = page.locator("#greetingButton");

    await expect(loadingIndicator).toBeHidden();
    await expect(greetingButton).toBeVisible();
    await expect(loadingIndicator).toContainText("Loading Signal");
  });

  test("test is loading identifier", async ({ page }) => {
    await greetingButton.click();

    await expect(greeting).toContainText("Calculating...");
    await page.waitForTimeout(2500);
    await expect(loadingIndicator).not.toBeVisible();
    await expect(greeting).toContainText("Hello, the time is");
  });
});
