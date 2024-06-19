import { test, expect } from "@playwright/test";

test.describe("Bulk Update UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/bulk_update");
    await expect(page.locator("#bulk-update")).toContainText("Bulk Update");
  });

  test("test initial state", async ({ page }) => {
    await expect(page.locator("#contact_0")).toContainText("Joe Smith");
    await expect(page.locator("#contact_0")).toContainText("joe@smith.org");
    await expect(page.locator("#contact_0")).toBeAttached();
    await expect(page.locator("#contact_1")).toContainText("Angie MacDowell");
    await expect(page.locator("#contact_1")).toContainText(
      "angie@macdowell.org"
    );
    await expect(page.locator("#contact_1")).toBeAttached();
    await expect(page.locator("#contact_2")).toContainText("Fuqua Tarkenton");
    await expect(page.locator("#contact_2")).toContainText(
      "fuqua@tarkenton.org"
    );
    await expect(page.locator("#contact_2")).toBeAttached();
    await expect(page.locator("#contact_3")).toContainText("Kim Yee");
    await expect(page.locator("#contact_3")).toContainText("kim@yee.org");
    await expect(page.locator("#contact_3")).toBeAttached();
  });

  test("test individual activate", async ({ page }) => {
    await page
      .getByRole("row", { name: "Joe Smith joe@smith.org" })
      .getByRole("cell")
      .first()
      .click();
    await page.getByRole("button", { name: "Activate", exact: true }).click();
    await expect(page.locator("#contact_0")).toContainText("Active");
    await page
      .getByRole("row", { name: "Angie MacDowell angie@macdowell.org" })
      .getByRole("cell")
      .first()
      .click();
    await page.getByRole("button", { name: "Activate", exact: true }).click();
    await expect(page.locator("#contact_1")).toContainText("Active");
  });

  test("test individual deactivate", async ({ page }) => {
    await page
      .getByRole("row", { name: "Joe Smith joe@smith.org" })
      .getByRole("cell")
      .first()
      .click();
    await page.getByRole("button", { name: "Deactivate" }).click();
    await expect(page.locator("#contact_0")).toContainText("Inactive");
    await page
      .getByRole("row", { name: "Angie MacDowell angie@macdowell.org" })
      .getByRole("cell")
      .first()
      .click();
    await page.getByRole("button", { name: "Deactivate", exact: true }).click();
    await expect(page.locator("#contact_1")).toContainText("Inactive");
  });

  test("test bulk activate", async ({ page }) => {
    await page
      .getByRole("row", { name: "Name Email Status" })
      .getByRole("cell")
      .first()
      .click();
    await page.getByRole("button", { name: "Activate", exact: true }).click();
    await expect(page.locator("#contact_0")).toContainText("Active");
    await expect(page.locator("#contact_1")).toContainText("Active");
    await expect(page.locator("#contact_2")).toContainText("Active");
    await expect(page.locator("#contact_3")).toContainText("Active");
  });

  test("test bulk deactivate", async ({ page }) => {
    await page
      .getByRole("row", { name: "Name Email Status" })
      .getByRole("cell")
      .first()
      .click();
    await page.getByRole("button", { name: "Deactivate", exact: true }).click();
    await expect(page.locator("#contact_0")).toContainText("Inactive");
    await expect(page.locator("#contact_1")).toContainText("Inactive");
    await expect(page.locator("#contact_2")).toContainText("Inactive");
    await expect(page.locator("#contact_3")).toContainText("Inactive");
  });
});
