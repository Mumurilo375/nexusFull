import { test, expect } from "@playwright/test";

//Criação de categoria com falha
test("Criação de categoria com falha", async ({ page }) => {
    await page.goto("http://localhost:8081/login");
    await page.fill('input[name="email"]', "izaac@gmail.com");
    await page.fill('input[name="password"]', "Izaac123!");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("http://localhost:8081/");
    await page.goto("http://localhost:8081/admin/categories/");
    await page.goto("http://localhost:8081/admin/categories/new");
    await page.waitForSelector('form');
    await page.fill('input[type="text"]', "terror");
    await page.locator('button[type="submit"]').first().click();
    await expect(page.getByText("Não conseguimos concluir essa ação agora. Tente novamente em instantes.")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
     await expect(page).toHaveURL("http://localhost:8081/admin/categories");

     //Criação de categoria com sucesso
     await page.goto("http://localhost:8081/admin/categories/new");
    await page.waitForSelector('form');
    await page.fill('input[type="text"]', "Animais");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState('networkidle');
     await page.waitForTimeout(500);
     await page.goto("http://localhost:8081/admin/categories");
     await expect(page).toHaveURL("http://localhost:8081/admin/categories");
      await expect(page.getByRole("heading", { name: "Animais" }).first()).toBeVisible

      //ediçaõ com falha
      await page.getByRole("link", { name: "Editar" }).first().click();
    await page.waitForSelector('form');
    await page.fill('input[type="text"]', "salsicha editado");
    await page.locator('textarea').first().fill("cachorro salsicha editado");
    await page.locator('textarea').nth(1).fill("cachorro salsicha feio e gordinho editado.");
     await page.locator('button[type="submit"]').first().click();
}) 

//Edição de categoria com falha
