import { test, expect } from "@playwright/test";
//Login caso de sucesso
test("has title", async ({ page }) => {
  await page.goto("http://localhost:8081/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nexus/);
});

test("Entrar link", async ({ page }) => {
  await page.goto("http://localhost:8081/");

  await page.getByRole("link", { name: "Entrar" }).click();

  await page.waitForURL("http://localhost:8081/login");

  await expect(page).toHaveURL("http://localhost:8081/login");
});

test("Login com sucesso", async ({ page }) => {
  await page.goto("http://localhost:8081/login");

  // colocar senha e email
  await page.fill('input[name="email"]', "izaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac123!");

  // Clicar no botao
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL("http://localhost:8081/");

  await expect(page.getByRole("button", { name: /izaac/i })).toBeVisible();
});

//login caso de falha

test("Login com falha", async ({ page }) => {
  await page.goto("http://localhost:8081/login");

  // colocar senha e email
  await page.fill('input[name="email"]', "isaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac12!");

  // Clicar no botao
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Email ou senha incorretos.")).toBeVisible();
});

//Cadastro caso de sucesso, antes  de criar garanta que  o usuario não exista no banco 
test("Cadastro com sucesso", async ({ page }) => {
  await page.goto("http://localhost:8081/login");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await page.waitForURL("http://localhost:8081/cadastro");

  await expect(page).toHaveURL("http://localhost:8081/cadastro");

  await page.fill('input[name="registerUsername"]', "Douglas");
  await page.fill('input[name="email"]', "douglas@gmail.com");
  await page.fill('input[name="new-password"]', "Douglas123!");
  await page.fill('input[name="new-password-confirm"]', "Douglas123!");
  await page.fill('input[name="registerFullName"]', "Douglas americano");
  await page.fill('input[name="cpf"]', "76563844561");
  

  await page.getByRole("button", { name: "Criar conta" }).click();
   await expect(page).toHaveURL("http://localhost:8081/login");

   //logando na conta criada
   await page.fill('input[name="email"]', "douglas@gmail.com");
  await page.fill('input[name="password"]', "Douglas123!");

  await page.getByRole("button", { name: "Entrar" }).click();
   await expect(page).toHaveURL("http://localhost:8081/");

  await expect(page.getByRole("button", { name: /douglas/i })).toBeVisible();

});


//cadastro usario falha
test("Cadastro com falha", async ({ page }) => {
  await page.goto("http://localhost:8081/login");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await page.waitForURL("http://localhost:8081/cadastro");

  await expect(page).toHaveURL("http://localhost:8081/cadastro");

  await page.fill('input[name="registerUsername"]', "Douglas");
  await page.fill('input[name="email"]', "douglas@gmail.com");
  await page.fill('input[name="new-password"]', "Douglas123!");
  await page.fill('input[name="new-password-confirm"]', "Douglas123!");
  await page.fill('input[name="registerFullName"]', "Douglas americano");
  await page.fill('input[name="cpf"]', "76563844561");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("Este email já está em uso.")).toBeVisible();
  await page.getByRole("button", { name: "Voltar" }).click();
  await page.waitForURL("http://localhost:8081/login");

  await expect(page).toHaveURL("http://localhost:8081/login");
});