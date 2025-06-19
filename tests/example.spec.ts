import { test, expect } from '@playwright/test';
import * as fs from 'fs';

//  test('has title', async ({ page }) => {

//    await page.goto('https://playwright.dev/');

//    // Expect a title "to contain" a substring.
//   await expect(page).toHaveTitle(/Playwright/);
//  });

// test('get started link', async ({ page }) => {
//    await page.goto('https://playwright.dev/');

//    // Click the get started link.
//    await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
//  });


// // Test que verifica la funcionalidad de búsqueda en YouTube
//  test('test 3', async ({ page }) => {

//   // Navega a la página principal de YouTube
//  await page.goto('https://www.youtube.com/');

//   // Localiza el campo de búsqueda por su atributo name y escribe "playwright"
//   await page.locator('input[name= "search_query"]').fill('playwright cortos');

//   // Simula presionar la tecla Enter para ejecutar la búsqueda
//  await page.keyboard.press('Enter');

//   // Espera hasta que los resultados de la búsqueda sean visibles
//   // ytd-video-renderer es el elemento que contiene cada resultado de video
//  // Se establece un tiempo máximo de espera de 10 segundos
//  await page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

//  // Verifica que el primer video de los resultados esté visible en la página
//  // first() selecciona el primer elemento que coincide con el selector
//  await expect(page.locator('ytd-video-renderer').first()).toBeVisible();

//   // Accede al video con el título "Cómo hacer Testing automatizado usando Playwright"
//   await page.locator('yt-formatted-string[aria-label*="Cómo hacer Testing automatizado usando Playwright"]').click();

//    // Espera a que el botón de pantalla completa esté visible 
//    await page.waitForSelector('.ytp-fullscreen-button', { timeout: 5000 });

//    // Click en el botón de pantalla completa// Útil durante el desarrollo y debugging
//    await page.locator('.ytp-fullscreen-button').click();
 
//  // Pausa la ejecución del test para inspección manual
//  // Útil durante el desarrollo y debugging
//  await page.pause();

// });






// Test que verifica la funcionalidad de CRM

// --- FUNCIÓN AUXILIAR ---
// Define una función para generar una cadena de texto con caracteres aleatorios.




// function generateRandomString(length: number): string {
//   // Define el conjunto de caracteres posibles para la cadena aleatoria.
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
//   // Inicializa una cadena vacía donde se construirá el resultado.
//   let result = '';
//   // Guarda la longitud del conjunto de caracteres para un acceso más eficiente.
//   const charactersLength = characters.length;
//   // Inicia un bucle que se repetirá 'length' veces (el largo deseado de la cadena).
//   for (let i = 0; i < length; i++) {
//     // A cada iteración, añade un carácter aleatorio del conjunto 'characters' a la cadena 'result'.
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   // Devuelve la cadena aleatoria completa.
//   return result;
// }

// // --- INICIO DEL TEST ---
// // Define un nuevo caso de prueba llamado 'Crear un caso de CRM de principio a fin'.
// // 'async ({ page })' le da acceso al test a un objeto 'page', que representa una pestaña del navegador.
// test('Crear un caso de CRM de principio a fin', async ({ page }) => {
  
//   // --- BLOQUE 1: NAVEGACIÓN Y LOGIN ---
//   // Navega a la URL de inicio de sesión de la aplicación.
//   await page.goto('http://localhost:3000/front-crm/cases');
//   // Localiza el campo de usuario por su atributo 'name' y escribe el email.
//   await page.locator('input[name="userName"]').fill('admin@clt.com.py');
//   // Localiza el campo de contraseña por su atributo 'name' y escribe la contraseña.
//   await page.locator('input[name="password"]').fill('B3rL!n57A');
//   // Simula la pulsación de la tecla 'Enter' para enviar el formulario de login.
//   await page.keyboard.press('Enter');
//   // Espera a que la URL cambie a la página principal de casos, confirmando que el login fue exitoso.
//   await page.waitForURL('**/front-crm/cases');
//   // Verifica que el botón 'Crear Caso' esté visible, lo que confirma que estamos en la página correcta.
//   await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible();

//   // --- BLOQUE 2: IR AL FORMULARIO DE CREACIÓN ---
//   // Localiza el botón 'Crear Caso' por su rol y texto y le hace clic.
//   await page.getByRole('button', { name: 'Crear Caso' }).click();
//   // Espera a que la URL cambie a la página para crear un nuevo caso.
//   await page.waitForURL('**/front-crm/cases/new');

