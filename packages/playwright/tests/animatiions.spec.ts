import { expect, test } from "@playwright/test";

test.describe("Animations UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/animations");
    await expect(page.locator("h1#animations")).toContainText("Animations");
  });

  test("test color throb", async ({ page }) => {
    const selector = "#color_throb";

    // can change number if needed for multiple animation changes
    for (let i = 0; i < 1; i++) {
      let initialText = await page.textContent(selector);
      //
      await page.waitForFunction(
        ({ selector, initialText }) => {
          const element = document.querySelector(selector);
          return element && element.textContent !== initialText;
        },
        { selector, initialText }
      );
      let newText = await page.textContent(selector);
      expect(initialText).not.toEqual(newText);
    }
  });

  test("test click and fade out", async ({ page }) => {
    const fadeButtonOut = page.getByRole("button", {
      name: "Fade out then delete on click",
    });
    await expect(fadeButtonOut).toBeAttached();
    fadeButtonOut.click();
    await expect(fadeButtonOut).not.toBeAttached();
  });

  test("test click and fade in", async ({ page }) => {
    await page
      .getByRole("button", {
        name: "Fade me in on click",
      })
      .click();
    await expect(
      page.getByRole("button", {
        name: "Fade me in on click",
      })
    ).toHaveClass(/.*datastar-swapping.*datastar-settling.*/);
    await expect(
      page.getByRole("button", {
        name: "Fade me in on click",
      })
    ).not.toHaveClass(/.*datastar-swapping.*datastar-settling.*/);
  });

  test("test in flght indicator", async ({ page }) => {
    await expect(page.getByRole("textbox")).toBeEmpty();
    await page.getByRole("textbox").fill("test");
    //
    await expect(
      page.locator("div#request_in_flight_indicator")
    ).not.toHaveClass(/.*datastar-indicator-loading.*/);
    await expect(page.locator("div#request_in_flight")).not.toContainText(
      "Submitted!"
    );
    //
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.locator("div#request_in_flight_indicator")).toHaveClass(
      /.*datastar-indicator-loading.*/
    );
    //
    await expect(page.locator("#request_in_flight")).toContainText(
      "Submitted!"
    );
  });
});
