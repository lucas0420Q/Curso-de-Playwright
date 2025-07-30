
import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL de la pantalla de insumos
const SUPPLIES_URL = `${BASE_URL}/front-crm/supplies`;

test('Login y navegación a pantalla de insumos', async ({ page }) => {
  test.setTimeout(120000); // 2 minutos timeout

  // Manejo de errores
  page.on('pageerror', error => console.log('Error de página:', error.message));
  page.on('crash', () => console.log('La página se cerró inesperadamente'));
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(60000);

  // === LOGIN ===
  await page.goto(CASES_URL);
  await page.waitForSelector('input[name="userName"]', { timeout: 15000 });
  await page.waitForSelector('input[name="password"]', { timeout: 15000 });
  await page.locator('input[name="userName"]').fill('admin@clt.com.py');
  await page.locator('input[name="password"]').fill('B3rL!n57A');
  const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar")').first();
  if (await submitButton.isVisible()) {
    await submitButton.click();
  } else {
    await page.keyboard.press('Enter');
  }
  await page.waitForURL(CASES_URL, { timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 15000 });

  // === NAVEGACIÓN A INSUMOS ===
  await page.goto(SUPPLIES_URL);
  await page.waitForURL(SUPPLIES_URL);
  await page.waitForTimeout(3000);

  // Verificar que estamos en la pantalla correcta
  try {
    const pageTitle = await page.title();
    console.log('Título de la página de insumos:', pageTitle);
    await page.waitForTimeout(2000);
  } catch (verificationError) {
    console.log(`Error al verificar la pantalla de insumos: ${verificationError.message}`);
  }

  // Pausa final para inspección manual
  await page.waitForTimeout(5000);
});
