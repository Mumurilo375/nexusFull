import { test, expect } from "@playwright/test";
//Login caso de sucesso
test("has title", async ({ page }) => {
  await page.goto("https://nexus.store/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nexus/);
});

test("Entrar link", async ({ page }) => {
  await page.goto("https://nexus.store/");

  await page.getByRole("link", { name: "Entrar" }).click();

  await page.waitForURL("https://nexus.store/login");

  await expect(page).toHaveURL("https://nexus.store/login");
});

test("Login com sucesso", async ({ page }) => {
  await page.goto("https://nexus.store/login");

  // colocar senha e email
  await page.fill('input[name="email"]', "izaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac123!");

  // Clicar no botao
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL("https://nexus.store/");

  await expect(page.getByRole("button", { name: /izaac/i })).toBeVisible();
});

//login caso de falha

test("Login com falha", async ({ page }) => {
  await page.goto("https://nexus.store/login");

  // colocar senha e email
  await page.fill('input[name="email"]', "isaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac12!");

  // Clicar no botao
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Email ou senha incorretos.")).toBeVisible();
});
