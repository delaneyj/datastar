import { test, expect } from "@playwright/test";

test.describe("Delete Row", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/delete_row");
    await expect(page.locator("#delete-row")).toContainText("Delete Row");
    await page.getByRole("button", { name: "Reset" }).click();
  });

  test("test initial state", async ({ page }) => {
    // 1
    await expect(
      page.locator("#contact_1").getByRole("cell", { name: "Joe Smith" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_1").getByRole("cell", { name: "joe@smith.org" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_1").getByRole("cell", { name: "Active" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_1").getByRole("cell", { name: "Delete" })
    ).toBeAttached();
    // 2
    await expect(
      page.locator("#contact_2").getByRole("cell", { name: "Angie MacDowell" })
    ).toBeAttached();
    await expect(
      page
        .locator("#contact_2")
        .getByRole("cell", { name: "angie@macdowell.org" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_2").getByRole("cell", { name: "Active" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_2").getByRole("cell", { name: "Delete" })
    ).toBeAttached();
    // 3
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "Fuqua Tarkenton" })
    ).toBeAttached();
    await expect(
      page
        .locator("#contact_3")
        .getByRole("cell", { name: "fuqua@tarkenton.org" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "Active" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "Delete" })
    ).toBeAttached();
    // 4
    await expect(
      page.locator("#contact_4").getByRole("cell", { name: "Kim Yee" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_4").getByRole("cell", { name: "kim@yee.org" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_4").getByRole("cell", { name: "Active" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_4").getByRole("cell", { name: "Delete" })
    ).toBeAttached();
  });

  test("test deleting row", async ({ page }) => {
    // 1st Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_1")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_1")).not.toBeAttached();
    // 2nd Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_2")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_2")).not.toBeAttached();
    // 3rd Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_3")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_3")).not.toBeAttached();
    // 4th Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    await page
      .locator("#contact_4")
      .getByRole("cell", { name: "Delete" })
      .click();
    await expect(page.locator("#contact_4")).not.toBeAttached();
  });
});
