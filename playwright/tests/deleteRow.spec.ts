import { test, expect } from "@playwright/test";

test.describe("Delete Row", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/delete_row");
    await page.getByRole("button", { name: "Reset" }).click();
  });

  test("test heading", async ({ page }) => {
    await expect(page.locator("#delete-row")).toContainText("Delete Row");
  });

  test("test initial state", async ({ page }) => {
    // 1st Row.
    await expect(page.locator("#contact_0 > td:first-child")).toContainText(
      "Joe Smith"
    );
    await expect(page.locator("#contact_0 > td:nth-child(2)")).toContainText(
      "joe@smith.org"
    );
    await expect(page.locator("#contact_0 > td:nth-child(3)")).toContainText(
      "Active"
    );
    await expect(
      page.locator("#contact_0 > td:nth-child(4) > button")
    ).toHaveCount(1);

    // 2nd Row
    await expect(page.locator("#contact_1 > td:first-child")).toContainText(
      "Angie MacDowell"
    );
    await expect(page.locator("#contact_1 > td:nth-child(2)")).toContainText(
      "angie@macdowell.org"
    );
    await expect(page.locator("#contact_1 > td:nth-child(3)")).toContainText(
      "Active"
    );
    await expect(
      page.locator("#contact_1 > td:nth-child(4) > button")
    ).toHaveCount(1);

    // 3rd Row
    await expect(page.locator("#contact_2 > td:first-child")).toContainText(
      "Fuqua Tarkenton"
    );
    await expect(page.locator("#contact_2 > td:nth-child(2)")).toContainText(
      "fuqua@tarkenton.org"
    );
    await expect(page.locator("#contact_2 > td:nth-child(3)")).toContainText(
      "Active"
    );
    await expect(
      page.locator("#contact_2 > td:nth-child(4) > button")
    ).toHaveCount(1);

    // 4th Row
    await expect(page.locator("#contact_3 > td:first-child")).toContainText(
      "Kim Yee"
    );
    await expect(page.locator("#contact_3 > td:nth-child(2)")).toContainText(
      "kim@yee.org"
    );
    await expect(page.locator("#contact_3 > td:nth-child(3)")).toContainText(
      "Inactive"
    );
    await expect(
      page.locator("#contact_3 > td:nth-child(4) > button")
    ).toHaveCount(1);
  });

  test("test deleting row", async ({ page }) => {
    // 1st Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_0")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_0")).not.toBeAttached();
    // 2nd Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_1")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_1")).not.toBeAttached();
    // 3rd Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_2")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_2")).not.toBeAttached();
    // 4th Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_3")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_3")).not.toBeAttached();
  });
});
