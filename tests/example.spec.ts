import { test, expect } from '@playwright/test';
 //Login caso de sucesso
test('has title', async ({ page }) => {
  await page.goto('http://localhost:8081/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nexus/);
});

test('Entrar link', async ({ page }) => {
  await page.goto('http://localhost:8081/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Entrar' }).click();

await page.waitForURL('http://localhost:8081/login');

await expect (page).toHaveURL('http://localhost:8081/login');
 
});
