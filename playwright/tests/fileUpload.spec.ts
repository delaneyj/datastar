import { expect, test } from "@playwright/test";
import path from "path";

test.describe("File Upload UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/examples/file_upload");
    await expect(page.locator("#file-upload")).toContainText("File Upload");
  });

  test("test initial state", async ({ page }) => {
    await expect(page.locator("label")).toContainText(
      "Pick anything reasonably sized"
    );
    await expect(page.getByRole("button", { name: "Submit" })).toBeAttached();
  });

  test("file upload test", async ({ page }) => {
    const basePath = process.cwd().includes("/playwright")
      ? process.cwd()
      : path.join(process.cwd(), "playwright");
    const relativePathToTestData = "tests/testdata/testfile.txt";
    const filePath = path.resolve(basePath, relativePathToTestData);
    const fileInput = await page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "visible" });
    await fileInput.setInputFiles(filePath);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("caption")).toContainText(
      "File Upload Results"
    );
    await expect(page.locator("#file_upload")).toContainText("File Name");
    await expect(page.locator("#file_upload")).toContainText("testfile.txt");
    await expect(page.locator("#file_upload")).toContainText("File Size");
    await expect(page.locator("#file_upload")).toContainText("4 B");
    await expect(page.locator("#file_upload")).toContainText("File Mime");
    await expect(page.locator("#file_upload")).toContainText("text/plain");
    await expect(page.locator("#file_upload")).toContainText("XXH3 Hash");
    await expect(page.locator("#file_upload")).toContainText(
      "a29dce2b64301dfe"
    );
  });

  test("multiple file upload test", async ({ page }) => {
    const basePath = process.cwd().includes("/playwright")
      ? process.cwd()
      : path.join(process.cwd(), "playwright");
    const testDataFolder = path.join(basePath, "tests/testdata");

    const filepaths = ["testfile.txt", "testfile2.txt"].map((filename) => {
      return path.resolve(testDataFolder, filename);
    });

    const fileInput = await page.locator('input[type="file"]');
    await fileInput.waitFor({ state: "visible" });
    await fileInput.setInputFiles(filepaths);

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByRole("caption")).toContainText(
      "File Upload Results"
    );
    await expect(page.locator("#file_upload")).toContainText("File Name");
    await expect(page.locator("#file_upload")).toContainText(
      "testfile.txt, testfile2.txt"
    );
    await expect(page.locator("#file_upload")).toContainText("File Size");
    await expect(page.locator("#file_upload")).toContainText("4 B, 5 B");
    await expect(page.locator("#file_upload")).toContainText("File Mime");
    await expect(page.locator("#file_upload")).toContainText("text/plain");
    await expect(page.locator("#file_upload")).toContainText("XXH3 Hash");
    await expect(page.locator("#file_upload")).toContainText(
      "a29dce2b64301dfe, cccc15fddee24c90"
    );
  });
});
