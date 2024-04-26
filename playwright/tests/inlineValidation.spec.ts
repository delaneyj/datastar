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
      "First name must be at least 8 characters."
    );
    await expect(page.getByTestId("validation_lastName")).toHaveText(
      "Last name must be at least 8 characters."
    );
    //
    await expect(page.getByTestId("submit_button")).toBeAttached();
  });

  test.fixme("test valid input", async ({ page }) => {
    await page.getByTestId("input_email").fill("test@test.com");
    await expect(page.getByTestId("input_email")).toHaveValue("test@test.com");
    await expect(page.locator("div#inline_validation")).not.toContainText(
      "Email '' is already taken or is invalid. Please enter another email.",
      { timeout: 10000 }
    );

    // await page.getByTestId("input_firstName").fill("foofighter");
    // await page.getByTestId("input_lastName").fill("metallica");
    // await page.getByTestId("submit_button").click();
    // await expect(page.getByTestId("input_email")).toHaveValue("test@test.com");
    // await expect(page.getByTestId("input_firstName")).toHaveValue("foofighter");
    // await expect(page.getByTestId("input_lastName")).toHaveValue("metallica");
    // await expect(page.getByTestId("validation_email")).not.toBeAttached();
    // //
  });
});
