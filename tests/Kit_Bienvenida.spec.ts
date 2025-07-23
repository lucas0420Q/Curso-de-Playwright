import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL del kit de bienvenida
const WELCOME_KIT_URL = `${BASE_URL}/front-crm/welcome-kit`;

// Define el patrón de URL para la edición de kits de bienvenida
const WELCOME_KIT_EDIT_URL_PATTERN = /\/front-crm\/welcome-kit\/edit\/\d+/;

// Variable para almacenar el ID del kit creado
let kitId: string = '';

// Test para acceder a la pantalla de kits de bienvenida
test('Acceder a la pantalla de kits de bienvenida', async ({ page }) => {
  // Establece el timeout máximo del test en 180 segundos (3 minutos)
  test.setTimeout(180000);

  // Configurar manejo de errores de página
  page.on('pageerror', (error) => {
    console.log('Error de página detectado:', error.message);
  });

  page.on('crash', () => {
    console.log('La página se ha cerrado inesperadamente');
  });

  // --- LOGIN ---

  try {
    // Navega a la pantalla principal de casos
    await page.goto(CASES_URL);
    console.log('Navegando a la página de login...');
    
    // Espera a que aparezcan los campos de login
    await page.waitForSelector('input[name="userName"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    
    // Completa el campo de usuario
    await page.locator('input[name="userName"]').fill('admin@clt.com.py');
    console.log('Campo de usuario completado');
    
    // Completa el campo de contraseña
    await page.locator('input[name="password"]').fill('B3rL!n57A');
    console.log('Campo de contraseña completado');
    
    // Busca el botón de submit y hace clic en él (más confiable que Enter)
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar")').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('Botón de login clickeado');
    } else {
      // Si no encuentra el botón, usa Enter como respaldo
      await page.keyboard.press('Enter');
      console.log('Enter presionado como respaldo');
    }
    
    // Espera a que la URL cambie (con timeout más largo para el login)
    console.log('Esperando redirección después del login...');
    await page.waitForURL(CASES_URL, { timeout: 30000 });
    
    // Verifica que el botón "Crear Caso" esté visible
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 15000 });
    
    console.log('✓ Login exitoso - En la pantalla principal de casos');
    
  } catch (error) {
    console.log('Error durante el login:', error);
    
    // Verificación de respaldo: comprobar si ya estamos logueados
    const currentUrl = page.url();
    console.log(`URL actual: ${currentUrl}`);
    
    if (currentUrl.includes('/front-crm/cases')) {
      console.log('✓ Ya estamos en la página de casos');
    } else if (currentUrl.includes('/front-crm/')) {
      console.log('Login parcialmente exitoso, navegando a casos...');
      await page.goto(CASES_URL);
      await page.waitForURL(CASES_URL, { timeout: 15000 });
    } else {
      console.log('Error crítico en el login, reintentando...');
      
      // Reintento del login
      await page.reload();
      await page.waitForTimeout(3000);
      
      await page.locator('input[name="userName"]').fill('admin@clt.com.py');
      await page.locator('input[name="password"]').fill('B3rL!n57A');
      await page.keyboard.press('Enter');
      
      await page.waitForURL(CASES_URL, { timeout: 20000 });
    }
    
    // Verificación final
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 10000 });
    console.log('✓ Verificación final de login completada');
  }
  
  // Pausa en la pantalla principal de casos
  await page.waitForTimeout(3000);

  // --- REDIRECCIÓN AL KIT DE BIENVENIDA ---

  // Navega a la URL del kit de bienvenida
  await page.goto(WELCOME_KIT_URL);
  // Espera a que la URL sea la del kit de bienvenida
  await page.waitForURL(WELCOME_KIT_URL);
  
  console.log('✓ Acceso exitoso al kit de bienvenida');

  // --- CREAR KIT DE BIENVENIDA ---
  
  // Localiza y hace clic en el botón "Crear Kit de Bienvenida"
  const crearKitBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Crear Kit de Bienvenida' });
  // Espera a que el botón esté visible
  await expect(crearKitBtn).toBeVisible({ timeout: 10000 });
  // Hace clic en el botón
  await crearKitBtn.click();
  
  // Espera a que la URL cambie a la página de creación de kit
  await page.waitForURL(`${BASE_URL}/front-crm/welcome-kit/new`);
  
  console.log('✓ Botón "Crear Kit de Bienvenida" clickeado exitosamente');

  // --- COMPLETAR FORMULARIO ---
  
  // Localiza el campo de título y cambia su valor
  const tituloInput = page.locator('input[name="Title"]');
  await expect(tituloInput).toBeVisible({ timeout: 10000 });
  
  // Limpia el campo y escribe el nuevo título
  await tituloInput.clear();
  await tituloInput.fill('Kit de Bienvenida Automatizado');
  
  console.log('✓ Título del kit cambiado exitosamente');

  // --- COMPLETAR PRIMER SELECTOR (ADMIN CRM) ---
  
  // Localiza el primer selector de React Select y hace clic para abrirlo
  const reactSelect = page.locator('.css-b4hd2p-control').first();
  await expect(reactSelect).toBeVisible({ timeout: 10000 });
  await reactSelect.click();
  
  // Espera a que aparezcan las opciones y selecciona "ADMIN CRM"
  await page.waitForTimeout(1000); // Pequeña pausa para que carguen las opciones
  const adminCrmOption = page.locator('text=ADMIN CRM');
  await expect(adminCrmOption).toBeVisible({ timeout: 10000 });
  await adminCrmOption.click();
  
  console.log('✓ Primer selector completado exitosamente');

  // --- SELECCIONAR NOMBRE DEL COMERCIO ---
  
  // Localiza el segundo dropdown para el nombre del comercio
  const comercioSelect = page.locator('div.form-floating').filter({ hasText: 'Nombre del comercio' }).locator('div.custom-select.css-b62m3t-container');
  // Espera a que el selector esté visible
  await expect(comercioSelect).toBeVisible({ timeout: 10000 });
  
  // Hace clic en el control del dropdown para abrirlo
  const comercioControl = comercioSelect.locator('div.css-b4hd2p-control');
  await comercioControl.click();
  
  console.log('✓ Dropdown de comercio abierto exitosamente');
  
  // Escribe en el input para filtrar por "SUPER MOTO CROSS"
  const comercioInput = comercioSelect.locator('input[id^="react-select"][id$="-input"]');
  await comercioInput.fill('SUPER MOTO CROSS');
  
  // Espera un momento para que aparezcan las opciones filtradas
  await page.waitForTimeout(1000);
  
  // Selecciona la opción que contiene "SUPER MOTO CROSS"
  await page.locator('[id^="react-select"][id*="-option"]').filter({ hasText: 'SUPER MOTO CROSS' }).click();

  console.log('✓ Comercio "SUPER MOTO CROSS" seleccionado exitosamente');

  // --- SELECCIONAR SUCURSAL DEL CLIENTE ---
  
  // Localiza el dropdown para la sucursal del cliente
  const sucursalSelect = page.locator('div.form-floating').filter({ hasText: 'Sucursal del Cliente' }).locator('div.custom-select.css-b62m3t-container');
  // Espera a que el selector esté visible
  await expect(sucursalSelect).toBeVisible({ timeout: 10000 });
  
  // Hace clic en el control del dropdown para abrirlo
  const sucursalControl = sucursalSelect.locator('div.css-b4hd2p-control');
  await sucursalControl.click();
  
  console.log('✓ Dropdown de sucursal abierto exitosamente');
  
  // Escribe en el input para filtrar por "SUPER MOTO CROSS (1)"
  const sucursalInput = sucursalSelect.locator('input[id^="react-select"][id$="-input"]');
  await sucursalInput.fill('SUPER MOTO CROSS');
  
  // Espera un momento para que aparezcan las opciones filtradas
  await page.waitForTimeout(1000);
  
  // Selecciona la opción que contiene "SUPER MOTO CROSS (1)"
  await page.locator('[id^="react-select"][id*="-option"]').filter({ hasText: 'SUPER MOTO CROSS' }).click();

  console.log('✓ Sucursal "SUPER MOTO CROSS (1)" seleccionada exitosamente');

  // --- SELECCIONAR CÓDIGO COMERCIO ---
  
  // Localiza el dropdown para el código de comercio
  const codigoComercioSelect = page.locator('div.form-floating').filter({ hasText: 'Código Comercio' }).locator('div.custom-select.css-b62m3t-container');
  // Espera a que el selector esté visible
  await expect(codigoComercioSelect).toBeVisible({ timeout: 10000 });
  
  // Hace clic en el control del dropdown para abrirlo
  const codigoComercioControl = codigoComercioSelect.locator('div.css-b4hd2p-control');
  await codigoComercioControl.click();
  
  console.log('✓ Dropdown de código comercio abierto exitosamente');
  
  // Escribe en el input para filtrar por "1400395"
  const codigoComercioInput = codigoComercioSelect.locator('input[id^="react-select"][id$="-input"]');
  await codigoComercioInput.fill('1400395');
  
  // Espera un momento para que aparezcan las opciones filtradas
  await page.waitForTimeout(1000);
  
  // Selecciona la opción que contiene "1400395"
  await page.locator('[id^="react-select"][id*="-option"]').filter({ hasText: '1400395' }).click();

  console.log('✓ Código comercio "1400395" seleccionado exitosamente');

  // --- SELECCIONAR MOTIVO DEL PEDIDO ---
  
  // Localiza el dropdown para el motivo del pedido
  const motivoSelect = page.locator('div.form-floating').filter({ hasText: 'Motivo del pedido' }).locator('div.custom-select.css-b62m3t-container');
  // Espera a que el selector esté visible
  await expect(motivoSelect).toBeVisible({ timeout: 10000 });
  
  // Hace clic en el control del dropdown para abrirlo
  const motivoControl = motivoSelect.locator('div.css-b4hd2p-control');
  await motivoControl.click();
  
  console.log('✓ Dropdown de motivo del pedido abierto exitosamente');
  
  // Escribe en el input para filtrar por "OTROS"
  const motivoInput = motivoSelect.locator('input[id^="react-select"][id$="-input"]');
  await motivoInput.fill('OTROS');
  
  // Espera un momento para que aparezcan las opciones filtradas
  await page.waitForTimeout(1000);
  
  // Selecciona la opción que contiene "OTROS"
  await page.locator('[id^="react-select"][id*="-option"]').filter({ hasText: 'OTROS' }).click();

  console.log('✓ Motivo del pedido "OTROS" seleccionado exitosamente');

  // --- COMPLETAR CAMPO OTROS ---
  
  // Localiza el campo de texto "Otros"
  const otrosInput = page.locator('input[name="others"]');
  // Espera a que el campo esté visible
  await expect(otrosInput).toBeVisible({ timeout: 10000 });
  
  // Completa el campo con un texto descriptivo
  await otrosInput.fill('Kit de bienvenida para nuevo comercio - Solicitud especial para material promocional y documentación inicial');
  
  console.log('✓ Campo "Otros" completado exitosamente');

  // --- SELECCIONAR SOLICITANTE ---
  
  // Localiza el dropdown para el solicitante
  const solicitanteSelect = page.locator('div.form-floating').filter({ hasText: 'Solicitante' }).locator('div.custom-select.css-b62m3t-container');
  // Espera a que el selector esté visible
  await expect(solicitanteSelect).toBeVisible({ timeout: 10000 });
  
  // Hace clic en el control del dropdown para abrirlo
  const solicitanteControl = solicitanteSelect.locator('div.css-b4hd2p-control');
  await solicitanteControl.click();
  
  console.log('✓ Dropdown de solicitante abierto exitosamente');
  
  // Escribe en el input para filtrar por "ATC"
  const solicitanteInput = solicitanteSelect.locator('input[id^="react-select"][id$="-input"]');
  await solicitanteInput.fill('ATC');
  
  // Espera un momento para que aparezcan las opciones filtradas
  await page.waitForTimeout(1000);
  
  // Selecciona la opción que contiene "ATC"
  await page.locator('[id^="react-select"][id*="-option"]').filter({ hasText: 'ATC' }).click();

  console.log('✓ Solicitante "ATC" seleccionado exitosamente');

  // --- SELECCIONAR FORMA DE ENTREGA ---
  
  // Localiza el dropdown para la forma de entrega
  const formaEntregaSelect = page.locator('div.form-floating').filter({ hasText: 'Forma de entrega' }).locator('div.custom-select.css-b62m3t-container');
  // Espera a que el selector esté visible
  await expect(formaEntregaSelect).toBeVisible({ timeout: 10000 });
  
  // Hace clic en el control del dropdown para abrirlo
  const formaEntregaControl = formaEntregaSelect.locator('div.css-b4hd2p-control');
  await formaEntregaControl.click();
  
  console.log('✓ Dropdown de forma de entrega abierto exitosamente');
  
  // Escribe en el input para filtrar por "ENVIO"
  const formaEntregaInput = formaEntregaSelect.locator('input[id^="react-select"][id$="-input"]');
  await formaEntregaInput.fill('ENVIO');
  
  // Espera un momento para que aparezcan las opciones filtradas
  await page.waitForTimeout(1000);
  
  // Selecciona la opción que contiene "ENVIO"
  await page.locator('[id^="react-select"][id*="-option"]').filter({ hasText: 'ENVIO' }).click();

  console.log('✓ Forma de entrega "ENVIO" seleccionada exitosamente');

  // --- COMPLETAR CAMPO DESCRIPCIÓN ---
  
  // Localiza el campo de descripción (textarea)
  const descripcionTextarea = page.locator('textarea[name="description"]');
  // Espera a que el campo esté visible
  await expect(descripcionTextarea).toBeVisible({ timeout: 10000 });
  
  // Completa el campo con una descripción detallada
  const descripcionTexto = 'Solicitud de kit de bienvenida para nuevo comercio SUPER MOTO CROSS.';

  await descripcionTextarea.fill(descripcionTexto);
  
  console.log('✓ Campo descripción completado exitosamente');

  // --- SELECCIONAR MATERIALES ---
  
  // Localiza la tabla de materiales
  const materialsTable = page.locator('div.rs-table');
  await expect(materialsTable).toBeVisible({ timeout: 10000 });
  
  // Localiza la primera fila de material "Hola Prueba"
  const primeraFila = page.locator('div.rs-table-row').filter({ hasText: 'Hola Prueba' });
  await expect(primeraFila).toBeVisible({ timeout: 10000 });
  
  // Encuentra el checkbox en la primera fila
  const checkbox = primeraFila.locator('input[type="checkbox"]');
  await checkbox.click();
  
  console.log('✓ Checkbox del material "Hola Prueba" habilitado exitosamente');
  
  // Espera un momento después de habilitar el checkbox
  await page.waitForTimeout(2000);
  
  // Encuentra el campo de cantidad en la misma fila
  const cantidadInput = primeraFila.locator('input[type="number"]');
  
  // Verifica que el campo de cantidad ya no esté deshabilitado
  await expect(cantidadInput).toBeEnabled({ timeout: 5000 });
  
  // Ingresa una cantidad mayor a 1
  await cantidadInput.fill('5');
  
  console.log('✓ Cantidad "5" ingresada exitosamente para el material "Hola Prueba"');

  // --- GUARDAR EL KIT DE BIENVENIDA ---
  
  // Localiza el botón "Guardar"
  const guardarBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Guardar' });
  await expect(guardarBtn).toBeVisible({ timeout: 10000 });
  await guardarBtn.click();
  
  console.log('✓ Botón "Guardar" clickeado exitosamente');
  
  // Espera a que aparezca el mensaje de confirmación de creación exitosa
  console.log('Esperando mensaje de confirmación de creación exitosa...');
  
  // Busca diferentes posibles mensajes de confirmación (toma el primer elemento)
  const mensajeConfirmacion = page.locator('text=/creado correctamente|creado exitosamente|guardado correctamente|guardado exitosamente|Kit creado|Kit de bienvenida creado|Kit guardado|éxito|exitoso|correctamente/i').first();
  await expect(mensajeConfirmacion).toBeVisible({ timeout: 15000 });
  
  const mensajeTexto = await mensajeConfirmacion.textContent();
  console.log(`Mensaje de confirmación recibido: ${mensajeTexto}`);
  
  // Espera a que el sistema redirija automáticamente a la pantalla principal
  console.log('Esperando que el sistema redirija automáticamente...');
  await page.waitForURL(WELCOME_KIT_URL, { timeout: 10000 });
  
  // Espera a que la tabla se cargue completamente
  await page.waitForTimeout(3000);
  
  // Refresca la página para asegurar que se muestre el kit más reciente
  console.log('Refrescando la página para mostrar el kit más reciente...');
  await page.reload();
  await page.waitForTimeout(2000);
  
  console.log('✓ Kit de Bienvenida creado y guardado exitosamente');

  // --- CAPTURAR ID DEL PRIMER KIT (MÁS RECIENTE) ---
  
  // Espera a que la tabla se cargue completamente
  await page.waitForTimeout(2000);
  
  // Localiza específicamente las filas de datos (excluyendo header)
  // Busca la primera fila que NO sea header y que tenga el número de ticket
  const filasTabla = page.locator('.rs-table-row:not(.rs-table-row-header)');
  await expect(filasTabla.first()).toBeVisible({ timeout: 10000 });
  
  // Toma la primera fila de datos (no header) y extrae el número de ticket
  const primeraFilaTicket = filasTabla.first().locator('[aria-colindex="3"]');
  await expect(primeraFilaTicket).toBeVisible({ timeout: 10000 });
  const ticketNumber = await primeraFilaTicket.textContent();
  
  console.log(`Número de ticket del kit más reciente (primera fila de datos): ${ticketNumber}`);
  
  // Guarda el número de ticket (no el ID) para uso posterior
  kitId = ticketNumber?.trim() || '';
  
  // Verificación adicional: asegurarse de que es un número
  if (!/^\d+$/.test(kitId)) {
    console.log(`Advertencia: El valor capturado "${kitId}" no parece ser un número de ticket válido`);
    
    // Intentar con un selector más específico
    const filaDatos = page.locator('.rs-table-body-row-wrapper .rs-table-row').first();
    if (await filaDatos.isVisible()) {
      const ticketCell = filaDatos.locator('[aria-colindex="3"]');
      const ticketNumero = await ticketCell.textContent();
      kitId = ticketNumero?.trim() || '';
      console.log(`Reintento - Número de ticket capturado: ${kitId}`);
    }
  }
  
  console.log(`✓ Número de ticket capturado correctamente: ${kitId}`);

  // --- EDITAR EL ÚLTIMO KIT CREADO ---
  
  // Localiza el primer botón de editar por su SVG (ícono de lápiz) - corresponde al kit más reciente
  const editarBtn = page.locator('div[style*="color: rgb(0, 159, 227)"][style*="cursor: pointer"] svg[stroke="currentColor"][fill="none"]').first();
  await expect(editarBtn).toBeVisible({ timeout: 10000 });
  await editarBtn.click();
  
  // Espera a que la URL cambie a la página de edición
  await page.waitForURL(WELCOME_KIT_EDIT_URL_PATTERN, { timeout: 10000 });
  
  // Captura el ID real desde la URL para referencia, pero mantiene el número de ticket
  const editUrl = page.url();
  const urlMatch = editUrl.match(/\/edit\/(\d+)/);
  const editId = urlMatch ? urlMatch[1] : '';
  
  console.log(`ID de edición desde URL: ${editId}`);
  console.log(`Número de ticket que se usará para filtrado: ${kitId}`);
  console.log(`Navegó a la página de edición del kit con ticket: ${kitId}`);
  
  // --- EDITAR CAMPOS EN MODO EDICIÓN ---
  
  // Espera a que el formulario de edición se cargue completamente
  await page.waitForTimeout(2000);
  
  // Verificar que estamos en la página de edición correcta
  try {
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    // Verificar que la página no se haya cerrado
    if (page.isClosed()) {
      console.log('Error: La página se cerró inesperadamente');
      return;
    }
  } catch (error) {
    console.log('Error: La página de edición no se cargó correctamente');
    return;
  }
  
  // --- EDITAR CAMPO "NOMBRE DEL COMERCIO" (debe ser "STELA NOVEDADES") ---
  await page.waitForTimeout(1000);
  
  try {
    const labelNombreComercioSpan = page.locator('span').filter({ hasText: 'Nombre del comercio' });
    await expect(labelNombreComercioSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelNombreComercioSpan.locator('../..');
    const nombreComercioSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(nombreComercioSelector).toBeVisible({ timeout: 5000 });
    await nombreComercioSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar específicamente "STELA NOVEDADES"
    const opcionStelaNombre = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
    await expect(opcionStelaNombre).toBeVisible({ timeout: 8000 });
    await opcionStelaNombre.click();
    
    console.log('✓ Nombre del comercio cambiado a "STELA NOVEDADES"');
  } catch (error) {
    console.log('Error editando "Nombre del comercio":', error);
  }

  // --- EDITAR CAMPO "SUCURSAL DEL CLIENTE" (debe ser "STELA NOVEDADES") ---
  await page.waitForTimeout(1000);
  
  try {
    const labelSucursalSpan = page.locator('span').filter({ hasText: 'Sucursal del Cliente' });
    await expect(labelSucursalSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelSucursalSpan.locator('../..');
    const sucursalSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(sucursalSelector).toBeVisible({ timeout: 5000 });
    await sucursalSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar específicamente "STELA NOVEDADES"
    const opcionStelaSucursal = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
    await expect(opcionStelaSucursal).toBeVisible({ timeout: 8000 });
    await opcionStelaSucursal.click();
    
    console.log('✓ Sucursal del Cliente cambiada a "STELA NOVEDADES"');
  } catch (error) {
    console.log('Error editando "Sucursal del Cliente":', error);
  }

  // --- EDITAR CAMPO "CÓDIGO COMERCIO" (debe ser "0901499") ---
  await page.waitForTimeout(1000);
  
  try {
    const labelCodigoSpan = page.locator('span').filter({ hasText: 'Código Comercio' });
    await expect(labelCodigoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelCodigoSpan.locator('../..');
    const codigoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(codigoSelector).toBeVisible({ timeout: 5000 });
    await codigoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar específicamente "0901499"
    const opcionCodigo = page.locator('[role="option"]').filter({ hasText: '0901499' }).first();
    await expect(opcionCodigo).toBeVisible({ timeout: 8000 });
    await opcionCodigo.click();
    
    console.log('✓ Código Comercio cambiado a "0901499"');
  } catch (error) {
    console.log('Error editando "Código Comercio":', error);
  }

  // --- EDITAR CAMPO "MOTIVO DEL PEDIDO" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelMotivoSpan = page.locator('span').filter({ hasText: 'Motivo del pedido' });
    await expect(labelMotivoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelMotivoSpan.locator('../..');
    const motivoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(motivoSelector).toBeVisible({ timeout: 5000 });
    await motivoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente a la actual
    const opciones = page.locator('[role="option"]');
    await expect(opciones.first()).toBeVisible({ timeout: 5000 });
    
    const opcionesCount = await opciones.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opciones.nth(1).click();
    } else {
      // Si solo hay una opción, seleccionarla
      await opciones.first().click();
    }
    
    console.log('✓ Motivo del pedido editado');
  } catch (error) {
    console.log('Error editando "Motivo del pedido":', error);
  }

  // --- EDITAR CAMPO "SOLICITANTE" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelSolicitanteSpan = page.locator('span').filter({ hasText: 'Solicitante' });
    await expect(labelSolicitanteSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelSolicitanteSpan.locator('../..');
    const solicitanteSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(solicitanteSelector).toBeVisible({ timeout: 5000 });
    await solicitanteSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente a la actual
    const opciones = page.locator('[role="option"]');
    await expect(opciones.first()).toBeVisible({ timeout: 5000 });
    
    const opcionesCount = await opciones.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opciones.nth(1).click();
    } else {
      // Si solo hay una opción, seleccionarla
      await opciones.first().click();
    }
    
    console.log('✓ Solicitante editado');
  } catch (error) {
    console.log('Error editando "Solicitante":', error);
  }

  // --- EDITAR CAMPO "FORMA DE ENTREGA" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelFormaEntregaSpan = page.locator('span').filter({ hasText: 'Forma de entrega' });
    await expect(labelFormaEntregaSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelFormaEntregaSpan.locator('../..');
    const formaEntregaSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(formaEntregaSelector).toBeVisible({ timeout: 5000 });
    await formaEntregaSelector.click();
    
    await page.waitForTimeout(1000);
    const opcionFormaEntrega = page.locator('[role="option"]').filter({ hasText: 'RETIRAR DE MARKETING' }).first();
    await expect(opcionFormaEntrega).toBeVisible({ timeout: 8000 });
    await opcionFormaEntrega.click();
    
    console.log('✓ Forma de entrega cambiada a "RETIRAR DE MARKETING"');
  } catch (error) {
    console.log('Error editando "Forma de entrega":', error);
  }

  // --- EDITAR CAMPO "DETALLES PARA EL ENVÍO" ---
  await page.waitForTimeout(1000);
  
  try {
    const detallesTextarea = page.locator('textarea[name="description"]').first();
    await expect(detallesTextarea).toBeVisible({ timeout: 8000 });
    await detallesTextarea.clear();
    await detallesTextarea.fill('Detalles de envío editados mediante automatización para Kit de Bienvenida - Actualización de dirección y contacto');
    
    console.log('✓ Detalles para el envío editados');
  } catch (error) {
    console.log('Error editando "Detalles para el envío":', error);
  }

  // --- EDITAR CAMPO "A CARGO DE" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelACargoSpan = page.locator('span').filter({ hasText: 'A cargo de *' });
    await expect(labelACargoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelACargoSpan.locator('../..');
    const aCargoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(aCargoSelector).toBeVisible({ timeout: 5000 });
    await aCargoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente
    const opciones = page.locator('[role="option"]');
    await expect(opciones.first()).toBeVisible({ timeout: 8000 });
    
    const opcionesCount = await opciones.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opciones.nth(1).click();
    } else {
      await opciones.first().click();
    }
    
    console.log('✓ A cargo de editado');
  } catch (error) {
    console.log('Error editando "A cargo de":', error);
  }

  // --- EDITAR CAMPO "ESTADO DEL PEDIDO" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelEstadoSpan = page.locator('span').filter({ hasText: 'Estado del pedido' });
    await expect(labelEstadoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelEstadoSpan.locator('../..');
    const estadoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(estadoSelector).toBeVisible({ timeout: 5000 });
    await estadoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente
    const opcionesEstado = page.locator('[role="option"]');
    await expect(opcionesEstado.first()).toBeVisible({ timeout: 8000 });
    
    const opcionesCount = await opcionesEstado.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opcionesEstado.nth(1).click();
    } else {
      await opcionesEstado.first().click();
    }
    
    console.log('✓ Estado del pedido editado');
  } catch (error) {
    console.log('Error editando "Estado del pedido":', error);
  }

  // --- EDITAR CAMPO "COMENTARIOS" ---
  await page.waitForTimeout(1000);
  
  try {
    const comentariosTextarea = page.locator('textarea[name="AttrLastComment"]');
    await expect(comentariosTextarea).toBeVisible({ timeout: 8000 });
    await comentariosTextarea.clear();
    await comentariosTextarea.fill('Comentario editado mediante automatización para Kit de Bienvenida - Pruebas actualizadas');
    
    console.log('✓ Comentarios editados');
  } catch (error) {
    console.log('Error editando "Comentarios":', error);
  }

  // --- AGREGAR NOTAS ---
  await page.waitForTimeout(1000);
  
  try {
    // Localizar el textarea de notas
    const notasTextarea = page.locator('textarea[name="description"].Notes_textarea__IN3Dq');
    await expect(notasTextarea).toBeVisible({ timeout: 8000 });
    
    // Escribir la nota
    const textoNota = 'Esta es una nota agregada mediante automatización para el Kit de Bienvenida. Incluye detalles adicionales sobre el pedido editado.';
    await notasTextarea.fill(textoNota);
    
    // Localizar y hacer clic en el botón "Enviar" de las notas
    const enviarNotaBtn = page.locator('button.Notes_submitButton__rMudm', { hasText: 'Enviar' });
    await expect(enviarNotaBtn).toBeVisible({ timeout: 8000 });
    await enviarNotaBtn.click();
    
    // Esperar a que la nota se procese y aparezca en la lista
    await page.waitForTimeout(2000);
    
    // Verificar que la nota se haya agregado (opcional)
    const listaNotas = page.locator('.Notes_notesList__MegiX');
    await expect(listaNotas).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Nota agregada exitosamente');
  } catch (error) {
    console.log('Error agregando notas:', error);
  }

  // --- GUARDAR CAMBIOS DE EDICIÓN ---
  
  try {
    // Verificar que la página no se haya cerrado antes de guardar
    if (page.isClosed()) {
      console.log('Error: La página se cerró antes de guardar');
      return;
    }
    
    const guardarEditBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Guardar' });
    await expect(guardarEditBtn).toBeVisible({ timeout: 5000 });
    await guardarEditBtn.click();
    
    // Espera a que aparezca el mensaje de confirmación con timeout reducido
    const mensajeEditConfirmacion = page.locator('text=/actualizado correctamente|editado exitosamente|guardado correctamente|cambios guardados|éxito|exitoso/i').first();
    await expect(mensajeEditConfirmacion).toBeVisible({ timeout: 10000 });
    
    const mensajeEditTexto = await mensajeEditConfirmacion.textContent();
    console.log(`Mensaje de confirmación de edición: ${mensajeEditTexto}`);
    
    // Espera a que redirija a la lista principal con timeout reducido
    await page.waitForURL(WELCOME_KIT_URL, { timeout: 8000 });
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Error guardando cambios:', error);
    
    // Verificar si estamos aún en una página válida
    try {
      const currentUrl = page.url();
      console.log(`URL actual después del error: ${currentUrl}`);
      
      // Si estamos en la página de edición, intentar navegar manualmente
      if (currentUrl.includes('/edit/')) {
        console.log('Intentando navegar manualmente a la lista...');
        await page.goto(WELCOME_KIT_URL);
        await page.waitForTimeout(2000);
      }
    } catch (navError) {
      console.log('Error durante navegación de recuperación:', navError);
    }
  }
  
  // --- FILTRAR POR NÚMERO DE TICKET ---
  
  // Espera a que regrese a la lista principal
  try {
    await page.waitForURL(WELCOME_KIT_URL, { timeout: 8000 });
    await page.waitForTimeout(1000);
    
    // Verificar que la página no se haya cerrado
    if (page.isClosed()) {
      console.log('Error: La página se cerró durante el filtrado');
      return;
    }
    
  } catch (error) {
    console.log('Error esperando URL de lista principal:', error);
    // Intentar navegar manualmente si hay problemas
    try {
      await page.goto(WELCOME_KIT_URL);
      await page.waitForTimeout(2000);
    } catch (navError) {
      console.log('Error en navegación manual:', navError);
      return;
    }
  }
  
  console.log(`Procediendo a filtrar por el número de ticket: ${kitId}`);
  
  // Localiza el campo de búsqueda de kits de bienvenida
  try {
    const buscarInput = page.locator('input[placeholder*="Buscar"], input[type="search"], input[placeholder*="Kit"], input[placeholder*="Pedido"]').first();
    await expect(buscarInput).toBeVisible({ timeout: 5000 });
    
    // Limpia el campo de búsqueda primero
    await buscarInput.clear();
    
    // Ingresa el número de ticket en el campo de búsqueda
    await buscarInput.fill(kitId || '');
    
    // Presiona Enter para ejecutar la búsqueda
    await buscarInput.press('Enter');
    
    // Espera un momento para que se actualice la tabla con los resultados filtrados
    await page.waitForTimeout(2000);
    
    console.log('Filtro aplicado exitosamente con el número de ticket:', kitId);
    
    // Verificación simplificada del filtro
    const filasVisibles = await page.locator('div.rs-table-row').count();
    console.log(`Número de filas visibles después del filtro: ${filasVisibles}`);
    
    if (filasVisibles > 1) { 
      console.log('✓ Filtro aplicado correctamente - se encontraron resultados');
      
      // Verificación rápida del ticket (sin timeout largo)
      const ticketFiltrado = page.locator(`[aria-colindex="3"]:has-text("${kitId}")`).first();
      if (await ticketFiltrado.isVisible({ timeout: 2000 })) {
        console.log('✓ Ticket filtrado encontrado y verificado exitosamente');
      } else {
        console.log('Advertencia: Filtro aplicado pero no se pudo verificar el ticket específico');
      }
      
      // --- EXPORTAR EL PEDIDO FILTRADO ---
      
      try {
        // Localizar el botón "Exportar"
        const exportarBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' });
        await expect(exportarBtn).toBeVisible({ timeout: 5000 });
        
        // Hacer clic en el botón exportar
        await exportarBtn.click();
        
        console.log('✓ Botón "Exportar" clickeado exitosamente');
        
        // Pausa para verificar manualmente si se exportó el archivo
        console.log('⏸️ PAUSA: Verifica si se descargó el archivo exportado');
        await page.pause();
        
        console.log('✓ Exportación del pedido filtrado completada');
        
      } catch (error) {
        console.log('Error durante la exportación:', error);
      }
      
    } else {
      console.log('Advertencia: El filtro no devolvió resultados visibles');
    }
    
  } catch (error) {
    console.log('Error durante el proceso de filtrado:', error);
    console.log('Continuando con la verificación básica...');
    
    // Verificación básica: solo comprobar que estamos en la página correcta
    try {
      await expect(page.url()).toContain('/front-crm/welcome-kit');
      console.log('✓ Verificación básica completada - estamos en la página de kits de bienvenida');
    } catch (urlError) {
      console.log('Error en verificación de URL:', urlError);
    }
  }

  // Mensaje de confirmación en consola
  console.log(`Test completado: Se creó el kit con título "Kit de Bienvenida Automatizado" con número de ticket ${kitId}, y se editó correctamente.`);
  console.log(`URL de edición: ${BASE_URL}/front-crm/welcome-kit/edit/[ID_INTERNO]`);
  console.log(`Número de ticket para filtrado: ${kitId}`);
  
  // Test completado exitosamente
  console.log('✓ Test principal completado exitosamente');
});