//   // --- BLOQUE 3: SELECCIÓN DE CÓDIGO COMERCIO ---
//   // Define una variable con el código de comercio a buscar.
//   const codigoComercio = '1400395';
//   // Localiza el contenedor del campo "Código Comercio" buscando un div que contenga ese texto.
//   const codigoComercioContainer = page.locator('.form-floating:has-text("Código Comercio")');
//   // Dentro de ese contenedor, hace clic en el control del dropdown para activarlo.
//   await codigoComercioContainer.locator('div[class*="-control"]').click();
//   // Dentro del mismo contenedor, encuentra el campo de texto y escribe el código para filtrar.
//   await codigoComercioContainer.locator('input').fill(codigoComercio);
//   // Localiza la opción que aparece en el desplegable (usando una expresión regular) y le hace clic.
//   await page.getByRole('option', { name: new RegExp(codigoComercio) }).click();
//   // Espera a que todas las llamadas de red (API) se completen, asegurando que los datos del cliente se cargaron.
//   await page.waitForLoadState('networkidle');

//   // --- BLOQUE 4: FUNCIÓN AUXILIAR REUTILIZABLE ---
//   // Define una función asíncrona para seleccionar una opción de cualquier dropdown complejo.
//   async function selectDropdownOption(fieldName: string, optionText: string) {
//     // Localiza el contenedor del campo específico usando el 'fieldName' proporcionado.
//     const container = page.locator(`.form-floating:has-text("${fieldName}")`);
    
//     // Localiza el control clickeable, asegurándose de que no esté deshabilitado.
//     const control = container.locator('div[class*="-control"]:not([aria-disabled="true"])');
//     // Espera explícitamente hasta 10 segundos a que el control esté habilitado antes de continuar.
//     await expect(control).toBeEnabled({ timeout: 10000 });
//     // Le hace clic al control para abrir el desplegable.
//     await control.click();

//     // Localiza el campo de texto activo (no deshabilitado) dentro del contenedor y escribe el texto de la opción.
//     await container.locator('input:not([disabled])').fill(optionText);
//     // Localiza la opción por su texto exacto y le hace clic.
//     await page.getByRole('option', { name: optionText, exact: true }).click();
//   }

//   // --- BLOQUE 5: COMPLETAR TODOS LOS CAMPOS DEL FORMULARIO ---
//   // Llama a la función auxiliar para seleccionar 'ADHESION' en el campo 'Motivo'.
//   await selectDropdownOption('Motivo', 'ADHESION');
//   // Espera a que la red se estabilice, ya que los submotivos dependen de la selección del motivo.
//   await page.waitForLoadState('networkidle'); 
//   // Llama a la función auxiliar para seleccionar el Submotivo.
//   await selectDropdownOption('Submotivo', 'Adhesion a Dinelco  Check Out');
  
//   // Llama a la función que genera 50 caracteres aleatorios.
//   const randomDescription = generateRandomString(50);
//   // Localiza el campo de descripción (textarea) por su 'name' y lo rellena con el texto aleatorio.
//   await page.locator('textarea[name="description"]').fill(randomDescription);
  
//   // Llama a la función auxiliar para seleccionar el 'Origen del caso'.
//   await selectDropdownOption('Origen del caso', 'ATENCION PRESENCIAL');
  
//   // Llama a la función auxiliar para seleccionar las 'Áreas Resolutoras'.
//   await selectDropdownOption('Áreas Resolutoras', 'BACK OFFICE');
//   // Espera a que la red se estabilice por si la selección afecta al siguiente campo.
//   await page.waitForLoadState('networkidle');

//   // Llama a la función auxiliar para seleccionar la 'Persona Resolutora'.
//   await selectDropdownOption('Persona Resolutora', 'ADMIN CRM');

//   // --- BLOQUE 6: GUARDAR Y VERIFICAR ---
//   // Localiza el botón 'Guardar' por su rol y texto y le hace clic.
//   await page.getByRole('button', { name: 'Guardar' }).click();

//   // Verifica que, tras guardar, la URL ha cambiado a la página principal de la lista de casos.
//   await expect(page).toHaveURL('http://localhost:3000/front-crm/cases', { timeout: 10000 });

//   // Imprime un mensaje en la consola del terminal para confirmar que el test finalizó con éxito.
//   console.log('Test completado: El caso fue creado y guardado exitosamente.');
// });




// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---



// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---


// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---





// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---



// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---

// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// Genera una cadena de texto aleatoria para campos como la descripción.
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---

// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR PARA TEXTO ALEATORIO ---
// --- FUNCIÓN AUXILIAR ---
// --- FUNCIÓN AUXILIAR ---
// --- FUNCIÓN AUXILIAR ---
function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

