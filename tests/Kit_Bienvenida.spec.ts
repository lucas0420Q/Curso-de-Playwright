import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL del kit de bienvenida
const WELCOME_KIT_URL = `${BASE_URL}/front-crm/welcome-kit`;

// Test para acceder al kit de bienvenida
test('Acceder al kit de bienvenida', async ({ page }) => {
  // Establece el timeout máximo del test en 2 minutos
  test.setTimeout(120000);

  // Configurar manejo de errores de página
  page.on('pageerror', (error) => {
    console.log('Error de página detectado:', error.message);
  });

  page.on('crash', () => {
    console.log('La página se ha cerrado inesperadamente');
  });

  // --- LOGIN ---

  // Navega a la pantalla principal de casos
  await page.goto(CASES_URL);
  // Completa el campo de usuario
  await page.locator('input[name="userName"]').fill('admin@clt.com.py');
  // Completa el campo de contraseña
  await page.locator('input[name="password"]').fill('B3rL!n57A');
  // Presiona Enter para enviar el formulario de login
  await page.keyboard.press('Enter');
  // Espera a que la URL sea la de la pantalla principal de casos
  await page.waitForURL(CASES_URL);
  // Verifica que el botón "Crear Caso" esté visible
  await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible();
  
  console.log('✓ Login exitoso - En la pantalla principal de casos');
  
  // Pausa en la pantalla principal de casos
  await page.waitForTimeout(3000);

  // --- REDIRECCIÓN AL KIT DE BIENVENIDA ---

  // Navega a la URL del kit de bienvenida
  await page.goto(WELCOME_KIT_URL);
  // Espera a que la URL sea la del kit de bienvenida
  await page.waitForURL(WELCOME_KIT_URL);
  
  console.log('✓ Acceso exitoso al kit de bienvenida');

  await page.pause()
});