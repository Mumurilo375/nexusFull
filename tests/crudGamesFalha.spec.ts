import { test, expect } from "@playwright/test";
//Criação de jogo com falha
test("Criação de jogo com falha", async ({ page }) => {
  await page.goto("http://localhost:8081/login");
  await page.fill('input[name="email"]', "izaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("http://localhost:8081/");
  await page.goto("http://localhost:8081/admin/games/new");
  await page.waitForSelector('form');
  await page.fill('input[type="text"]', "salsicha");
  await page.fill('input[type="date"]', "2022-02-25");
  await page.locator('textarea').first().fill("cachorro salsicha");
  await page.locator('textarea').nth(1).fill("cachorro salsicha feio e gordinho.");
  await page.getByRole("button", { name: /Escolher categorias/ }).click();
  await page.waitForTimeout(500);
  await page.locator('button').filter({ hasText: /Terror|Crime/ }).first().click();
  await page.locator('button[type="submit"]').first().click();
  await expect(page.getByText("Envie uma capa ou informe uma URL de fallback.")).toBeVisible();
  await page.waitForTimeout(500);
  await page.getByRole("link", { name: "Cancelar" }).click();
  await expect(page).toHaveURL("http://localhost:8081/admin/games");
});