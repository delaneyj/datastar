import { Locator, expect, test } from "@playwright/test";

test.describe("Store Changed", () => {
  let increment, clear, local_clicks, serverChanged: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/store_changed");

    increment = page.locator("#increment");
    clear = page.locator("#clear");
    local_clicks = page.locator("#local_clicks");
    serverChanged = page.locator("#from_server");

    await Promise.all(
      [increment, clear, local_clicks, serverChanged].map((el) =>
        expect(el).toBeAttached()
      )
    );
  });

  test("test local is updating", async ({ page }) => {
    await clear.click();
    await expect(local_clicks).toContainText("0");

    for (let i = 0; i < 3; i++) {
      await expect(local_clicks).toContainText(`${i}`);
      await increment.click();
      await page.waitForTimeout(100);
      const next = `${i + 1}`;
      await expect(local_clicks).toContainText(next);
      await expect(serverChanged).toContainText(next);
    }
    await clear.click();
    await expect(local_clicks).toContainText("0");
  });
});
