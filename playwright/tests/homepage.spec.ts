import { test, expect } from "@playwright/test";

test.describe("Home Page UI Suite", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("http://localhost:8080/");
        await expect(page.locator('body')).toContainText('Example of a dynamically loaded area of page with shared global state');
    });

    test("test global count increment", async ({ page }) => {
        let datastar = await page.evaluate(() => ds);
        expect(datastar).not.toBeFalsy();
        let globalCountInitial = datastar.store["count"]._value;

        await page.getByText('Increment Global State +').click();
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('globalcount_input')).toHaveValue(`${globalCountInitial + 1}`);
    });

    test("test global count decrement", async ({ page }) => {
        let datastar = await page.evaluate(() => ds);
        expect(datastar).not.toBeFalsy();
        let globalCountInitial = datastar.store["count"]._value;

        await page.getByText('Decrement Global State -').click();
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('globalcount_input')).toHaveValue(`${globalCountInitial - 1}`);
    });

    test("test global count load", async ({ page }) => {
        let datastar = await page.evaluate(() => ds);
        expect(datastar).not.toBeFalsy();
        let globalCountInitial = datastar.store["count"]._value;

        await page.getByText('Store global count').click();
        await page.getByText('Decrement Global State -').click({ clickCount: 5});
        await page.getByText('Load global count').click();
        await page.waitForTimeout(1000);
        await expect(page.getByTestId('globalcount_input')).toHaveValue(`${globalCountInitial}`);
    });

});
