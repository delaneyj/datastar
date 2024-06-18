import { test, expect } from "@playwright/test";

test.describe("Click To Load UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/click_to_load");
    await expect(page.locator("#click-to-load")).toContainText("Click to Load");
  });

  test("test initial state", async ({ page }) => {
    // Select all tr elements within the table with id 'click_to_load_rows'
    await expect(page.locator("#click_to_load_rows tr")).toHaveCount(10);
    await expect(page.locator("#agent_0 > td:first-child")).toContainText(
      "Agent Smith"
    );
    await expect(page.locator("#agent_0 > td:nth-child(2)")).toContainText(
      "void1@null.org"
    );
    await expect(page.locator("#agent_0 > td:nth-child(3)")).toBeAttached();
    await expect(page.locator("#agent_9 > td:first-child")).toContainText(
      "Agent Smith"
    );
    await expect(page.locator("#agent_9 > td:nth-child(2)")).toContainText(
      "void10@null.org"
    );
    await expect(page.locator("#agent_9 > td:nth-child(3)")).toBeAttached();
  });

  test("test clicking and loading", async ({ page }) => {
    await expect(page.locator("#click_to_load_rows tr")).toHaveCount(10);
    await page.getByRole("button", { name: "Load More" }).click();
    await expect(page.locator("#click_to_load_rows tr")).toHaveCount(20);
    await expect(page.locator("#agent_0> td:first-child")).toContainText(
      "Agent Smith"
    );
    await expect(page.locator("#agent_0 > td:nth-child(2)")).toContainText(
      "void1@null.org"
    );
    await expect(page.locator("#agent_0 > td:nth-child(3)")).toBeAttached();
    await expect(page.locator("#agent_10 > td:first-child")).toContainText(
      "Agent Smith"
    );
    await expect(page.locator("#agent_10 > td:nth-child(2)")).toContainText(
      "void11@null.org"
    );
    await expect(page.locator("#agent_10 > td:nth-child(3)")).toBeAttached();
    await expect(page.locator("#agent_19 > td:first-child")).toContainText(
      "Agent Smith"
    );
    await expect(page.locator("#agent_19 > td:nth-child(2)")).toContainText(
      "void20@null.or"
    );
    await expect(page.locator("#agent_19 > td:nth-child(3)")).toBeAttached();
  });
});
