import { test, expect } from "@playwright/test";

test.describe("Edit Row UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/is_loading_identifier");
    await expect(page.locator("#loadingIndicator")).toContainText(
      "Loading Signal"
    );
  });

  test("test is loading identifier", async ({ page }) => {
    await page.getByTestId("greeting_button").click();
    await expect(page.locator("div#loadingIndicator")).toBeVisible();
    await expect(page.locator("div#greeting")).toBeVisible();
    await expect(page.locator("div#greeting")).toContainText(
      "Hello, the time is"
    );
  });
});
