import { test, expect } from '@playwright/test';

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
// Define la URL base del ambiente donde corre la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL para crear un nuevo caso
const NEW_CASE_URL = `${BASE_URL}/front-crm/cases/new`;

// Define una función para obtener la URL de edición de un caso por su ID
const EDIT_CASE_URL = (id: string | number) => `${BASE_URL}/front-crm/cases/edit/${id}`;

// Define la URL de detalle de caso
const SHOW_CASE_URL = (id: string | number) => `${BASE_URL}/front-crm/cases/show/${id}`;

// Función que genera un string aleatorio de la longitud indicada
function generateRandomString(length: number): string {
  // Caracteres posibles para el string aleatorio
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
  let result = '';
  // Bucle para construir el string carácter por carácter
  for (let i = 0; i < length; i++) {
    // Selecciona un carácter aleatorio y lo agrega al resultado
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  // Devuelve el string generado
  return result;
}

// Función auxiliar para seleccionar una opción de un dropdown personalizado
async function selectDropdownOption(page, fieldName: string, optionText: string) {
  // Busca el primer contenedor del campo con el texto indicado
  const container = page.locator(`.form-floating:has-text("${fieldName}")`).first();
  // Busca el control del dropdown que esté habilitado
  const control = container.locator('div[class*="-control"]:not([aria-disabled="true"])').first();
  // Espera a que el control esté habilitado
  await expect(control).toBeEnabled({ timeout: 10000 });
  // Hace clic para abrir el dropdown
  await control.click();
  // Escribe el texto de la opción en el input del dropdown
  await container.locator('input:not([disabled])').fill(optionText);
  // Selecciona la opción exacta del dropdown
  await page.getByRole('option', { name: optionText, exact: true }).click();
}

// Test principal: crear y editar un caso de CRM de principio a fin
test('Crear y editar un caso de CRM de principio a fin', async ({ page }) => {
  test.setTimeout(70000); // 70 segundos, puedes ajustar según lo que necesites

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

  // --- CREACIÓN DE CASO ---

  // Hace clic en el botón "Crear Caso"
  await page.getByRole('button', { name: 'Crear Caso' }).click();
  // Espera a que la URL sea la de creación de nuevo caso
  await page.waitForURL(NEW_CASE_URL);

  // Selecciona el código de comercio en el formulario
  await selectDropdownOption(page, 'Código Comercio', '1400395');
  // Espera a que termine la carga de datos de la red
  await page.waitForLoadState('networkidle');
  // Selecciona el motivo del caso
  await selectDropdownOption(page, 'Motivo', 'ADHESION');
  await page.waitForLoadState('networkidle');
  // Selecciona el submotivo del caso
  await selectDropdownOption(page, 'Submotivo', 'Adhesion a Dinelco  Check Out');
  // Genera una descripción aleatoria para el caso
  const randomDescription = generateRandomString(50);
  // Completa el campo de descripción
  await page.locator('textarea[name="description"]').fill(randomDescription);
  // Selecciona el origen del caso
  await selectDropdownOption(page, 'Origen del caso', 'ATENCION PRESENCIAL');
  // Selecciona el área resolutora
  await selectDropdownOption(page, 'Áreas Resolutoras', 'BACK OFFICE');
  await page.waitForLoadState('networkidle');
  // Selecciona la persona resolutora
  await selectDropdownOption(page, 'Persona Resolutora', 'ADMIN CRM');

  // Hace clic en el botón "Guardar" para crear el caso
  await page.getByRole('button', { name: 'Guardar' }).click();
  // Espera a que la URL vuelva a la pantalla principal de casos
  await expect(page).toHaveURL(CASES_URL, { timeout: 10000 });

  // --- BÚSQUEDA DEL CASO CREADO ---

  // Recarga la pantalla principal de casos y espera que el DOM esté listo
  await page.goto(CASES_URL, { waitUntil: 'domcontentloaded' });
  // Busca todas las filas de datos (excluyendo el encabezado) en la tabla de casos
  const rowLocators = page.locator('div[role="row"].rs-table-row[aria-rowindex]:not([aria-rowindex="1"])');
  // Espera a que al menos una fila de datos esté visible
  await expect(rowLocators.first()).toBeVisible({ timeout: 20000 });

  // Cuenta la cantidad de filas de datos en la tabla
  const rowCount = await rowLocators.count();
  // Si no hay filas, lanza un error
  if (rowCount === 0) throw new Error('No se encontraron filas de datos en la tabla.');
  // Muestra la cantidad de filas encontradas en consola
  // console.log('Cantidad de filas:', rowCount);

  // Variables para guardar el ticket más alto y su índice
  let maxTicket = -1, maxRowIndex = -1;

  // Recorre todas las filas para encontrar la del ticket más alto
  for (let i = 0; i < rowCount; i++) {
    // Obtiene la fila actual
    const row = rowLocators.nth(i);
    // Busca la celda del número de ticket (columna 2)
    const ticketCell = row.locator('div[role="gridcell"][aria-colindex="2"]');
    // Si no existe la celda, pasa a la siguiente fila
    if (await ticketCell.count() === 0) continue;
    // Obtiene el texto del ticket y elimina espacios
    const ticketText = (await ticketCell.textContent())?.replace(/\s+/g, '') || '';
    // Convierte el texto a número
    const ticketNum = parseInt(ticketText, 10);
    // Si es un número válido y es el mayor encontrado, lo guarda
    if (!isNaN(ticketNum) && ticketNum > maxTicket) {
      maxTicket = ticketNum;
      maxRowIndex = i;
    }
  }

  // Si no se encontró ninguna fila válida, lanza un error
  if (maxRowIndex === -1) throw new Error('No se encontró ninguna fila con número de ticket.');

  // Obtiene la fila con el ticket más alto (último creado)
  const maxRow = rowLocators.nth(maxRowIndex);

  // --- ENTRAR EN EDICIÓN DEL CASO ---
  // Busca la celda de acciones (columna 1) en la fila seleccionada
  const actionCell = maxRow.locator('div[role="gridcell"][aria-colindex="1"]');
  // Busca el primer botón de editar dentro de la celda de acciones
  const editDiv = actionCell.locator('.d-flex > div').first();
  // Espera a que el botón de editar esté visible
  await expect(editDiv).toBeVisible({ timeout: 10000 });

  // Hace clic en el botón de editar y espera la URL de edición
  await Promise.all([
    page.waitForURL(/\/front-crm\/cases\/edit\/\d+/, { timeout: 10000 }),
    editDiv.click()
  ]);

  // Obtiene la URL actual después de hacer clic en editar
  const url = page.url();
  // Extrae el ID del caso de la URL usando una expresión regular
  const caseIdMatch = url.match(/\/cases\/edit\/(\d+)/);
  // Si no se puede extraer el ID, lanza un error
  if (!caseIdMatch) throw new Error('No se pudo extraer el ID del caso desde la URL: ' + url);
  // Guarda el ID del caso editado
  const caseId = caseIdMatch[1];

  // Si necesitas comparar la URL de edición, puedes usar:
  // await expect(page).toHaveURL(EDIT_CASE_URL(caseId), { timeout: 10000 });

  // --- EDICIÓN DEL CASO ---

  // 1. Edita el nombre del contacto
  await page.locator('input[name="attrContactName"]').fill('Juan Pérez');
  // 2. Edita el teléfono del contacto
  await page.locator('input[name="attrContactNumber"]').fill('0981123456');
  // 3. Edita el correo electrónico del contacto
  await page.locator('input[name="attrContactEmail"]').fill('juan.perez@email.com');

  // 4. Cambia el motivo del caso
  await selectDropdownOption(page, 'Motivo', 'CAPACITACION');
  // 5. Cambia el submotivo del caso
  await selectDropdownOption(page, 'Submotivo', 'Capacitacion de Cico');
  // 6. Cambia la categoría del caso
  await selectDropdownOption(page, 'Categoría', 'RECLAMO');

  // 7. Genera una nueva descripción aleatoria y la coloca en el campo de descripción
  const nuevaDescripcion = generateRandomString(50);
  await page.locator('textarea[name="description"]').first().fill(nuevaDescripcion);

  // 8. Cambia el origen del caso
  await selectDropdownOption(page, 'Origen del caso', 'FACEBOOK');
  // 9. Cambia el estado del caso
  await selectDropdownOption(page, 'Estado del caso', 'EN ANALISIS');

  // 10. Cambia el área resolutora
  await selectDropdownOption(page, 'Áreas Resolutoras', 'CAC');
  // 11. Cambia la persona resolutora
  await selectDropdownOption(page, 'Persona Resolutora', 'FERNANDO VIDAL COLUCHI AGUAYO');

  // 12. Hace clic en "Guardar" y espera la redirección a la pantalla principal de casos
  await page.getByRole('button', { name: 'Guardar' }).click();
  await page.waitForTimeout(2000); // Espera 2 segundos

  // Después de guardar la edición y volver a la lista principal, entra a la vista detalle:
  await page.goto(CASES_URL, { waitUntil: 'domcontentloaded' });

  // --- VISTA DETALLE DEL CASO --- 

  // Selecciona la fila y la celda de acciones del último caso
  const detailRow = rowLocators.nth(maxRowIndex);
  const detailCell = detailRow.locator('div[role="gridcell"][aria-colindex="1"]');
  // El segundo div es el botón de detalle (ícono de ojo)
  const detailButton = detailCell.locator('.d-flex > div').nth(1);
  await expect(detailButton).toBeVisible({ timeout: 10000 });

  // Haz click en el botón de detalle
  await detailButton.click();

  // Espera la URL de detalle y un elemento único de la vista detalle
  await page.waitForURL(SHOW_CASE_URL(caseId), { timeout: 10000 });
  await expect(page.locator('.caseShowTitle_titleContainer__xNLtS')).toBeVisible({ timeout: 10000 });

  // --- Recorrer las pestañas ---
  const tabsContainer = page.locator('.show_tabsContainer__rmHmR');

  // Haz clic en la pestaña "Historial"
  const historialTab = tabsContainer.locator('p', { hasText: 'Historial' });
  await expect(historialTab).toBeVisible({ timeout: 5000 });
  await historialTab.click();
  await page.waitForTimeout(10000); // Espera 10 segundos

  // Haz clic en la pestaña "Cronología"
  const cronologiaTab = tabsContainer.locator('p', { hasText: 'Cronología' });
  await expect(cronologiaTab).toBeVisible({ timeout: 5000 });
  await cronologiaTab.click();
  await page.waitForTimeout(10000); // Espera 10 segundos

  // Vuelve a la pestaña "Visión general"
  const visionGeneralTab = tabsContainer.locator('p', { hasText: 'Visión general' });
  await expect(visionGeneralTab).toBeVisible({ timeout: 5000 });
  await visionGeneralTab.click();
  await page.waitForTimeout(10000); // Espera 10 segundos

  // Haz clic en el botón "Volver"
  const volverBtn = page.getByRole('button', { name: 'Volver' });
  await expect(volverBtn).toBeVisible({ timeout: 5000 });
  await volverBtn.click();
  await expect(page).toHaveURL(CASES_URL, { timeout: 10000 });

  // --- EXPORTAR EL ÚLTIMO CASO POR NRO. TICKET ---

  // 1. Obtén el número de ticket del último caso creado (columna 2 de la fila maxRowIndex)
  const ticketCell = rowLocators.nth(maxRowIndex).locator('div[role="gridcell"][aria-colindex="2"]');
  const ticketNumber = (await ticketCell.textContent())?.trim();

  // 2. Haz clic en el botón de filtro (ícono)
  await page.locator('.call-to-actions_filterButton__qquo7').click();

  // 3. Marca el checkbox "Nro. Ticket" si no está marcado
  const ticketCheckbox = page.locator('input[type="checkbox"][value="TicketNumber"]');
  await expect(ticketCheckbox).toBeVisible({ timeout: 5000 });
  if (!(await ticketCheckbox.isChecked())) {
    await ticketCheckbox.check();
  }

  // 4. Ingresa el número de ticket en el input correcto
  const ticketInput = page.locator('#TicketNumber');
  await expect(ticketInput).toBeVisible({ timeout: 5000 });
  await ticketInput.fill(ticketNumber!);

  // 5. Aplica el filtro (puede ser con Enter o con un botón "Filtrar" si existe)
  await ticketInput.press('Enter');

  // 6. Espera a que se actualicen los resultados
  await page.waitForTimeout(2000);

  // 7. Haz clic en el botón "Exportar"
  const exportBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' });
  await expect(exportBtn).toBeVisible({ timeout: 5000 });
  await exportBtn.click();

  // 14. Pausa la ejecución para inspección manual (útil en desarrollo)
  await page.pause();
  // 15. Muestra en consola que el test se completó y el ID del caso editado
  console.log('Test completado: El caso fue creado y editado exitosamente con ID:', caseId);
});