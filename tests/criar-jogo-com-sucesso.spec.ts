import { test, expect } from "@playwright/test";

//Criação de jogo com sucesso
test("Criação de jogo com sucesso", async ({ page }) => {
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
  await page.locator('details').first().click();
  await page.locator('details').first().locator('input[type="text"]').fill("https://th.bing.com/th/id/R.aa20a88f0070b7d0ff794848f5df56d5?rik=1PUBYI73ob1Qgg&pid=ImgRaw&r=0");
  await page.locator('button[type="submit"]').first().click();

  await page.goto("http://localhost:8081/admin/games");

  await page.waitForURL("http://localhost:8081/admin/games");

  await page.waitForTimeout(1500);

  await expect(page.getByRole("heading", { name: "salsicha" })).toBeVisible();
});
