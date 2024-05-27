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
    const perLoadCount = 10;
    let expectedRows = perLoadCount;

    const rows = page.locator("#click_to_load_rows tr");
    await expect(rows).toHaveCount(expectedRows);

    const moreBtn = page.locator("#more_btn");

    for (let i = 0; i < 2; i++) {
      await moreBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      expectedRows += perLoadCount;
      const actualRows = await rows.count();
      await expect(actualRows).toBe(expectedRows);
    }
  });
});
