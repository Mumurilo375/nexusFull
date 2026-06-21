import { test, expect } from "@playwright/test";

function buildUniqueGameTitle() {
  return `salsicha-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
//teste

//Criação de jogo com falha
test("Criação de jogo com falha", async ({ page }) => {
  await page.goto("https://nexus.store/login");
  await page.fill('input[name="email"]', "izaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("https://nexus.store/");
  await page.goto("https://nexus.store/admin/games/new");
  await page.waitForSelector("form");
  await page.fill('input[type="text"]', "salsicha");
  await page.fill('input[type="date"]', "2022-02-25");
  await page.locator("textarea").first().fill("cachorro salsicha");
  await page
    .locator("textarea")
    .nth(1)
    .fill("cachorro salsicha feio e gordinho.");
  await page.getByRole("button", { name: /Escolher categorias/ }).click();
  await page.waitForTimeout(500);
  await page
    .locator("button")
    .filter({ hasText: /Terror|Crime/ })
    .first()
    .click();
  await page.locator('button[type="submit"]').first().click();
  await expect(
    page.getByText("Envie uma capa ou informe uma URL de fallback."),
  ).toBeVisible();
  await page.waitForTimeout(500);
  await page.getByRole("link", { name: "Cancelar" }).click();
  await expect(page).toHaveURL("https://nexus.store/admin/games");
});

//Criação de jogo com sucesso
test("Criação de jogo com sucesso", async ({ page }) => {
  const gameTitle = buildUniqueGameTitle();

  await page.goto("https://nexus.store/login");
  await page.fill('input[name="email"]', "izaac@gmail.com");
  await page.fill('input[name="password"]', "Izaac123!");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("https://nexus.store/");
  await page.goto("https://nexus.store/admin/games/new");
  await page.waitForSelector("form");
  await page.fill('input[type="text"]', gameTitle);
  await page.fill('input[type="date"]', "2022-02-25");
  await page.locator("textarea").first().fill("cachorro salsicha");
  await page
    .locator("textarea")
    .nth(1)
    .fill("cachorro salsicha feio e gordinho.");
  await page.getByRole("button", { name: /Escolher categorias/ }).click();
  await page.waitForTimeout(500);
  await page
    .locator("button")
    .filter({ hasText: /Terror|Crime/ })
    .first()
    .click();
  await page.locator("details").first().click();
  await page
    .locator("details")
    .first()
    .locator('input[type="text"]')
    .fill(
      "https://th.bing.com/th/id/R.aa20a88f0070b7d0ff794848f5df56d5?rik=1PUBYI73ob1Qgg&pid=ImgRaw&r=0",
    );
  const createGameResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/games") &&
      response.request().method() === "POST",
  );
  await page.locator('button[type="submit"]').first().click();
  await createGameResponse;

  await page.goto("https://nexus.store/admin/games");

  await page.waitForURL("https://nexus.store/admin/games");

  const initialSearchResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/games") &&
      response.request().method() === "GET",
  );
  await page.getByPlaceholder("Pesquisar por título...").fill(gameTitle);
  await initialSearchResponse;

  const createdGameCard = page
    .locator("article")
    .filter({
      hasText: gameTitle,
    })
    .first();

  await expect(createdGameCard).toContainText(gameTitle);
  //ediçaõ com falha

  await createdGameCard.getByRole("link", { name: "Editar" }).click();
  await page.waitForSelector("form");

  // localizar o input de título de forma resiliente: tenta o label em PT, depois o name
  let titleLocator = page.getByLabel("Título").first();
  if ((await titleLocator.count()) === 0) {
    titleLocator = page
      .locator('input[name="title"], input[type="text"][name="title"]')
      .first();
  }

  await expect(titleLocator).toBeVisible({ timeout: 5000 });
  await titleLocator.fill("");
  await page.locator('button[type="submit"]').first().click();

  await expect(page.getByText("Título obrigatório")).toBeVisible();
  //edição com sucesso
  await titleLocator.fill(`${gameTitle} editado`);
  const updateGameResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/games/") &&
      response.request().method() === "PUT",
  );
  await page.locator('button[type="submit"]').first().click();
  await updateGameResponse;

  await page.waitForTimeout(1500);

  await expect(
    page
      .locator("article")
      .filter({ hasText: `${gameTitle} editado` })
      .first(),
  ).toContainText(`${gameTitle} editado`);

  await page.goto("https://nexus.store/admin/games");

  await page.waitForURL("https://nexus.store/admin/games");

  const updatedSearchResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/games") &&
      response.request().method() === "GET",
  );
  await page
    .getByPlaceholder("Pesquisar por título...")
    .fill(`${gameTitle} editado`);
  await updatedSearchResponse;
  //excluir com falha
  await expect(
    page
      .locator("article")
      .filter({ hasText: `${gameTitle} editado` })
      .first(),
  ).toContainText(`${gameTitle} editado`);
  await page.getByRole("button", { name: "Excluir" }).first().click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Cancelar  " }).last().click();
  await page.waitForTimeout(1500);
  await page.goto("https://nexus.store/admin/games");

  await page.waitForURL("https://nexus.store/admin/games");

  const finalSearchResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/games") &&
      response.request().method() === "GET",
  );
  await page
    .getByPlaceholder("Pesquisar por título...")
    .fill(`${gameTitle} editado`);
  await finalSearchResponse;

  //excluir com sucesso
  await expect(
    page
      .locator("article")
      .filter({ hasText: `${gameTitle} editado` })
      .first(),
  ).toContainText(`${gameTitle} editado`);
  await page.getByRole("button", { name: "Excluir" }).first().click();
  const deleteGameResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/games/") &&
      response.request().method() === "DELETE",
  );
  await page.getByRole("button", { name: "excluir  " }).last().click();
  await deleteGameResponse;
  await page.waitForTimeout(1500);
  await page.goto("https://nexus.store/admin/games");

  await page.waitForURL("https://nexus.store/admin/games");
});