test('Crear y editar un caso de CRM de principio a fin', async ({ page }) => {
  // Login y creación
  await page.goto('http://localhost:3000/front-crm/cases');
  await page.locator('input[name="userName"]').fill('admin@clt.com.py');
  await page.locator('input[name="password"]').fill('B3rL!n57A');
  await page.keyboard.press('Enter');
  await page.waitForURL('**/front-crm/cases');
  await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible();

  await page.getByRole('button', { name: 'Crear Caso' }).click();
  await page.waitForURL('**/front-crm/cases/new');

  const codigoComercio = '1400395';
  const codigoComercioContainer = page.locator('.form-floating:has-text("Código Comercio")');
  await codigoComercioContainer.locator('div[class*="-control"]').click();
  await codigoComercioContainer.locator('input').fill(codigoComercio);
  await page.getByRole('option', { name: new RegExp(codigoComercio) }).click();
  await page.waitForLoadState('networkidle');

  async function selectDropdownOption(fieldName: string, optionText: string) {
    const container = page.locator(`.form-floating:has-text("${fieldName}")`);
    const control = container.locator('div[class*="-control"]:not([aria-disabled="true"])');
    await expect(control).toBeEnabled({ timeout: 10000 });
    await control.click();
    await container.locator('input:not([disabled])').fill(optionText);
    await page.getByRole('option', { name: optionText, exact: true }).click();
  }

  await selectDropdownOption('Motivo', 'ADHESION');
  await page.waitForLoadState('networkidle');
  await selectDropdownOption('Submotivo', 'Adhesion a Dinelco  Check Out');
  const randomDescription = generateRandomString(50);
  await page.locator('textarea[name="description"]').fill(randomDescription);
  await selectDropdownOption('Origen del caso', 'ATENCION PRESENCIAL');
  await selectDropdownOption('Áreas Resolutoras', 'BACK OFFICE');
  await page.waitForLoadState('networkidle');
  await selectDropdownOption('Persona Resolutora', 'ADMIN CRM');

  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page).toHaveURL('http://localhost:3000/front-crm/cases', { timeout: 10000 });

  // Vuelve a la lista de casos y espera solo el DOM principal
  await page.goto('http://localhost:3000/front-crm/cases', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('div[role="grid"]')).toBeVisible({ timeout: 20000 });

  // Espera hasta 30 segundos a que aparezca al menos una fila de datos real (no encabezado)
  let foundDataRow = false;
  for (let t = 0; t < 30; t++) {
    const rowLocators = page.locator('div[role="row"].rs-table-row');
    const rowCount = await rowLocators.count();
    for (let i = 0; i < rowCount; i++) {
      const row = rowLocators.nth(i);
      const rowText = await row.textContent();
      const cleanText = rowText?.replace(/\s+/g, ' ').trim() || '';
      if (!cleanText.includes('Nº Ticket') && cleanText.length > 0) {
        foundDataRow = true;
        break;
      }
    }
    if (foundDataRow) break;
    await page.waitForTimeout(1000); // Espera 1 segundo antes de volver a intentar
  }

  // Imprime todas las filas para depuración
  const rowLocators = page.locator('div[role="row"].rs-table-row');
  const rowCount = await rowLocators.count();
  let maxTicket = -1;
  let maxRowIndex = -1;
  let filasDebug: string[] = [];

  for (let i = 0; i < rowCount; i++) {
    const row = rowLocators.nth(i);
    const rowText = await row.textContent();
    const cleanText = rowText?.replace(/\s+/g, ' ').trim() || '';
    filasDebug.push(`Fila ${i}: "${cleanText}"`);
    if (cleanText.includes('Nº Ticket')) continue;
    // Busca el primer número en la fila (asumiendo que es el ticket)
    const match = cleanText.match(/\b\d+\b/);
    if (match) {
      const ticketNum = parseInt(match[0], 10);
      if (!isNaN(ticketNum) && ticketNum > maxTicket) {
        maxTicket = ticketNum;
        maxRowIndex = i;
      }
    }
  }

  if (maxRowIndex === -1) {
    console.log('--- Debug filas de la tabla ---');
    filasDebug.forEach(f => console.log(f));
    throw new Error('No se encontró ninguna fila con número de ticket.');
  }

  const maxRow = rowLocators.nth(maxRowIndex);
  const rowText = await maxRow.textContent();
  console.log(`Fila seleccionada para editar: "${rowText?.replace(/\s+/g, ' ').trim()}"`);

  // Busca la celda de acciones (columna 1) de la fila seleccionada
  const actionCell = maxRow.locator('div[role="gridcell"][aria-colindex="1"]');
  // Busca el primer div clickable dentro de .d-flex (el lápiz)
  const editDiv = actionCell.locator('.d-flex > div').first();
  await expect(editDiv).toBeVisible({ timeout: 10000 });

  // Espera la navegación tras el click en el botón de editar
  await Promise.all([
    page.waitForURL(/\/front-crm\/cases\/edit\/\d+/, { timeout: 10000 }),
    editDiv.click()
  ]);

  const url = page.url();
  if (!/\/cases\/edit\/\d+/.test(url)) {
    throw new Error(`Después de hacer click en editar, la URL no cambió. URL actual: ${url}`);
  }
  const caseIdMatch = url.match(/\/cases\/edit\/(\d+)/);
  if (!caseIdMatch) throw new Error('No se pudo extraer el ID del caso desde la URL: ' + url);
  const caseId = caseIdMatch[1];

  // Aquí puedes continuar con la edición...
  await page.pause();
});