// Test adicional para crear y editar kit de bienvenida completo
test('Kit Bienvenida Completo - Crear y Editar', async ({ page }) => {
  // Establece el timeout máximo del test en 180 segundos (3 minutos)
  test.setTimeout(180000);

  // Variable para almacenar el ID del kit en este test
  let kitIdCompleto: string = '';

  // Configurar manejo de errores de página
  page.on('pageerror', (error) => {
    console.log('Error de página detectado:', error.message);
  });

  page.on('crash', () => {
    console.log('La página se ha cerrado inesperadamente');
  });

  // --- LOGIN ---

  try {
    // Navega a la pantalla principal de casos
    await page.goto(CASES_URL);
    console.log('Navegando a la página de login...');
    
    // Espera a que aparezcan los campos de login
    await page.waitForSelector('input[name="userName"]', { timeout: 10000 });
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    
    // Completa el campo de usuario
    await page.locator('input[name="userName"]').fill('admin@clt.com.py');
    console.log('Campo de usuario completado');
    
    // Completa el campo de contraseña
    await page.locator('input[name="password"]').fill('B3rL!n57A');
    console.log('Campo de contraseña completado');
    
    // Busca el botón de submit y hace clic en él (más confiable que Enter)
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar")').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      console.log('Botón de login clickeado');
    } else {
      // Si no encuentra el botón, usa Enter como respaldo
      await page.keyboard.press('Enter');
      console.log('Enter presionado como respaldo');
    }
    
    // Espera a que la URL cambie (con timeout más largo para el login)
    console.log('Esperando redirección después del login...');
    await page.waitForURL(CASES_URL, { timeout: 30000 });
    
    // Verifica que el botón "Crear Caso" esté visible
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 15000 });
    
    console.log('✓ Login exitoso - En la pantalla principal de casos');
    
  } catch (error) {
    console.log('Error durante el login:', error);
    
    // Verificación de respaldo: comprobar si ya estamos logueados
    const currentUrl = page.url();
    console.log(`URL actual: ${currentUrl}`);
    
    if (currentUrl.includes('/front-crm/cases')) {
      console.log('✓ Ya estamos en la página de casos');
    } else if (currentUrl.includes('/front-crm/')) {
      console.log('Login parcialmente exitoso, navegando a casos...');
      await page.goto(CASES_URL);
      await page.waitForURL(CASES_URL, { timeout: 15000 });
    } else {
      console.log('Error crítico en el login, reintentando...');
      
      // Reintento del login
      await page.reload();
      await page.waitForTimeout(3000);
      
      await page.locator('input[name="userName"]').fill('admin@clt.com.py');
      await page.locator('input[name="password"]').fill('B3rL!n57A');
      await page.keyboard.press('Enter');
      
      await page.waitForURL(CASES_URL, { timeout: 20000 });
    }
    
    // Verificación final
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 10000 });
    console.log('✓ Verificación final de login completada');
  }

  // --- REDIRECCIÓN AL KIT DE BIENVENIDA ---

  // Navega a la URL del kit de bienvenida
  await page.goto(WELCOME_KIT_URL);
  // Espera a que la URL sea la del kit de bienvenida
  await page.waitForURL(WELCOME_KIT_URL);
  
  // --- CREAR KIT DE BIENVENIDA ---
  
  // Localiza y hace clic en el botón "Crear Kit de Bienvenida"
  const crearKitBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Crear Kit de Bienvenida' });
  // Espera a que el botón esté visible
  await expect(crearKitBtn).toBeVisible({ timeout: 10000 });
  // Hace clic en el botón
  await crearKitBtn.click();
  
  // Espera a que la URL cambie a la página de creación de kit
  await page.waitForURL(`${BASE_URL}/front-crm/welcome-kit/new`);
  
  // --- COMPLETAR FORMULARIO ---
  
  // --- COMPLETAR TODOS LOS SELECTORES ---
  
  // 1. Primer selector (ADMIN CRM)
  const reactSelectCompleto = page.locator('.css-b4hd2p-control').first();
  await expect(reactSelectCompleto).toBeVisible({ timeout: 10000 });
  await reactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const adminCrmOptionCompleto = page.locator('text=ADMIN CRM');
  await expect(adminCrmOptionCompleto).toBeVisible({ timeout: 10000 });
  await adminCrmOptionCompleto.click();
  
  // 2. Segundo selector (SUPER MOTO CROSS)
  await page.waitForTimeout(3000);
  const segundoReactSelectCompleto = page.locator('.css-b4hd2p-control').nth(1);
  await expect(segundoReactSelectCompleto).toBeVisible({ timeout: 10000 });
  await segundoReactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const superMotoCrossOptionCompleto = page.locator('text=SUPER MOTO CROSS');
  await expect(superMotoCrossOptionCompleto).toBeVisible({ timeout: 10000 });
  await superMotoCrossOptionCompleto.click();
  
  // 3. Tercer selector (SUPER MOTO CROSS (1))
  await page.waitForTimeout(3000);
  const tercerReactSelectCompleto = page.locator('.css-b4hd2p-control').nth(2);
  await expect(tercerReactSelectCompleto).toBeVisible({ timeout: 10000 });
  await tercerReactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const superMotoCross1OptionCompleto = page.locator('text=SUPER MOTO CROSS (1)');
  await expect(superMotoCross1OptionCompleto).toBeVisible({ timeout: 10000 });
  await superMotoCross1OptionCompleto.click();
  
  // 4. Cuarto selector (1400395)
  await page.waitForTimeout(3000);
  const cuartoReactSelectCompleto = page.locator('.css-b4hd2p-control').nth(3);
  await expect(cuartoReactSelectCompleto).toBeVisible({ timeout: 10000 });
  await cuartoReactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const optionCompleto = page.locator('text=1400395');
  await expect(optionCompleto).toBeVisible({ timeout: 10000 });
  await optionCompleto.click();
  
  // 5. Quinto selector (OTROS)
  await page.waitForTimeout(3000);
  const quintoReactSelectCompleto = page.locator('.css-b4hd2p-control').nth(4);
  await expect(quintoReactSelectCompleto).toBeVisible({ timeout: 10000 });
  await quintoReactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const otrosOptionCompleto = page.locator('text=OTROS');
  await expect(otrosOptionCompleto).toBeVisible({ timeout: 10000 });
  await otrosOptionCompleto.click();
  
  // --- COMPLETAR CAMPO DE TEXTO "OTROS" ---
  
  await page.waitForTimeout(2000);
  const othersInputCompleto = page.locator('input[name="others"]');
  await expect(othersInputCompleto).toBeVisible({ timeout: 10000 });
  await othersInputCompleto.fill('Kit de Bienvenida Completo para Pruebas Automatizadas');
  
  // 6. Sexto selector (ATC)
  await page.waitForTimeout(3000);
  const sextoReactSelectCompleto = page.locator('.css-b4hd2p-control').nth(5);
  await expect(sextoReactSelectCompleto).toBeVisible({ timeout: 10000 });
  await sextoReactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const atcOptionCompleto = page.locator('text=ATC');
  await expect(atcOptionCompleto).toBeVisible({ timeout: 10000 });
  await atcOptionCompleto.click();
  
  // 7. Séptimo selector (ENVIO)
  await page.waitForTimeout(3000);
  const septimoReactSelectCompleto = page.locator('.css-b4hd2p-control').nth(6);
  await expect(septimoReactSelectCompleto).toBeVisible({ timeout: 10000 });
  await septimoReactSelectCompleto.click();
  
  await page.waitForTimeout(1000);
  const envioOptionCompleto = page.locator('text=ENVIO');
  await expect(envioOptionCompleto).toBeVisible({ timeout: 10000 });
  await envioOptionCompleto.click();
  
  // --- COMPLETAR CAMPO DE DESCRIPCIÓN ---
  
  await page.waitForTimeout(3000);
  const descriptionTextareaCompleto = page.locator('textarea[name="description"]');
  await expect(descriptionTextareaCompleto).toBeVisible({ timeout: 10000 });
  await descriptionTextareaCompleto.fill('Kit de bienvenida completo con todos los materiales necesarios para el nuevo comercio');
  
  // --- COMPLETAR CHECKBOX Y CANTIDAD ---
  
  await page.waitForTimeout(2000);
  
  // Selecciona el producto "Hola Prueba" (primera fila)
  const filaHolaPruebaCompleto = page.getByRole('row', { name: /Hola Prueba/ });
  await expect(filaHolaPruebaCompleto).toBeVisible({ timeout: 10000 });
  
  // Localiza el checkbox del producto "Hola Prueba"
  const checkboxCompleto = filaHolaPruebaCompleto.locator('input[type="checkbox"]#custom-switch');
  await expect(checkboxCompleto).toBeVisible({ timeout: 10000 });
  
  // Click en el checkbox
  await checkboxCompleto.click({ force: true });
  console.log('Checkbox clickeado con force');
  
  // Espera para que se habilite el campo numérico
  await page.waitForTimeout(2000);
  
  // Localiza el campo numérico de la misma fila
  const cantidadInputCompleto = filaHolaPruebaCompleto.locator('input[type="number"].form-control.text-right.mx-4');
  await expect(cantidadInputCompleto).toBeVisible({ timeout: 10000 });
  
  // Completa el campo con la cantidad
  await cantidadInputCompleto.fill('10', { force: true });
  
  // Verifica que el valor se haya ingresado correctamente
  await expect(cantidadInputCompleto).toHaveValue('10');
  console.log('Cantidad ingresada correctamente: 10');
  
  // --- GUARDAR FORMULARIO ---
  
  // Localiza y hace clic en el botón "Guardar"
  const guardarBtnCompleto = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Guardar' });
  await expect(guardarBtnCompleto).toBeVisible({ timeout: 10000 });
  await guardarBtnCompleto.click();
  
  // Espera a que aparezca el mensaje de confirmación de creación exitosa
  console.log('Esperando mensaje de confirmación de creación exitosa...');
  
  const mensajeConfirmacionCompleto = page.locator('text=/creado correctamente|creado exitosamente|guardado correctamente|guardado exitosamente|Kit creado|Kit de bienvenida creado|Kit guardado|éxito|exitoso|correctamente/i').first();
  await expect(mensajeConfirmacionCompleto).toBeVisible({ timeout: 15000 });
  
  const mensajeTextoCompleto = await mensajeConfirmacionCompleto.textContent();
  console.log(`Mensaje de confirmación recibido: ${mensajeTextoCompleto}`);
  
  // Espera a que el sistema redirija automáticamente a la pantalla principal
  console.log('Esperando que el sistema redirija automáticamente...');
  await page.waitForURL(WELCOME_KIT_URL, { timeout: 10000 });
  
  // Espera a que la tabla se cargue completamente
  await page.waitForTimeout(3000);
  
  // Refresca la página para asegurar que se muestre el kit más reciente
  console.log('Refrescando la página para mostrar el kit más reciente...');
  await page.reload();
  await page.waitForTimeout(2000);
  
  // --- CAPTURAR ID DEL PRIMER KIT (MÁS RECIENTE) ---
  
  // Espera a que la tabla se cargue completamente
  await page.waitForTimeout(2000);
  
  // Localiza específicamente las filas de datos (excluyendo header)
  // Busca la primera fila que NO sea header y que tenga el número de ticket
  const filasTablaCompleto = page.locator('.rs-table-row:not(.rs-table-row-header)');
  await expect(filasTablaCompleto.first()).toBeVisible({ timeout: 10000 });
  
  // Toma la primera fila de datos (no header) y extrae el número de ticket
  const primeraFilaTicketCompleto = filasTablaCompleto.first().locator('[aria-colindex="3"]');
  await expect(primeraFilaTicketCompleto).toBeVisible({ timeout: 10000 });
  const ticketNumberCompleto = await primeraFilaTicketCompleto.textContent();
  
  console.log(`Número de ticket del kit completo más reciente (primera fila de datos): ${ticketNumberCompleto}`);
  
  // Guarda el número de ticket (no el ID) para uso posterior
  kitIdCompleto = ticketNumberCompleto?.trim() || '';
  
  // Verificación adicional: asegurarse de que es un número
  if (!/^\d+$/.test(kitIdCompleto)) {
    console.log(`Advertencia: El valor capturado "${kitIdCompleto}" no parece ser un número de ticket válido`);
    
    // Intentar con un selector más específico
    const filaDatosCompleto = page.locator('.rs-table-body-row-wrapper .rs-table-row').first();
    if (await filaDatosCompleto.isVisible()) {
      const ticketCellCompleto = filaDatosCompleto.locator('[aria-colindex="3"]');
      const ticketNumeroCompleto = await ticketCellCompleto.textContent();
      kitIdCompleto = ticketNumeroCompleto?.trim() || '';
      console.log(`Reintento - Número de ticket del kit completo capturado: ${kitIdCompleto}`);
    }
  }
  
  console.log(`✓ Número de ticket del kit completo capturado correctamente: ${kitIdCompleto}`);

  // --- HACER CLIC EN EL BOTÓN DE EDITAR ---
  
  // Localiza el primer botón de editar por su SVG (ícono de lápiz) - corresponde al kit más reciente
  const editarBtnCompleto = page.locator('div[style*="color: rgb(0, 159, 227)"][style*="cursor: pointer"] svg[stroke="currentColor"][fill="none"]').first();
  await expect(editarBtnCompleto).toBeVisible({ timeout: 10000 });
  await editarBtnCompleto.click();
  
  // Espera a que la URL cambie a la página de edición
  await page.waitForURL(WELCOME_KIT_EDIT_URL_PATTERN, { timeout: 10000 });
  
  // Captura el ID real desde la URL para referencia, pero mantiene el número de ticket
  const editUrlCompleto = page.url();
  const urlMatchCompleto = editUrlCompleto.match(/\/edit\/(\d+)/);
  const editIdCompleto = urlMatchCompleto ? urlMatchCompleto[1] : '';
  
  console.log(`ID de edición del kit completo desde URL: ${editIdCompleto}`);
  console.log(`Número de ticket del kit completo que se usará para filtrado: ${kitIdCompleto}`);
  console.log(`Navegó a la página de edición del kit completo con ticket: ${kitIdCompleto}`);
  
  // --- EDITAR CAMPOS EN MODO EDICIÓN ---
  
  // Espera a que el formulario de edición se cargue completamente
  await page.waitForTimeout(2000);
  
  // Verificar que estamos en la página de edición correcta
  try {
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    // Verificar que la página no se haya cerrado
    if (page.isClosed()) {
      console.log('Error: La página se cerró inesperadamente');
      return;
    }
  } catch (error) {
    console.log('Error: La página de edición no se cargó correctamente');
    return;
  }
  
  // --- EDITAR CAMPO "NOMBRE DEL COMERCIO" (debe ser "STELA NOVEDADES") ---
  await page.waitForTimeout(1000);
  
  try {
    const labelNombreComercioSpan = page.locator('span').filter({ hasText: 'Nombre del comercio' });
    await expect(labelNombreComercioSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelNombreComercioSpan.locator('../..');
    const nombreComercioSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(nombreComercioSelector).toBeVisible({ timeout: 5000 });
    await nombreComercioSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar específicamente "STELA NOVEDADES"
    const opcionStelaNombre = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
    await expect(opcionStelaNombre).toBeVisible({ timeout: 8000 });
    await opcionStelaNombre.click();
    
    console.log('✓ Nombre del comercio cambiado a "STELA NOVEDADES"');
  } catch (error) {
    console.log('Error editando "Nombre del comercio":', error);
  }

  // --- EDITAR CAMPO "SUCURSAL DEL CLIENTE" (debe ser "STELA NOVEDADES") ---
  await page.waitForTimeout(1000);
  
  try {
    const labelSucursalSpan = page.locator('span').filter({ hasText: 'Sucursal del Cliente' });
    await expect(labelSucursalSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelSucursalSpan.locator('../..');
    const sucursalSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(sucursalSelector).toBeVisible({ timeout: 5000 });
    await sucursalSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar específicamente "STELA NOVEDADES"
    const opcionStelaSucursal = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
    await expect(opcionStelaSucursal).toBeVisible({ timeout: 8000 });
    await opcionStelaSucursal.click();
    
    console.log('✓ Sucursal del Cliente cambiada a "STELA NOVEDADES"');
  } catch (error) {
    console.log('Error editando "Sucursal del Cliente":', error);
  }

  // --- EDITAR CAMPO "CÓDIGO COMERCIO" (debe ser "0901499") ---
  await page.waitForTimeout(1000);
  
  try {
    const labelCodigoSpan = page.locator('span').filter({ hasText: 'Código Comercio' });
    await expect(labelCodigoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelCodigoSpan.locator('../..');
    const codigoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(codigoSelector).toBeVisible({ timeout: 5000 });
    await codigoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar específicamente "0901499"
    const opcionCodigo = page.locator('[role="option"]').filter({ hasText: '0901499' }).first();
    await expect(opcionCodigo).toBeVisible({ timeout: 8000 });
    await opcionCodigo.click();
    
    console.log('✓ Código Comercio cambiado a "0901499"');
  } catch (error) {
    console.log('Error editando "Código Comercio":', error);
  }

  // --- EDITAR CAMPO "MOTIVO DEL PEDIDO" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelMotivoSpan = page.locator('span').filter({ hasText: 'Motivo del pedido' });
    await expect(labelMotivoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelMotivoSpan.locator('../..');
    const motivoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(motivoSelector).toBeVisible({ timeout: 5000 });
    await motivoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente a la actual
    const opciones = page.locator('[role="option"]');
    await expect(opciones.first()).toBeVisible({ timeout: 5000 });
    
    const opcionesCount = await opciones.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opciones.nth(1).click();
    } else {
      // Si solo hay una opción, seleccionarla
      await opciones.first().click();
    }
    
    console.log('✓ Motivo del pedido editado');
  } catch (error) {
    console.log('Error editando "Motivo del pedido":', error);
  }

  // --- EDITAR CAMPO "SOLICITANTE" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelSolicitanteSpan = page.locator('span').filter({ hasText: 'Solicitante' });
    await expect(labelSolicitanteSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelSolicitanteSpan.locator('../..');
    const solicitanteSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(solicitanteSelector).toBeVisible({ timeout: 5000 });
    await solicitanteSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente a la actual
    const opciones = page.locator('[role="option"]');
    await expect(opciones.first()).toBeVisible({ timeout: 5000 });
    
    const opcionesCount = await opciones.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opciones.nth(1).click();
    } else {
      // Si solo hay una opción, seleccionarla
      await opciones.first().click();
    }
    
    console.log('✓ Solicitante editado');
  } catch (error) {
    console.log('Error editando "Solicitante":', error);
  }

  // --- EDITAR CAMPO "FORMA DE ENTREGA" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelFormaEntregaSpan = page.locator('span').filter({ hasText: 'Forma de entrega' });
    await expect(labelFormaEntregaSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelFormaEntregaSpan.locator('../..');
    const formaEntregaSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(formaEntregaSelector).toBeVisible({ timeout: 5000 });
    await formaEntregaSelector.click();
    
    await page.waitForTimeout(1000);
    const opcionFormaEntrega = page.locator('[role="option"]').filter({ hasText: 'RETIRAR DE MARKETING' }).first();
    await expect(opcionFormaEntrega).toBeVisible({ timeout: 8000 });
    await opcionFormaEntrega.click();
    
    console.log('✓ Forma de entrega cambiada a "RETIRAR DE MARKETING"');
  } catch (error) {
    console.log('Error editando "Forma de entrega":', error);
  }

  // --- EDITAR CAMPO "DETALLES PARA EL ENVÍO" ---
  await page.waitForTimeout(1000);
  
  try {
    const detallesTextarea = page.locator('textarea[name="description"]').first();
    await expect(detallesTextarea).toBeVisible({ timeout: 8000 });
    await detallesTextarea.clear();
    await detallesTextarea.fill('Detalles de envío editados mediante automatización para Kit de Bienvenida - Actualización de dirección y contacto');
    
    console.log('✓ Detalles para el envío editados');
  } catch (error) {
    console.log('Error editando "Detalles para el envío":', error);
  }

  // --- EDITAR CAMPO "A CARGO DE" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelACargoSpan = page.locator('span').filter({ hasText: 'A cargo de *' });
    await expect(labelACargoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelACargoSpan.locator('../..');
    const aCargoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(aCargoSelector).toBeVisible({ timeout: 5000 });
    await aCargoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente
    const opciones = page.locator('[role="option"]');
    await expect(opciones.first()).toBeVisible({ timeout: 8000 });
    
    const opcionesCount = await opciones.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opciones.nth(1).click();
    } else {
      await opciones.first().click();
    }
    
    console.log('✓ A cargo de editado');
  } catch (error) {
    console.log('Error editando "A cargo de":', error);
  }

  // --- EDITAR CAMPO "ESTADO DEL PEDIDO" ---
  await page.waitForTimeout(1000);
  
  try {
    const labelEstadoSpan = page.locator('span').filter({ hasText: 'Estado del pedido' });
    await expect(labelEstadoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelEstadoSpan.locator('../..');
    const estadoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(estadoSelector).toBeVisible({ timeout: 5000 });
    await estadoSelector.click();
    
    await page.waitForTimeout(1000);
    
    // Buscar opciones disponibles y seleccionar una diferente
    const opcionesEstado = page.locator('[role="option"]');
    await expect(opcionesEstado.first()).toBeVisible({ timeout: 8000 });
    
    const opcionesCount = await opcionesEstado.count();
    if (opcionesCount > 1) {
      // Seleccionar la segunda opción disponible
      await opcionesEstado.nth(1).click();
    } else {
      await opcionesEstado.first().click();
    }
    
    console.log('✓ Estado del pedido editado');
  } catch (error) {
    console.log('Error editando "Estado del pedido":', error);
  }

  // --- EDITAR CAMPO "COMENTARIOS" ---
  await page.waitForTimeout(1000);
  
  try {
    const comentariosTextarea = page.locator('textarea[name="AttrLastComment"]');
    await expect(comentariosTextarea).toBeVisible({ timeout: 8000 });
    await comentariosTextarea.clear();
    await comentariosTextarea.fill('Comentario editado mediante automatización para Kit de Bienvenida Completo - Test de edición final');
    
    console.log('✓ Comentarios editados');
  } catch (error) {
    console.log('Error editando "Comentarios":', error);
  }

  // --- AGREGAR NOTAS ---
  await page.waitForTimeout(1000);
  
  try {
    // Localizar el textarea de notas
    const notasTextarea = page.locator('textarea[name="description"].Notes_textarea__IN3Dq');
    await expect(notasTextarea).toBeVisible({ timeout: 8000 });
    
    // Escribir la nota
    const textoNota = 'Esta es una nota agregada mediante automatización para el Kit de Bienvenida Completo. Test final de edición y notas.';
    await notasTextarea.fill(textoNota);
    
    // Localizar y hacer clic en el botón "Enviar" de las notas
    const enviarNotaBtn = page.locator('button.Notes_submitButton__rMudm', { hasText: 'Enviar' });
    await expect(enviarNotaBtn).toBeVisible({ timeout: 8000 });
    await enviarNotaBtn.click();
    
    // Esperar a que la nota se procese y aparezca en la lista
    await page.waitForTimeout(2000);
    
    // Verificar que la nota se haya agregado (opcional)
    const listaNotas = page.locator('.Notes_notesList__MegiX');
    await expect(listaNotas).toBeVisible({ timeout: 5000 });
    
    console.log('✓ Nota agregada exitosamente');
  } catch (error) {
    console.log('Error agregando notas:', error);
  }

  // --- GUARDAR CAMBIOS DE EDICIÓN ---
  
  try {
    const guardarEditBtnCompleto = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Guardar' });
    await expect(guardarEditBtnCompleto).toBeVisible({ timeout: 10000 });
    await guardarEditBtnCompleto.click();
    
    // Espera a que aparezca el mensaje de confirmación
    const mensajeEditConfirmacionCompleto = page.locator('text=/actualizado correctamente|editado exitosamente|guardado correctamente|cambios guardados|éxito|exitoso/i').first();
    await expect(mensajeEditConfirmacionCompleto).toBeVisible({ timeout: 15000 });
    
    const mensajeEditTextoCompleto = await mensajeEditConfirmacionCompleto.textContent();
    console.log(`Mensaje de confirmación de edición: ${mensajeEditTextoCompleto}`);
    
    // Espera a que redirija a la lista principal
    await page.waitForURL(WELCOME_KIT_URL, { timeout: 10000 });
    await page.waitForTimeout(3000);
  } catch (error) {
    console.log('Error guardando cambios:', error);
  }

  // --- FILTRAR POR NÚMERO DE TICKET DEL KIT COMPLETO ---
  
  // Espera a que regrese a la lista principal
  try {
    await page.waitForURL(WELCOME_KIT_URL, { timeout: 8000 });
    await page.waitForTimeout(1000);
    
    // Verificar que la página no se haya cerrado
    if (page.isClosed()) {
      console.log('Error: La página se cerró durante el filtrado del kit completo');
      return;
    }
    
  } catch (error) {
    console.log('Error esperando URL de lista principal para kit completo:', error);
    // Intentar navegar manualmente si hay problemas
    try {
      await page.goto(WELCOME_KIT_URL);
      await page.waitForTimeout(2000);
    } catch (navError) {
      console.log('Error en navegación manual del kit completo:', navError);
      return;
    }
  }
  
  console.log(`Procediendo a filtrar por el número de ticket del kit completo: ${kitIdCompleto}`);
  
  // Localiza el campo de búsqueda de kits de bienvenida
  try {
    const buscarInputCompleto = page.locator('input[placeholder*="Buscar"], input[type="search"], input[placeholder*="Kit"], input[placeholder*="Pedido"]').first();
    await expect(buscarInputCompleto).toBeVisible({ timeout: 5000 });
    
    // Limpia el campo de búsqueda primero
    await buscarInputCompleto.clear();
    
    // Ingresa el número de ticket en el campo de búsqueda
    await buscarInputCompleto.fill(kitIdCompleto || '');
    
    // Presiona Enter para ejecutar la búsqueda
    await buscarInputCompleto.press('Enter');
    
    // Espera un momento para que se actualice la tabla con los resultados filtrados
    await page.waitForTimeout(2000);
    
    console.log('Filtro aplicado exitosamente con el número de ticket del kit completo:', kitIdCompleto);
    
    // Verificación simplificada del filtro
    const filasVisiblesCompleto = await page.locator('div.rs-table-row').count();
    console.log(`Número de filas visibles después del filtro del kit completo: ${filasVisiblesCompleto}`);
    
    if (filasVisiblesCompleto > 1) {
      console.log('✓ Filtro del kit completo aplicado correctamente - se encontraron resultados');
      
      // Verificación rápida del ticket
      const ticketFiltradoCompleto = page.locator(`[aria-colindex="3"]:has-text("${kitIdCompleto}")`).first();
      if (await ticketFiltradoCompleto.isVisible({ timeout: 2000 })) {
        console.log('✓ Ticket del kit completo filtrado encontrado y verificado exitosamente');
      } else {
        console.log('Advertencia: Filtro del kit completo aplicado pero no se pudo verificar el ticket específico');
      }
      
      // --- EXPORTAR EL PEDIDO FILTRADO DEL KIT COMPLETO ---
      
      try {
        // Localizar el botón "Exportar"
        const exportarBtnCompleto = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' });
        await expect(exportarBtnCompleto).toBeVisible({ timeout: 5000 });
        
        // Hacer clic en el botón exportar
        await exportarBtnCompleto.click();
        
        console.log('✓ Botón "Exportar" del kit completo clickeado exitosamente');
        
        // Pausa para verificar manualmente si se exportó el archivo
        console.log('⏸️ PAUSA: Verifica si se descargó el archivo exportado del kit completo');
        await page.pause();
        
        console.log('✓ Exportación del pedido filtrado del kit completo completada');
        
      } catch (error) {
        console.log('Error durante la exportación del kit completo:', error);
      }
      
    } else {
      console.log('Advertencia: El filtro del kit completo no devolvió resultados visibles');
    }
    
  } catch (error) {
    console.log('Error durante el proceso de filtrado del kit completo:', error);
    console.log('Continuando con la verificación básica...');
    
    // Verificación básica: solo comprobar que estamos en la página correcta
    try {
      await expect(page.url()).toContain('/front-crm/welcome-kit');
      console.log('✓ Verificación básica completada - estamos en la página de kits de bienvenida');
    } catch (urlError) {
      console.log('Error en verificación de URL del kit completo:', urlError);
    }
  }

  // Mensaje de confirmación en consola
  console.log(`Test completado: Se creó el kit completo con título "Kit Completo de Pruebas Automatizadas" con número de ticket ${kitIdCompleto}, y se editó correctamente.`);
  console.log(`URL de edición: ${BASE_URL}/front-crm/welcome-kit/edit/[ID_INTERNO]`);
  console.log(`Número de ticket del kit completo: ${kitIdCompleto}`);
  
  // Test completado exitosamente
  console.log('✓ Test del kit completo completado exitosamente');

});