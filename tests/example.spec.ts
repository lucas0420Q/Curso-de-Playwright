import { test, expect } from '@playwright/test';

 test('has title', async ({ page }) => {
   await page.goto('https://playwright.dev/');

   // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
 });

test('get started link', async ({ page }) => {
   await page.goto('https://playwright.dev/');

   // Click the get started link.
   await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
 });


// Test que verifica la funcionalidad de búsqueda en YouTube
 test('test 3', async ({ page }) => {

  // Navega a la página principal de YouTube
 await page.goto('https://www.youtube.com/');

  // Localiza el campo de búsqueda por su atributo name y escribe "playwright"
  await page.locator('input[name= "search_query"]').fill('playwright cortos');

  // Simula presionar la tecla Enter para ejecutar la búsqueda
 await page.keyboard.press('Enter');

  // Espera hasta que los resultados de la búsqueda sean visibles
  // ytd-video-renderer es el elemento que contiene cada resultado de video
 // Se establece un tiempo máximo de espera de 10 segundos
 await page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

 // Verifica que el primer video de los resultados esté visible en la página
 // first() selecciona el primer elemento que coincide con el selector
 await expect(page.locator('ytd-video-renderer').first()).toBeVisible();

  // Accede al video con el título "Cómo hacer Testing automatizado usando Playwright"
  await page.locator('yt-formatted-string[aria-label*="Cómo hacer Testing automatizado usando Playwright"]').click();

   // Espera a que el botón de pantalla completa esté visible 
   await page.waitForSelector('.ytp-fullscreen-button', { timeout: 5000 });

   // Click en el botón de pantalla completa// Útil durante el desarrollo y debugging
   await page.locator('.ytp-fullscreen-button').click();
 
 // Pausa la ejecución del test para inspección manual
 // Útil durante el desarrollo y debugging
 await page.pause();

});

 test('test CRM', async ({ page }) => {
   // Navega a la página de inicio de sesión
  await page.goto('http://localhost:3000/front-crm/cases');

  // Llena el campo de nombre de usuario
   await page.locator('input[name="userName"]').fill('admin@clt.com.py');

   // Llena el campo de contraseña
   await page.locator('input[name="password"]').fill('B3rL!n57A');

   // Simula presionar la tecla Enter para iniciar sesión
   await page.keyboard.press('Enter');

  // Espera hasta que el elemento con la clase "hide-scrollbar" sea visible
  await page.waitForSelector('[class*="hide-scrollbar"]', { timeout: 10000 });

  // Espera a que la red esté inactiva
  await page.waitForLoadState('networkidle');

  // Verifica que el elemento con la clase "hide-scrollbar" esté visible
  await expect(page.locator('[class*="hide-scrollbar"]').first()).toBeVisible();

  // Click en el botón "Crear Caso"
await page.getByRole('button', { name: 'Crear Caso' }).click();

// Esperar a que la navegación se complete y verificar la URL
await expect(page).toHaveURL('http://localhost:3000/front-crm/cases/new');
 
  // Pausa la ejecución del test para inspección manual (opcional)
  await page.pause();
});