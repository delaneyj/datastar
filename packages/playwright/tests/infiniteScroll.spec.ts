import { expect, test } from "@playwright/test";

test.describe("Infinite Scroll UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/infinite_scroll");
    await expect(page.locator("#infinite-scroll")).toContainText(
      "Infinite Scroll"
    );
  });

  test("test initial state", async ({ page }) => {
    await expect(page.locator("#click_to_load_rows tr")).toHaveCount(10);
    await expect(page.locator("#agent_0 > td:first-child")).toContainText(
      "Agent Smith 0"
    );
    await expect(page.locator("#agent_0 > td:nth-child(2)")).toContainText(
      "void1@null.org"
    );
    await expect(page.locator("#agent_0 > td:nth-child(3)")).toBeAttached();
    await expect(page.locator("#agent_9 > td:first-child")).toContainText(
      "Agent Smith 9"
    );
    await expect(page.locator("#agent_9 > td:nth-child(2)")).toContainText(
      "void10@null.org"
    );
    await expect(page.locator("#agent_9 > td:nth-child(3)")).toBeAttached();
  });

  test("test infinite scroll", async ({ page }) => {
    const lm = page.locator("#loading_message");
    await expect(lm).toContainText("Loading...");

    const rows = page.locator("#click_to_load_rows tr");
    for (let i = 10; i <= 50; i += 10) {
      await expect(rows).toHaveCount(i);
      await lm.scrollIntoViewIfNeeded();
    }
  });
});
