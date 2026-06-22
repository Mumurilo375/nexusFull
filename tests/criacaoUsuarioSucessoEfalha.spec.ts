import { test, expect } from "@playwright/test";

function calculateCpfDigits(baseDigits: string) {
  const firstWeights = Array.from({ length: 9 }, (_, index) => 10 - index);
  const firstDigitTotal = baseDigits
    .split("")
    .reduce(
      (total, digit, index) => total + Number(digit) * firstWeights[index],
      0,
    );
  const firstDigit = firstDigitTotal % 11 < 2 ? 0 : 11 - (firstDigitTotal % 11);

  const secondWeights = Array.from({ length: 10 }, (_, index) => 11 - index);
  const secondDigitTotal = `${baseDigits}${firstDigit}`
    .split("")
    .reduce(
      (total, digit, index) => total + Number(digit) * secondWeights[index],
      0,
    );
  const secondDigit =
    secondDigitTotal % 11 < 2 ? 0 : 11 - (secondDigitTotal % 11);

  return `${baseDigits}${firstDigit}${secondDigit}`;
}

function buildUniqueUserData(prefix: string) {
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const baseCpfDigits = Array.from({ length: 9 }, () =>
    Math.floor(Math.random() * 10),
  ).join("");

  return {
    username: `${prefix}-${uniqueSuffix}`,
    email: `${prefix}.${uniqueSuffix}@gmail.com`,
    password: "Douglas123!",
    fullName: `${prefix} americano`,
    cpf: calculateCpfDigits(baseCpfDigits),
  };
}

//Cadastro caso de sucesso, antes  de criar garanta que  o usuario não exista no banco
test("Cadastro com sucesso", async ({ page }) => {
  const user = buildUniqueUserData("douglas");

  await page.goto("https://nexus.store/login");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await page.waitForURL("https://nexus.store/cadastro");

  await expect(page).toHaveURL("https://nexus.store/cadastro");

  await page.fill('input[name="registerUsername"]', user.username);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="new-password"]', user.password);
  await page.fill('input[name="new-password-confirm"]', user.password);
  await page.fill('input[name="registerFullName"]', user.fullName);
  await page.fill('input[name="cpf"]', user.cpf);

  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).toHaveURL("https://nexus.store/login");

  //logando na conta criada
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);

  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL("https://nexus.store/");

  await expect(page.getByRole("button", { name: /douglas/i })).toBeVisible();
});

//cadastro usuario falha
test("Cadastro com falha", async ({ page }) => {
  const user = buildUniqueUserData("douglas-falha");

  const seededResponse = await page.request.post(
    "http://localhost:3001/users",
    {
      multipart: {
        fullName: user.fullName,
        username: user.username,
        cpf: user.cpf,
        email: user.email,
        password: user.password,
      },
    },
  );

  expect(seededResponse.ok()).toBeTruthy();

  await page.goto("https://nexus.store/login");

  await page.getByRole("link", { name: "Criar conta" }).click();

  await page.waitForURL("https://nexus.store/cadastro");

  await expect(page).toHaveURL("https://nexus.store/cadastro");

  await page.fill('input[name="registerUsername"]', user.username);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="new-password"]', user.password);
  await page.fill('input[name="new-password-confirm"]', user.password);
  await page.fill('input[name="registerFullName"]', user.fullName);
  await page.fill('input[name="cpf"]', user.cpf);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByText("Este email já está em uso.")).toBeVisible();

  await page.getByRole("button", { name: "Voltar" }).click();
  await page.waitForURL("https://nexus.store/login");

  await expect(page).toHaveURL("https://nexus.store/login");
});
