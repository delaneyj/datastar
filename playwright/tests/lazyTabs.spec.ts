import { test, expect } from "@playwright/test";

test.describe("Lazy Tabs UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/lazy_tabs");
    await expect(page.locator("#lazy-tabs")).toContainText("Lazy Tabs");
  });

  test("test lazy tabs", async ({ page }) => {
    const firstTabText = await page.locator("#tab_content").textContent();
    await expect(page.locator("div#lazy_tabs")).toBeAttached();
    await page.getByTestId("tab_1").click();
    await expect(page.locator("div#lazy_tabs")).toHaveClass(
      /.*datastar-swapping.*datastar-settling.*/
    );
    await expect(page.locator("div#lazy_tabs")).not.toHaveClass(
      /.*datastar-swapping.*datastar-settling.*/
    );
    const secondTabText = await page.locator("#tab_content").textContent();
    expect(secondTabText).not.toEqual(firstTabText);
  });
});
