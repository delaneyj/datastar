import { test, expect } from "@playwright/test";

test.describe("Lazy Tabs UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/lazy_tabs");
    await expect(page.locator("#lazy-tabs")).toContainText("Lazy Tabs");
  });

  test("test lazy tabs", async ({ page }) => {
    const selector = "#tab_content";

    let initialText = await page.textContent(selector);
    await page.getByTestId("tab_1").click();

    //
    await page.waitForFunction(
      ({ selector, initialText }) => {
        const element = document.querySelector(selector);
        return element && element.textContent !== initialText;
      },
      { selector, initialText }
    );
    let newText = await page.textContent(selector);

    expect(newText).not.toEqual(initialText);
  });
});
