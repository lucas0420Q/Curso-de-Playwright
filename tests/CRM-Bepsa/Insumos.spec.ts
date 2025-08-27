
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


  // === CREACIÓN DE PEDIDO DE INSUMOS ===
  try {
    const createButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Crear Pedido de Insumos' });
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    // Esperar navegación a la URL de creación
    await page.waitForURL('**/front-crm/supplies/new', { timeout: 15000 });
    const currentUrl = page.url();
    console.log(`Navegación exitosa a: ${currentUrl}`);
    await page.waitForTimeout(2000);

    // === CAMBIAR EL TÍTULO DEL PEDIDO ===
    const titleInput = page.locator('input[name="Title"]');
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await titleInput.clear();
    await titleInput.fill('Pedido de Insumos Automatizado');
    console.log('✓ Título del pedido cambiado correctamente');
    await page.waitForTimeout(1000);

    // === COMPLETAR CAMPO 'A cargo de' ===
    // Buscar el label y el input asociado
    const assignedToContainer = page.locator('label').filter({ hasText: 'A cargo de' }).locator('..').locator('#paginated-autocomplete-');
    await expect(assignedToContainer).toBeVisible({ timeout: 10000 });
    await assignedToContainer.click();
    await page.waitForTimeout(1000);

    // Buscar y seleccionar la opción 'ADMIN CRM'
    const adminOption = page.locator('[role="option"]').filter({ hasText: 'ADMIN CRM' }).first();
    await expect(adminOption).toBeVisible({ timeout: 5000 });
    await adminOption.click();
    console.log('✓ Campo "A cargo de" completado con ADMIN CRM');
    await page.waitForTimeout(1000);

    // === COMPLETAR CAMPO 'Comentarios' ===
    const commentsInput = page.locator('textarea[name="AttrLastComment"]');
    await expect(commentsInput).toBeVisible({ timeout: 10000 });
    await commentsInput.fill('Este es un pedido de insumos automatizado para pruebas de Playwright.');
    console.log('✓ Comentarios completados');
    await page.waitForTimeout(1000);

    // === COMPLETAR CAMPO 'Nombre del comercio' ===
    const commerceContainer = page.locator('label').filter({ hasText: 'Nombre del comercio' }).locator('..').locator('#paginated-autocomplete-');
    await expect(commerceContainer).toBeVisible({ timeout: 10000 });
    await commerceContainer.click();
    await page.waitForTimeout(1000);

    // Buscar y seleccionar la opción 'SUPER MOTO CROSS'
    const commerceOption = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first();
    await expect(commerceOption).toBeVisible({ timeout: 5000 });
    await commerceOption.click();
    console.log('✓ Campo "Nombre del comercio" completado con SUPER MOTO CROSS');
    await page.waitForTimeout(1000);

    // === COMPLETAR CAMPO 'Sucursal del Cliente' ===
    const branchContainer = page.locator('label').filter({ hasText: 'Sucursal del Cliente' }).locator('..').locator('#paginated-autocomplete-');
    await expect(branchContainer).toBeVisible({ timeout: 10000 });
    await branchContainer.click();
    await page.waitForTimeout(1000);

    // Buscar y seleccionar la opción 'SUPER MOTO CROSS (1)'
    const branchOption = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS (1)' }).first();
    await expect(branchOption).toBeVisible({ timeout: 5000 });
    await branchOption.click();
    console.log('✓ Campo "Sucursal del Cliente" completado con SUPER MOTO CROSS (1)');
    await page.waitForTimeout(1000);

    // === COMPLETAR CAMPO 'Origen del caso' ===
    const originContainer = page.locator('label').filter({ hasText: 'Origen del caso' }).locator('..').locator('#paginated-autocomplete-');
    await expect(originContainer).toBeVisible({ timeout: 10000 });
    await originContainer.click();
    await page.waitForTimeout(1000);

    // Buscar y seleccionar la opción 'ATENCION PRESENCIAL'
    const originOption = page.locator('[role="option"]').filter({ hasText: 'ATENCION PRESENCIAL' }).first();
    await expect(originOption).toBeVisible({ timeout: 5000 });
    await originOption.click();
    console.log('✓ Campo "Origen del caso" completado con ATENCION PRESENCIAL');
    await page.waitForTimeout(1000);

    // === ACTIVAR CHECKBOX Y COMPLETAR CANTIDAD Y PRECIO UNITARIO EN LA TABLA ===
    // Seleccionar el primer row de la tabla de productos
    const firstRow = page.locator('div[role="row"]').nth(2);
    // Hacer clic en el contenedor del switch (no en el input)
    const switchContainer = firstRow.locator('.custom-switch');
    await expect(switchContainer).toBeVisible({ timeout: 10000 });
    await switchContainer.click();
    await page.waitForTimeout(500);

    // Esperar a que el input de cantidad esté habilitado
    const qtyInput = firstRow.locator('input[type="number"]').nth(0);
    await expect(qtyInput).toBeVisible({ timeout: 5000 });
    await expect(qtyInput).toBeEnabled({ timeout: 5000 });
    await qtyInput.fill('5');
    await page.waitForTimeout(500);

    // Ingresar precio unitario
    const priceInput = firstRow.locator('input[type="number"]').nth(1);
    await expect(priceInput).toBeVisible({ timeout: 5000 });
    await priceInput.fill('12000');
    await page.waitForTimeout(500);
    console.log('✓ Producto activado, cantidad y precio unitario ingresados');

    // === HACER CLIC EN LA PESTAÑA 'Datos de la Facturación' ===
    const invoiceTab = page.locator('#uncontrolled-tab-example-tab-invoice_data');
    await expect(invoiceTab).toBeVisible({ timeout: 10000 });
    await invoiceTab.click();
    await page.waitForTimeout(1000);
    console.log('✓ Pestaña "Datos de la Facturación" seleccionada');

    // === COMPLETAR CAMPO 'Moneda' ===
    const currencyContainer = page.locator('label').filter({ hasText: 'Moneda' }).first().locator('..').locator('#paginated-autocomplete-');
    await expect(currencyContainer).toBeVisible({ timeout: 10000 });
    await currencyContainer.click();
    await page.waitForTimeout(1000);

    // Buscar y seleccionar la opción 'PYG'
    const currencyOption = page.locator('[role="option"]').filter({ hasText: 'PYG' }).first();
    await expect(currencyOption).toBeVisible({ timeout: 5000 });
    await currencyOption.click();
    console.log('✓ Campo "Moneda" completado con PYG');
    await page.waitForTimeout(1000);

    // === COMPLETAR CAMPO 'Descripción/Observaciones' ===
    const descInput = page.locator('textarea[name="AttrDescription"]');
    await expect(descInput).toBeVisible({ timeout: 10000 });
    await descInput.fill('Factura correspondiente al pedido automatizado de insumos. Verificar datos antes de emitir.');
    console.log('✓ Descripción/Observaciones de facturación completada');
    await page.waitForTimeout(1000);

    // === HACER CLIC EN EL BOTÓN GUARDAR ===
    const saveButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' });
    await expect(saveButton).toBeVisible({ timeout: 10000 });
    await saveButton.click();
    console.log('✓ Botón Guardar presionado');
    await page.waitForTimeout(5000);

    // === REFRESCAR LA PANTALLA ===
    await page.reload();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    console.log('✓ Pantalla refrescada');
    await page.waitForTimeout(2000);
  } catch (error) {
    console.log(`Error al hacer clic en 'Crear Pedido de Insumos' o cambiar el título: ${error.message}`);
  }

  // === EDICIÓN DEL ÚLTIMO PEDIDO DE INSUMOS ===
  try {
    // Buscar la fila con el título 'Pedido de Insumos Automatizado'
    const pedidoRowEdit = page.locator('div[role="row"]').filter({ has: page.locator('div.rs-table-cell-content', { hasText: 'Pedido de Insumos Automatizado' }) }).first();
    await expect(pedidoRowEdit).toBeVisible({ timeout: 10000 });
    // Buscar el botón de editar (ícono de lápiz) en la primera celda de la fila
    const editButtonEdit = pedidoRowEdit.locator('div.rs-table-cell-content svg');
    await expect(editButtonEdit).toBeVisible({ timeout: 5000 });
    await editButtonEdit.click();
    // Esperar navegación a la URL de edición
    await page.waitForURL(/\/front-crm\/supplies\/edit\//, { timeout: 15000 });
    console.log('✓ Entró en modo edición del último pedido de bobinas');
    await page.waitForTimeout(2000);

    // === EDITAR CAMPO 'Área Resolutora' ===
    // Buscar el label y el input asociado a 'Área Resolutora' (selector robusto)
    const areaLabel = page.locator('label').filter({ hasText: 'Área Resolutora' });
    await expect(areaLabel).toBeVisible({ timeout: 10000 });
    const areaContainer = areaLabel.locator('..');
    // Buscar el primer div con id que empiece con 'paginated-autocomplete-'
    const areaSelect = areaContainer.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(areaSelect).toBeVisible({ timeout: 10000 });
    await areaSelect.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'BACK OFFICE'
    const backOfficeOption = page.locator('[role="option"]').filter({ hasText: 'BACK OFFICE' }).first();
    await expect(backOfficeOption).toBeVisible({ timeout: 5000 });
    await backOfficeOption.click();
    console.log('✓ Campo "Área Resolutora" editado a BACK OFFICE');
    await page.waitForTimeout(1000);

    // === EDITAR CAMPO 'A cargo de *' ===
    // Buscar el label y el input asociado a 'A cargo de *' (selector robusto)
    const aCargoDeLabel = page.locator('label').filter({ hasText: 'A cargo de' });
    await expect(aCargoDeLabel).toBeVisible({ timeout: 10000 });
    const aCargoDeContainer = aCargoDeLabel.locator('..');
    // Buscar el primer div con id que empiece con 'paginated-autocomplete-'
    const aCargoDeSelect = aCargoDeContainer.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(aCargoDeSelect).toBeVisible({ timeout: 10000 });
    await aCargoDeSelect.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'AHORRO PACK'
    const ahorroPackOption = page.locator('[role="option"]').filter({ hasText: 'AHORRO PACK' }).first();
    await expect(ahorroPackOption).toBeVisible({ timeout: 5000 });
    await ahorroPackOption.click();
    console.log('✓ Campo "A cargo de *" editado a AHORRO PACK');
    await page.waitForTimeout(1000);

    // === EDITAR CAMPO 'Estado del pedido' ===
    // Buscar el label y el input asociado a 'Estado del pedido' (selector robusto)
    const estadoLabel = page.locator('label').filter({ hasText: 'Estado del pedido' });
    await expect(estadoLabel).toBeVisible({ timeout: 10000 });
    const estadoContainer = estadoLabel.locator('..');
    // Buscar el primer div con id que empiece con 'paginated-autocomplete-'
    const estadoSelect = estadoContainer.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(estadoSelect).toBeVisible({ timeout: 10000 });
    await estadoSelect.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'Cerrado'
    const cerradoOption = page.locator('[role="option"]').filter({ hasText: 'Cerrado' }).first();
    await expect(cerradoOption).toBeVisible({ timeout: 5000 });
    await cerradoOption.click();
    console.log('✓ Campo "Estado del pedido" editado a Cerrado');
    await page.waitForTimeout(1000);

    // === EDITAR CAMPO 'Nombre del comercio' ===
    // Buscar el label y el input asociado a 'Nombre del comercio' (selector robusto)
    const comercioLabel = page.locator('label').filter({ hasText: 'Nombre del comercio' });
    await expect(comercioLabel).toBeVisible({ timeout: 10000 });
    const comercioContainer = comercioLabel.locator('..');
    // Buscar el primer div con id que empiece con 'paginated-autocomplete-'
    const comercioSelect = comercioContainer.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(comercioSelect).toBeVisible({ timeout: 10000 });
    await comercioSelect.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'STELA NOVEDADES'
    const stelaOption = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
    await expect(stelaOption).toBeVisible({ timeout: 5000 });
    await stelaOption.click();
    console.log('✓ Campo "Nombre del comercio" editado a STELA NOVEDADES');
    await page.waitForTimeout(1000);

    // === EDITAR CAMPO 'Sucursal del Cliente' ===
    // Buscar el label y el input asociado a 'Sucursal del Cliente' (selector robusto)
    const sucursalLabel = page.locator('label').filter({ hasText: 'Sucursal del Cliente' });
    await expect(sucursalLabel).toBeVisible({ timeout: 10000 });
    const sucursalContainer = sucursalLabel.locator('..');
    // Buscar el primer div con id que empiece con 'paginated-autocomplete-'
    const sucursalSelect = sucursalContainer.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(sucursalSelect).toBeVisible({ timeout: 10000 });
    await sucursalSelect.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'STELA NOVEDADES (1)'
    const sucursalOption = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES (1)' }).first();
    await expect(sucursalOption).toBeVisible({ timeout: 5000 });
    await sucursalOption.click();
    console.log('✓ Campo "Sucursal del Cliente" editado a STELA NOVEDADES (1)');
    await page.waitForTimeout(1000);

    // === EDITAR CAMPO 'Origen del caso' ===
    // Buscar el label y el input asociado a 'Origen del caso' (selector robusto)
    const origenLabel = page.locator('label').filter({ hasText: 'Origen del caso' });
    await expect(origenLabel).toBeVisible({ timeout: 10000 });
    const origenContainer = origenLabel.locator('..');
    // Buscar el primer div con id que empiece con 'paginated-autocomplete-'
    const origenSelect = origenContainer.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(origenSelect).toBeVisible({ timeout: 10000 });
    await origenSelect.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'BANCO CONTINENTAL'
    const bancoOption = page.locator('[role="option"]').filter({ hasText: 'BANCO CONTINENTAL' }).first();
    await expect(bancoOption).toBeVisible({ timeout: 5000 });
    await bancoOption.click();
    console.log('✓ Campo "Origen del caso" editado a BANCO CONTINENTAL');
    await page.waitForTimeout(1000);

    // === ACTIVAR NUEVO PRODUCTO Y COMPLETAR CANTIDAD Y PRECIO UNITARIO ===
    // Seleccionar la segunda fila de la tabla de productos (índice 3, ya que la 0 es header y la 2 es el primer producto activado)
    const newProductRow = page.locator('div[role="row"]').nth(3);
    // Activar el switch del producto
    const newSwitchContainer = newProductRow.locator('.custom-switch');
    await expect(newSwitchContainer).toBeVisible({ timeout: 10000 });
    await newSwitchContainer.click();
    await page.waitForTimeout(500);

    // Esperar a que el input de cantidad esté habilitado
    const newQtyInput = newProductRow.locator('input[type="number"]').nth(0);
    await expect(newQtyInput).toBeVisible({ timeout: 5000 });
    await expect(newQtyInput).toBeEnabled({ timeout: 5000 });
    await newQtyInput.fill('3');
    await page.waitForTimeout(500);

    // Ingresar precio unitario
    const newPriceInput = newProductRow.locator('input[type="number"]').nth(1);
    await expect(newPriceInput).toBeVisible({ timeout: 5000 });
    await newPriceInput.fill('25000');
    await page.waitForTimeout(500);
    console.log('✓ Nuevo producto activado, cantidad y precio unitario ingresados');
    // === HACER CLIC EN LA PESTAÑA 'Datos de la Facturación' ===
    const invoiceTabEdit = page.locator('#uncontrolled-tab-example-tab-invoice_data');
    await expect(invoiceTabEdit).toBeVisible({ timeout: 10000 });
    await invoiceTabEdit.click();
    await page.waitForTimeout(1000);
    console.log('✓ Pestaña "Datos de la Facturación" seleccionada (edición)');

    // === EDITAR CAMPO 'Moneda' ===
    const currencyLabelEdit = page.locator('label').filter({ hasText: 'Moneda' }).first();
    await expect(currencyLabelEdit).toBeVisible({ timeout: 10000 });
    const currencyContainerEdit = currencyLabelEdit.locator('..');
    const currencySelectEdit = currencyContainerEdit.locator('div[id^="paginated-autocomplete-"]').first();
    await expect(currencySelectEdit).toBeVisible({ timeout: 10000 });
    await currencySelectEdit.click();
    await page.waitForTimeout(1000);
    // Buscar y seleccionar la opción 'BRA'
    const braOption = page.locator('[role="option"]').filter({ hasText: 'BRA' }).first();
    await expect(braOption).toBeVisible({ timeout: 5000 });
    await braOption.click();
    console.log('✓ Campo "Moneda" editado a BRA');
    await page.waitForTimeout(1000);

    // === EDITAR CAMPO 'Descripción/Observaciones' ===
    const descInputEdit = page.locator('textarea[name="AttrDescription"]');
    await expect(descInputEdit).toBeVisible({ timeout: 10000 });
    await descInputEdit.fill('Pedido editado automáticamente. Revisar datos antes de emitir la factura.');
    console.log('✓ Descripción/Observaciones de facturación editada');
    await page.waitForTimeout(1000);

    // === AGREGAR UNA NOTA ===
    const noteTextarea = page.locator('textarea.Notes_textarea__IN3Dq[name="description"]');
    await expect(noteTextarea).toBeVisible({ timeout: 10000 });
    await noteTextarea.fill('Nota agregada automáticamente desde Playwright.');
    await page.waitForTimeout(500);
    const sendNoteButton = page.locator('button.Notes_submitButton__rMudm').filter({ hasText: 'Enviar' });
    await expect(sendNoteButton).toBeVisible({ timeout: 10000 });
    await sendNoteButton.click();
    console.log('✓ Nota agregada y enviada correctamente');
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log(`Error al editar el pedido: ${error.message}`);
  }

   // === HACER CLIC EN EL BOTÓN GUARDAR (edición) ===
    const saveButtonEdit = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' });
    await expect(saveButtonEdit).toBeVisible({ timeout: 10000 });
    await saveButtonEdit.click();
    console.log('✓ Botón Guardar presionado en edición');
    await page.waitForTimeout(5000);

  // Pausa final para inspección manual
  // === OBTENER EL NRO DE TICKET DEL ÚLTIMO PEDIDO ===
  // Buscar la fila que contiene el título y luego obtener la celda de Nº Ticket (columna siguiente)
  const lastPedidoRow = page.locator('div[role="row"]').filter({ has: page.locator('div.rs-table-cell-content', { hasText: 'Pedido de Insumos Automatizado' }) }).first();
  await expect(lastPedidoRow).toBeVisible({ timeout: 10000 });
  // Buscar todas las celdas de la fila
  const cells = lastPedidoRow.locator('div.rs-table-cell-content');
  // Buscar el índice de la celda con el título
  const cellCount = await cells.count();
  let nroTicket = '';
  for (let i = 0; i < cellCount - 1; i++) {
    const text = (await cells.nth(i).textContent())?.trim();
    if (text === 'Pedido de Insumos Automatizado') {
      nroTicket = (await cells.nth(i + 1).textContent())?.trim() || '';
      break;
    }
  }
  console.log('NRO de ticket capturado:', nroTicket);
  // === INGRESAR EL NRO DE TICKET EN EL FILTRO Y PRESIONAR ENTER ===
  const searchInput = page.locator('input#search[placeholder="Buscar Pedido de Insumos"]');
  await expect(searchInput).toBeVisible({ timeout: 10000 });
  await searchInput.fill(nroTicket || '');
  await searchInput.press('Enter');
  console.log('✓ NRO de ticket ingresado en el filtro y se presionó Enter');
  await page.waitForTimeout(2000);
  // === HACER CLIC EN EL BOTÓN EXPORTAR ===
  const exportButton = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' });
  await expect(exportButton).toBeVisible({ timeout: 10000 });
  await exportButton.click();
  console.log('✓ Botón Exportar presionado');
  // Pausa final para inspección manual
  await page.waitForTimeout(5000);
});
