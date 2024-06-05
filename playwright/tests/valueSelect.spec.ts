import { expect, test } from "@playwright/test";

test.describe("Value Select UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/value_select");
    await expect(page.locator("#cascading-selects")).toContainText(
      "Cascading Selects"
    );
  });

  test("test initial state", async ({ page }) => {
    await expect(page.getByTestId("make_select")).toBeAttached();
    await expect(page.getByTestId("make_select")).toContainText(
      "Select a Make"
    );
    await expect(page.getByTestId("model_select")).not.toBeAttached();
  });

  test("test value select first select", async ({ page }) => {
    // get audi value
    const selectionAudi =
      (await page.getByTestId("make_option_Audi").getAttribute("value")) ?? "";
    expect(selectionAudi).not.toBeFalsy();
    // get toyota value
    const selectionToyota =
      (await page.getByTestId("make_option_Toyota").getAttribute("value")) ??
      "";
    expect(selectionAudi).not.toBeFalsy();
    // get ford value
    const selectionFord =
      (await page.getByTestId("make_option_Ford").getAttribute("value")) ?? "";
    expect(selectionAudi).not.toBeFalsy();

    // set select to audi value
    await page.getByTestId("make_select").selectOption(selectionAudi);
    await expect(page.getByTestId("make_select")).toContainText("Audi");
    await expect(page.getByTestId("make_select")).toHaveValue(selectionAudi);
    await expect(page.getByTestId("model_select")).toBeAttached();

    // set select to toyota value
    await page.getByTestId("make_select").selectOption(selectionToyota);
    await expect(page.getByTestId("make_select")).toContainText("Toyota");
    await expect(page.getByTestId("make_select")).toHaveValue(selectionToyota);
    await expect(page.getByTestId("model_select")).toBeAttached();

    // set select to ford value
    await page.getByTestId("make_select").selectOption(selectionFord);
    await expect(page.getByTestId("make_select")).toContainText("Ford");
    await expect(page.getByTestId("make_select")).toHaveValue(selectionFord);
    await expect(page.getByTestId("model_select")).toBeAttached();
  });

  test("test value select second select", async ({ page }) => {
    // get audi value
    const selectionAudi =
      (await page.getByTestId("make_option_Audi").getAttribute("value")) ?? "";
    // set select to audi value
    await page.getByTestId("make_select").selectOption(selectionAudi);
    await expect(page.getByTestId("model_select")).toBeAttached();

    // Get model select values
    const selectionA1 =
      (await page.getByTestId("model_option_A1").getAttribute("value")) ?? "";
    expect(selectionA1).not.toBeFalsy();
    const selectionA3 =
      (await page.getByTestId("model_option_A3").getAttribute("value")) ?? "";
    expect(selectionA3).not.toBeFalsy();
    const selectionA6 =
      (await page.getByTestId("model_option_A6").getAttribute("value")) ?? "";
    expect(selectionA6).not.toBeFalsy();

    await page.getByTestId("model_select").selectOption(selectionA1);
    await expect(page.getByTestId("model_select")).toContainText("A1");
    await expect(page.getByTestId("model_select")).toHaveValue(selectionA1);
    await expect(page.getByTestId("select_button")).toBeAttached();

    await page.getByTestId("model_select").selectOption(selectionA3);
    await expect(page.getByTestId("model_select")).toContainText("A3");
    await expect(page.getByTestId("model_select")).toHaveValue(selectionA3);
    await expect(page.getByTestId("select_button")).toBeAttached();

    await page.getByTestId("model_select").selectOption(selectionA6);
    await expect(page.getByTestId("model_select")).toContainText("A6");
    await expect(page.getByTestId("model_select")).toHaveValue(selectionA6);
    await expect(page.getByTestId("select_button")).toBeAttached();
  });

  test("test value select", async ({ page }) => {
    const selectionToyota =
      (await page.getByTestId("make_option_Toyota").getAttribute("value")) ??
      "";
    await page.getByTestId("make_select").selectOption(selectionToyota);
    expect(selectionToyota).not.toBeFalsy();

    // Get model select values
    const selectionCorolla =
      (await page.getByTestId("model_option_Corolla").getAttribute("value")) ??
      "";
    expect(selectionCorolla).not.toBeFalsy();

    // select values
    await page.getByTestId("model_select").selectOption(selectionCorolla);
    await expect(page.getByTestId("select_button")).toBeAttached();
    await Promise.all(
      ["Submit selected", "Toyota", "Corolla"].map((text) =>
        expect(page.locator("#value_select")).toContainText(text)
      )
    );

    await page.getByTestId("select_button").click();
    // clicked submit
    await expect(page.getByTestId("select_button")).not.toBeAttached();
    await Promise.all(
      ["You selected", "Toyota", "Corolla"].map((text) =>
        expect(page.locator("#value_select")).toContainText(text)
      )
    );
    await expect(
      page.getByRole("button", { name: "Resest form" })
    ).toBeAttached();
    await page.getByRole("button", { name: "Resest form" }).click();

    // clicked reset
    await expect(page.getByTestId("select_button")).toBeAttached();
    await expect(
      page.getByRole("button", { name: "Resest form" })
    ).not.toBeAttached();
  });
});
