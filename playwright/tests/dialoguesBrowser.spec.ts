import { test, expect } from "@playwright/test";

test.describe("Dialogues Browser UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/dialogs_browser");
    await expect(page.locator('#demo')).toContainText('Demo');
  });

  test("test Dialogues Browser accept", async ({ page }) => {
    page.on("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept().catch(() => {});
      });
      await page.getByRole('button', { name: 'Click Me' }).click();
      await expect(page.locator('#dialogs')).toContainText('You clicked the button and confirmed with prompt of');
      await page.getByRole('button', { name: 'Reset' }).click();
      await expect(page.locator('#dialogs')).not.toContainText('You clicked the button and confirmed with prompt of');
  });
  
  test("test Dialogues Browser cancel", async ({ page }) => {
    page.once("dialog", (dialog) => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.dismiss().catch(() => {});
      });
      await page.getByRole('button', { name: 'Click Me' }).click();
      await expect(page.locator('#dialogs')).not.toContainText('You clicked the button and confirmed with prompt of');
  });

  
});
