import { test, expect } from "@playwright/test";

test.describe("Lazy Load UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/lazy_load");
    await expect(page.locator("#lazy-load")).toContainText("Lazy Load");
  });

  test("test initial state", async ({ page }) => {
    await page.locator("#lazy_load").getByText("Loading...").click();
    await expect(page.locator("img#lazy_load")).toBeAttached();
  });
});
