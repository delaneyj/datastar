import { expect, test } from "@playwright/test";

test.describe("Fetch Indicator Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/fetch_indicator");
    await expect(page.locator("#fetch-indicator")).toContainText(
      "Fetch Indicator"
    );
  });

  test("test fetch indicator", async ({ page }) => {
    const ind = await page.locator("#ind");
    const greeting = await page.locator("#greeting");

    await page.getByTestId("greeting_button").click();
    await expect(ind).toBeVisible();
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText("Hello, the time is");
  });

  // Had multiple bugs that could only be detected when run twice
  test("test second run of fetch indicator ", async ({ page }) => {
    const ind = await page.locator("#ind");
    const greeting = await page.locator("#greeting");
    const greetingButton = await page.getByTestId("greeting_button");

    await greetingButton.click();
    await expect(ind).toBeVisible();
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText("Hello, the time is");
    await greetingButton.click();
    await expect(ind).toBeVisible();
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText("Hello, the time is");
  });

  test("test isFetching", async ({ page }) => {
    const greeting = await page.locator("#greeting");
    const greetingButton = await page.getByTestId("greeting_button");

    await greetingButton.click();
    await expect(greetingButton).toBeDisabled();
    await expect(greeting).toBeVisible();
    await expect(greeting).toContainText("Hello, the time is");
    await expect(greetingButton).toBeEnabled();
  });
});
