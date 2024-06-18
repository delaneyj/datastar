import { expect, test } from "@playwright/test";

test.describe("Home Page UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await expect(page.locator("body")).toContainText(
      "Example of a dynamically loaded area of page with shared global state"
    );
  });

  test("test local count increment", async ({ page }) => {
    let datastar = await page.evaluate(() => ds);
    expect(datastar).not.toBeFalsy();
    let localCountInitial = datastar.store["count"]._value;

    await page.getByText("Increment Local +").click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("localcount_input")).toHaveValue(
      `${localCountInitial + 1}`
    );
  });

  test("test local count decrement", async ({ page }) => {
    let datastar = await page.evaluate(() => ds);
    expect(datastar).not.toBeFalsy();
    let localCountInitial = datastar.store["count"]._value;

    await page.getByText("Decrement Local -").click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("localcount_input")).toHaveValue(
      `${localCountInitial - 1}`
    );
  });

  test("test global count store/load", async ({ page }) => {
    let datastar = await page.evaluate(() => ds);
    expect(datastar).not.toBeFalsy();
    let globalCountInitial = datastar.store["count"]._value;

    await page.getByText("Store global").click();
    await page.getByText("Decrement Local -").click({ clickCount: 5 });
    await page.getByText("Load global").click();
    await page.waitForTimeout(1000);
    await expect(page.getByTestId("localcount_input")).toHaveValue(
      `${globalCountInitial}`
    );
  });
});
