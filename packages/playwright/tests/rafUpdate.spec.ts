import { Locator, expect, test } from "@playwright/test";

test.describe("Request Animation Frame Update", () => {
  let time: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/raf_update");

    time = page.locator("#time");
    await expect(time).toBeAttached();
    const text = await time.innerText();
    const startWithCurrentTime = text.startsWith("Current Time: ");
    expect(startWithCurrentTime).toBe(true);
  });

  test("test time is updating", async ({ page }) => {
    let last = "";
    for (let i = 0; i < 3; i++) {
      const current = await time.innerText();
      expect(current).not.toBe(last);
      last = current;
      await page.waitForTimeout(1000);
    }
  });
});
