import { expect, test } from "@playwright/test";

test.describe("Todos UI Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:8080/");
    await expect(page.getByRole("heading", { name: "todos" })).toContainText(
      "todos"
    );
    await page.getByTestId("reset_todos").click();
  });

  test("test initial state", async ({ page }) => {
    await expect(page.getByPlaceholder("What needs to be done?")).toBeEmpty();
    await expect(page.getByTestId("toggle_all_todos")).toBeAttached();
    await expect(page.locator("#todo0")).toContainText(
      "Learn any backend language"
    );
    await expect(page.locator("#todo1")).toContainText("Learn Datastar");
    await expect(page.locator("#todo2")).toContainText("???");
    await expect(page.locator("#todo3")).toContainText("Profit");
    await expect(page.getByTestId("todo_count")).toContainText("3 items");
    await expect(page.getByTestId("All_mode")).toBeAttached();
    await expect(page.getByTestId("Active_mode")).toBeAttached();
    await expect(page.getByTestId("Completed_mode")).toBeAttached();
  });

  test("test todos modes", async ({ page }) => {
    const all = page.getByTestId("All_mode");
    const active = page.getByTestId("Active_mode");
    const completed = page.getByTestId("Completed_mode");

    const todo0 = page.locator("#todo0");
    const todo1 = page.locator("#todo1");
    const todo2 = page.locator("#todo2");
    const todo3 = page.locator("#todo3");

    await active.click();
    await expect(todo0).not.toBeAttached();
    await expect(todo1).toContainText("Learn Datastar");
    await expect(todo2).toContainText("???");
    await expect(todo3).toContainText("Profit");
    await completed.click();
    await expect(todo0).toContainText("Learn any backend language");
    await expect(todo1).not.toBeAttached();
    await expect(todo2).not.toBeAttached();
    await expect(todo3).not.toBeAttached();
    await all.click();
    await expect(todo0).toContainText("Learn any backend language");
    await expect(todo1).toContainText("Learn Datastar");
    await expect(todo2).toContainText("???");
    await expect(todo3).toContainText("Profit");
  });

  test("test todos add", async ({ page }) => {
    const input = page.getByTestId("todos_input");
    await input.click();
    await input.fill("test");
    await input.press("Enter");
    await expect(page.locator("#todo4")).toContainText("test");
    await expect(page.getByTestId("todo_count")).toContainText("4 items");
  });

  test("test todos delete", async ({ page }) => {
    await page.locator("#todo2").hover();
    const todo = page.getByTestId("delete_todo2");
    await expect(todo).toBeVisible();
    await todo.click();
    await expect(page.getByTestId("todo_count")).toContainText("2 items");
    const todosList = page.getByTestId("todos_list");
    const liElements = await todosList.locator("li").all();
    expect(liElements.length).toBe(3);
  });

  test("test todos clear", async ({ page }) => {
    await page.getByTestId("clear_todos").click();
    await expect(page.locator("#todo0")).toContainText("Learn Datastar");
    await expect(page.getByTestId("todo_count")).toContainText("3 items");
    const todosList = page.getByTestId("todos_list");
    const liElements = await todosList.locator("li").all();
    expect(liElements.length).toBe(3);
  });

  test("test todos toggle all", async ({ page }) => {
    await page.getByTestId("toggle_all_todos").click();
    await page.getByTestId("clear_todos").click();
    await expect(page.getByTestId("todos_list")).not.toBeAttached();
    await expect(page.getByTestId("todo_count")).not.toBeAttached();
  });
});
