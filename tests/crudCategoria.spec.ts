import { test, expect } from "@playwright/test";

//Criação de categoria com falha
test("Criação de categoria com falha", async ({ page }) => {
  await page.goto("https://nexus.store/login");
  await page.fill('input[name="email"]', "izaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("https://nexus.store/");
  await page.goto("https://nexus.store/admin/categories/");
  await page.goto("https://nexus.store/admin/categories/new");
  await page.waitForSelector("form");
  await page.fill('input[type="text"]', "Caça");
  await page.locator('button[type="submit"]').first().click();
  await expect(
    page.getByText(
      "Já existe uma categoria com esse nome.",
    ),
  )
  //cadastro com sucesso
  await page.fill('input[type="text"]', "Animais");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.goto("https://nexus.store/admin/categories");
  await expect(page).toHaveURL("https://nexus.store/admin/categories");
   await page.waitForTimeout(1500);
  await expect(page.getByRole("heading", { name: "Animais" }).first())
    .toBeVisible;

  //ediçaõ com falha
 //teste de commit bloqueado pelo husky

  await page.getByRole("link", { name: "Editar" }).first().click();
  await page.waitForSelector("form");
  await page.fill('input[type="text"]', "Caça");
  await page.locator('button[type="submit"]').first().click();
  await expect(
    page.getByText(
      "Já existe uma categoria com esse nome.",
    ),
  )
  //edição com sucesso
  await page.fill('input[type="text"]', "Animais editado");
   await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL("https://nexus.store/admin/categories");
    await expect(
    page.getByText(
      "Animais editado",
    ),
  )
    .toBeVisible();
  
  await page.waitForTimeout(1500);

  //exclusao com falha
  await page.getByRole("button", { name: "Excluir" }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Cancelar  " }).last().click();
  await page.waitForTimeout(1500);
  await expect(
    page.getByText(
      "Animais editado",
    ),
  )
    .toBeVisible();
    //exclusao com sucesso
  await page.getByRole("button", { name: "Excluir" }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Excluir" }).last().click();
  await page.waitForTimeout(1500);
  await expect(
    page.getByText(
      "Animais editado",
    ),
  )
    .not.toBeVisible();
});


