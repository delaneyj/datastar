import { test, expect } from "@playwright/test";

test.describe("Progress Bar UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/progress_bar");
    await expect(page.locator("#progress-bar")).toContainText("Progress Bar");
  });

  test("test progress bar", async ({ page }) => {
    await expect(page.locator("div#progress_bar > svg")).toBeAttached();
    for (let i = 0; i < 1; i++) {
      await page.waitForSelector(
        "div#progress_bar.datastar-swapping.datastar-settling",
        { state: "attached" }
      );
      await page.waitForSelector(
        "div#progress_bar:not(.datastar-swapping.datastar-settling)",
        { state: "attached" }
      );
    }

    await page.waitForSelector("#completed_link", { state: "visible" });
  });
});
