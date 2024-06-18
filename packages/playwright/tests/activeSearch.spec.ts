import { test, expect } from "@playwright/test";

const nameReg = new RegExp("^[A-Za-z]+$");
const emailReg = new RegExp("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$");
const scoreReg = /^\d+\.\d{2}$/;

test.describe("Active Search UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/active_search");
    await expect(page.locator("#active-search")).toContainText("Active Search");
  });

  test("test initial state", async ({ page }) => {
    await expect(page.getByPlaceholder("Search...")).toBeAttached();
    await expect(page.getByPlaceholder("Search...")).toBeEmpty();
    await expect(page.locator("#active_search_rows tr")).toHaveCount(10);
    await expect(
      page.locator("#active_search_rows tr:first-child > td:first-child")
    ).toContainText(nameReg);
    await expect(
      page.locator("#active_search_rows tr:first-child > td:nth-child(2)")
    ).toContainText(nameReg);
    await expect(
      page.locator("#active_search_rows tr:first-child > td:nth-child(3)")
    ).toContainText(emailReg);
    await expect(
      page.locator("#active_search_rows tr:first-child > td:nth-child(4)")
    ).toContainText(scoreReg);
  });

  test("test active search with email", async ({ page }) => {
    const firstName =
      (await page
        .locator("#active_search_rows tr:nth-child(5) > td:first-child")
        .textContent()) ?? "";
    const lastName =
      (await page
        .locator("#active_search_rows tr:nth-child(5) > td:nth-child(2)")
        .textContent()) ?? "";
    const email =
      (await page
        .locator("#active_search_rows tr:nth-child(5) > td:nth-child(3)")
        .textContent()) ?? "";

    expect(firstName).not.toBeFalsy();
    expect(lastName).not.toBeFalsy();
    expect(email).not.toBeFalsy();

    // Fill in the search field, assuming the placeholder is correctly identified
    await page.locator('input[placeholder="Search..."]').fill(email);

    // Expectations to ensure that text contains specific content
    await expect(
      page.locator("#active_search_rows tr:first-child > td:first-child")
    ).toContainText(firstName);
    await expect(
      page.locator("#active_search_rows tr:first-child > td:nth-child(2)")
    ).toContainText(lastName);
    await expect(
      page.locator("#active_search_rows tr:first-child > td:nth-child(3)")
    ).toContainText(email);
  });
});
