import { expect, test } from "@playwright/test";

test.describe("Delete Row UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/delete_row");
    await expect(page.locator("#delete-row")).toContainText("Delete Row");
    await page.getByRole("button", { name: "Reset" }).click();
  });

  test("test initial state", async ({ page }) => {
    let l = await page.locator("#contact_0");
    await expect(l.getByRole("cell", { name: "Joe Smith" })).toBeAttached();
    await expect(l.getByRole("cell", { name: "joe@smith.org" })).toBeAttached();
    await expect(l.getByRole("cell", { name: "Active" })).toBeAttached();
    await expect(l.getByRole("cell", { name: "Delete" })).toBeAttached();
    // 1
    l = await page.locator("#contact_1");
    await expect(
      l.getByRole("cell", { name: "Angie MacDowell" })
    ).toBeAttached();
    await expect(
      l.getByRole("cell", { name: "angie@macdowell.org" })
    ).toBeAttached();
    await expect(l.getByRole("cell", { name: "Active" })).toBeAttached();
    await expect(l.getByRole("cell", { name: "Delete" })).toBeAttached();

    l = await page.locator("#contact_2");
    await expect(
      l.getByRole("cell", { name: "Fuqua Tarkenton" })
    ).toBeAttached();
    await expect(
      l.getByRole("cell", { name: "fuqua@tarkenton.org" })
    ).toBeAttached();
    await expect(l.getByRole("cell", { name: "Active" })).toBeAttached();
    await expect(l.getByRole("cell", { name: "Delete" })).toBeAttached();
    // 3
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "Kim Yee" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "kim@yee.org" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "Active" })
    ).toBeAttached();
    await expect(
      page.locator("#contact_3").getByRole("cell", { name: "Delete" })
    ).toBeAttached();
  });

  test("test deleting row", async ({ page }) => {
    // 1st Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    let l = await page.locator("#contact_0");
    await l.getByRole("cell", { name: "Delete" }).click();
    await expect(l).not.toBeAttached();

    // 2nd Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    l = await page.locator("#contact_1");
    await l.getByRole("cell", { name: "Delete" }).click();
    await expect(l).not.toBeAttached();

    // 3rd Row.
    page.once("dialog", (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      dialog.accept().catch(() => {});
    });
    l = await page.locator("#contact_2");
    await l.getByRole("cell", { name: "Delete" }).click();
    await expect(l).not.toBeAttached();
  });
});
