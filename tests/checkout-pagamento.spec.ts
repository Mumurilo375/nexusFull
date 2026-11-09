import { expect, test } from "@playwright/test";

const user = { id: 1, email: "checkout@example.test", username: "checkout", roles: [], permissions: [] };
const pending = { id: 1, orderNumber: "NEX-1", status: "pending", totalAmount: 50, checkoutUrl: "https://sandbox.mercadopago.com.br/test", paymentExpiresAt: "2026-11-08T15:00:00Z" };

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem("token", "sessao-apenas-para-testes");
    localStorage.setItem("authUser", JSON.stringify(user));
  }, user);
});

test("abre o checkout hospedado e envia o pedido sem preços ou dados de cartão", async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { items: [] };
    if (path === "/api/users/1") body = user;
    if (path === "/api/cart") body = { items: [{ id: 1, quantity: 1, listing: { price: 50, game: { title: "Jogo" }, platform: { name: "Steam" } } }] };
    if (path === "/api/checkout") {
      if (route.request().method() === "POST") expect(route.request().postData()).toBeNull();
      body = { order: route.request().method() === "POST" ? pending : null };
    }
    await route.fulfill({ json: body });
  });
  await page.route(pending.checkoutUrl, (route) => route.fulfill({ contentType: "text/html", body: "<h1>Checkout hospedado</h1>" }));
  await page.goto("/checkout");
  await expect(page.getByRole("button", { name: "Continuar para pagamento" })).toBeVisible();
  await expect(page.locator("input")).toHaveCount(0);
  await page.getByRole("button", { name: "Continuar para pagamento" }).click();
  await expect(page).toHaveURL(pending.checkoutUrl);
});

for (const width of [390, 1280]) {
  test(`mostra confirmação somente após consultar o pagamento (${width}px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let paid = false;
    await page.route("**/api/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/refresh")) paid = true;
      const body = path.includes("/checkout") ? { order: { ...pending, status: paid ? "paid" : "pending" } }
        : path === "/api/users/1" ? user : { items: [] };
      await route.fulfill({ json: body });
    });
    await page.goto("/checkout?orderId=1");
    await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver keys na biblioteca" })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole("button", { name: "Já paguei, verificar pagamento" }).click();
    await expect(page.getByRole("heading", { name: "Pagamento confirmado" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver keys na biblioteca" })).toBeVisible();
  });
}
