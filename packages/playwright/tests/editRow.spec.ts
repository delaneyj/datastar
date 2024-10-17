import { test, expect } from "@playwright/test";

test.describe("Edit Row UI Suite", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/edit_row");
    await expect(page.locator("#edit-row")).toContainText("Edit Row");
    await page.getByTestId("reset").click();
  });

  test("test initial state", async ({ page }) => {
    // 1
    await expect(page.locator("#contact_0")).toContainText("Joe Smith");
    await expect(page.locator("#contact_0")).toContainText("joe@smith.org");
    await expect(page.getByTestId("contact_0_edit")).toBeAttached();
    // 2
    await expect(page.locator("#contact_1")).toContainText("Angie MacDowell");
    await expect(page.locator("#contact_1")).toContainText(
      "angie@macdowell.org"
    );
    await expect(page.getByTestId("contact_1_edit")).toBeAttached();
    // 3
    await expect(page.locator("#contact_2")).toContainText("Fuqua Tarkenton");
    await expect(page.locator("#contact_2")).toContainText(
      "fuqua@tarkenton.org"
    );
    await expect(page.getByTestId("contact_2_edit")).toBeAttached();
    // 4
    await expect(page.locator("#contact_3")).toContainText("Kim Yee");
    await expect(page.locator("#contact_3")).toContainText("kim@yee.org");
    await expect(page.getByTestId("contact_3_edit")).toBeAttached();
  });

  test("test edit and save row", async ({ page }) => {
    await page.getByTestId("contact_0_edit").click();
    await page.getByTestId("contact_0_name").fill("Foo Fighter");
    await page.getByTestId("contact_0_email").fill("foo@fighter.org");
    await page.getByTestId("contact_0_save").click();
    await expect(page.locator("#contact_0")).toContainText("Foo Fighter");
    await expect(page.locator("#contact_0")).toContainText("foo@fighter.org");
    await expect(page.getByTestId("contact_0_edit")).toBeAttached();
  });

  test("test edit and cancel row", async ({ page }) => {
    await page.getByTestId("contact_0_edit").click();
    await page.getByTestId("contact_0_name").fill("Foo Fighter");
    await page.getByTestId("contact_0_email").fill("foo@fighter.org");
    await page.getByTestId("contact_0_cancel").click();
    await expect(page.locator("#contact_0")).toContainText("Joe Smith");
    await expect(page.locator("#contact_0")).toContainText("joe@smith.org");
    await expect(page.getByTestId("contact_0_edit")).toBeAttached();
  });
});
