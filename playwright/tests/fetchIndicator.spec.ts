import { test, expect } from "@playwright/test";

test.describe("Edit Row UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/fetch_indicator");
    await expect(page.locator("#fetch-indicator")).toContainText(
      "Fetch Indicator"
    );
  });

  test("test fetch indicator", async ({ page }) => {
    await page.getByTestId("greeting_button").click();
    await expect(page.locator("div#ind")).toBeVisible();
    await expect(page.locator("div#greeting")).toBeVisible();
    await expect(page.locator("div#greeting")).toContainText(
      "Hello, the time is"
    );
  });
});
