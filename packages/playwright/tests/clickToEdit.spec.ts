import { test, expect } from "@playwright/test";

// Annotate entire file as serial. Weird actions on click to edit cancel if not.

test.describe("Click To Edit UI Suite", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/click_to_edit");
    await expect(page.locator("#click-to-edit")).toContainText("Click to Edit");
    await page.getByRole("button", { name: "Reset" }).click();
  });

  test("test initial state", async ({ page }) => {
    await expect(page.locator("#contact_1")).toContainText("First Name: John");
    await expect(
      page.getByText("First Name: John", { exact: true })
    ).toBeVisible();
    await expect(page.locator("#contact_1")).toContainText("Last Name: Doe");
    await expect(
      page.getByText("Last Name: Doe", { exact: true })
    ).toBeVisible();
    await expect(page.locator("#contact_1")).toContainText(
      "Email: joe@blow.com"
    );
    await expect(
      page.getByText("Email: joe@blow.com", { exact: true })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible();
  });

  test("test editing with clicking", async ({ page }) => {
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("First Name").click();
    await page.getByLabel("First Name").fill("Foo");
    await page.getByLabel("Last Name").click();
    await page.getByLabel("Last Name").fill("Fighter");
    await page.getByLabel("Email").click();
    await page.getByLabel("Email").fill("foo@fighter.com");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("#contact_1")).toContainText("First Name: Foo");
    await expect(page.locator("#contact_1")).toContainText(
      "Last Name: Fighter"
    );
    await expect(page.locator("#contact_1")).toContainText(
      "Email: foo@fighter.com"
    );
  });

  test("test editing and cancelling", async ({ page }) => {
    await page.getByRole("button", { name: "Edit" }).click();
    await page.getByLabel("First Name").click();
    await page.getByLabel("First Name").fill("Foo");
    await page.getByLabel("Last Name").click();
    await page.getByLabel("Last Name").fill("Fighter");
    await page.getByLabel("Email").click();
    await page.getByLabel("Email").fill("foo@fighter.com");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.locator("#contact_1")).toContainText("First Name: John");
    await page.getByText("Last Name: Doe", { exact: true }).click();
    await expect(page.locator("#contact_1")).toContainText("Last Name: Doe");
    await expect(page.locator("#contact_1")).toContainText(
      "Email: joe@blow.com"
    );
  });
});
