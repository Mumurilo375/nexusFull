import { test, expect } from "@playwright/test";

//Cadastro caso de sucesso, antes  de criar garanta que  o usuario não exista no banco
test("Cadastro com sucesso", async ({ page }) => {
  await page.goto("https://nexus.store/login");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await page.waitForURL("https://nexus.store/cadastro");

  await expect(page).toHaveURL("https://nexus.store/cadastro");

  await page.fill('input[name="registerUsername"]', "Douglas");
  await page.fill('input[name="email"]', "douglas@gmail.com");
  await page.fill('input[name="new-password"]', "Douglas123!");
  await page.fill('input[name="new-password-confirm"]', "Douglas123!");
  await page.fill('input[name="registerFullName"]', "Douglas americano");
  await page.fill('input[name="cpf"]', "76563844561");

  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL("https://nexus.store/login");

  //logando na conta criada
  await page.fill('input[name="email"]', "douglas@gmail.com");
  await page.fill('input[name="password"]', "Douglas123!");

  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("https://nexus.store/");

  await expect(page.getByRole("button", { name: /douglas/i })).toBeVisible();
});

//cadastro usario falha
test("Cadastro com falha", async ({ page }) => {
  await page.goto("https://nexus.store/login");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await page.waitForURL("https://nexus.store/cadastro");

  await expect(page).toHaveURL("https://nexus.store/cadastro");

  await page.fill('input[name="registerUsername"]', "Douglas");
  await page.fill('input[name="email"]', "douglas@gmail.com");
  await page.fill('input[name="new-password"]', "Douglas123!");
  await page.fill('input[name="new-password-confirm"]', "Douglas123!");
  await page.fill('input[name="registerFullName"]', "Douglas americano");
  await page.fill('input[name="cpf"]', "76563844561");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("Este email já está em uso.")).toBeVisible();
  await page.getByRole("button", { name: "Voltar" }).click();
  await page.waitForURL("https://nexus.store/login");

  await expect(page).toHaveURL("https://nexus.store/login");
});
