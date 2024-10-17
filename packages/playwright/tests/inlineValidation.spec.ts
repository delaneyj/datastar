import { test, expect } from "@playwright/test";

test.describe("Inline Validation UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/inline_validation");
    await expect(page.locator("#inline-validation")).toContainText(
      "Inline Validation"
    );
  });

  test("test initial state", async ({ page }) => {
    await expect(page.locator("#inline_validation")).toContainText(
      "Email Address"
    );
    await expect(page.locator("#inline_validation")).toContainText(
      "First Name"
    );
    await expect(page.locator("#inline_validation")).toContainText("Last Name");
    //
    await expect(page.getByTestId("validation_email")).toHaveText(
      "Email '' is already taken or is invalid. Please enter another email."
    );
    await expect(page.getByTestId("validation_firstName")).toHaveText(
      "First name must be at least 2 characters."
    );
    await expect(page.getByTestId("validation_lastName")).toHaveText(
      "Last name must be at least 2 characters."
    );
    //
    await expect(page.getByTestId("submit_button")).toBeAttached();
  });

  test("test inline validation email", async ({ page }) => {
    await page.getByTestId("input_email").type("test@test.com");
    await expect(page.getByTestId("input_email")).toHaveValue("test@test.com");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "Email '' is already taken or is invalid. Please enter another email.",
    );
    await page.getByTestId("input_email").fill("");
    await page.getByTestId("input_email").type("test");
    await expect(page.getByTestId("input_email")).toHaveValue("test");
    await expect(page.locator("div#inline_validation")).toContainText(
      "Email 'test' is already taken or is invalid. Please enter another email.",
    );
  });

  test("test inline validation first name", async ({ page }) => {
    await page.getByTestId("input_firstName").type("Alexander");
    await expect(page.getByTestId("input_firstName")).toHaveValue("Alexander");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "First name must be at least 2 characters.",
    );
    await page.getByTestId("input_firstName").fill("");
    await page.getByTestId("input_firstName").type("t");
    await expect(page.getByTestId("input_firstName")).toHaveValue("t");
    await expect(page.locator("div#inline_validation")).toContainText(
      "First name must be at least 2 characters.",
    );
  });

  test("test inline validation last name", async ({ page }) => {
    await page.getByTestId("input_lastName").type("Alexander");
    await expect(page.getByTestId("input_lastName")).toHaveValue("Alexander");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "Last name must be at least 2 characters.",
    );
    await page.getByTestId("input_lastName").fill("");
    await page.getByTestId("input_lastName").type("test");
    await expect(page.getByTestId("input_lastName")).toHaveValue("test");
    await expect(page.locator("div#inline_validation")).toContainText(
      "First name must be at least 2 characters.",
    );
  });

  test("test inline validation success", async ({ page }) => {
    await page.getByTestId("input_email").type("test@test.com");
    await expect(page.getByTestId("input_email")).toHaveValue("test@test.com");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "Email '' is already taken or is invalid. Please enter another email.",
    );
    //
    await page.getByTestId("input_firstName").type("Alexander");
    await expect(page.getByTestId("input_firstName")).toHaveValue("Alexander");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "First name must be at least 2 characters.",
    );
    //
    await page.getByTestId("input_lastName").type("Alexander");
    await expect(page.getByTestId("input_lastName")).toHaveValue("Alexander");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "Last name must be at least 2 characters.",
    );
    await page.getByTestId('submit_button').click();
    await expect(page.locator('#inline_validation')).toContainText('Thank you for signing up!');
  });
});
