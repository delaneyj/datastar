import { test, expect } from "@playwright/test";

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
    await expect(page.locator("#click_to_load_rows tr")).toHaveCount(10);
    // 1
    await page
      .getByRole("link", { name: "Next Active Search" })
      .scrollIntoViewIfNeeded();
    await expect(page.getByTestId("loading_message")).toContainText(
      "Loading..."
    );
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
    // 2
    await page
      .getByRole("link", { name: "Next Active Search" })
      .scrollIntoViewIfNeeded();
    await expect(page.getByTestId("loading_message")).toContainText(
      "Loading..."
    );
    await expect(page.locator("#click_to_load_rows tr")).toHaveCount(30);
    await expect(page.locator("#agent_29 > td:first-child")).toContainText(
      "Agent Smith"
    );
    await expect(page.locator("#agent_29 > td:nth-child(2)")).toContainText(
      "void30@null.or"
    );
    await expect(page.locator("#agent_20 > td:nth-child(3)")).toBeAttached();
  });
});
