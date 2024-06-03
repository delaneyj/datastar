import { expect, test } from "@playwright/test";

test.describe("Fetch Indicator Suite", () => {
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

  test("test isFetching action", async ({ page }) => {
    await expect(page.getByTestId("greeting_button")).toBeEnabled();
    await page.getByTestId("greeting_button").click();
    await expect(page.getByTestId("greeting_button")).toBeDisabled();
    await expect(page.locator("div#greeting")).toContainText(
      "Hello, the time is"
    );    
    await expect(page.getByTestId("greeting_button")).toBeEnabled();
  });
});
