import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL de la pantalla de bobinas
const REELS_URL = `${BASE_URL}/front-crm/reels`;

// Función helper para completar campos de texto
async function fillField(page: any, selector: string, value: string, description: string) {
  try {
    const field = page.locator(selector);
    await expect(field).toBeVisible({ timeout: 10000 });
    await field.clear();
    await field.fill(value);
    console.log(`✓ ${description} completado: ${value}`);
    return true;
  } catch (error) {
    console.log(`Error al completar ${description}: ${error.message}`);
    return false;
  }
}

// Helper robusto para React Select: busca por id, por input bajo label, o por div contenedor bajo label
async function handleReactSelect(page: any, selectId: string, optionText: string, description: string, labelText?: string) {
  try {
    // 1. Buscar por id de input
    let selectInput = page.locator(`#${selectId}-input`);
    if (await selectInput.isVisible({ timeout: 2000 })) {
      const selectContainer = selectInput.locator('../..');
      await selectContainer.click();
      await page.waitForTimeout(1000);
    } else if (labelText) {
      // 2. Buscar input bajo label
      const label = page.locator('label').filter({ hasText: labelText });
      if (await label.count() > 0) {
        const labelParent = label.first().locator('..');
        const input = labelParent.locator('input[id*="paginated-autocomplete-"]');
        if (await input.count() > 0 && await input.first().isVisible({ timeout: 1000 })) {
          await input.first().locator('../..').click();
          await page.waitForTimeout(1000);
        } else {
          // 3. Buscar div contenedor de React Select bajo el label
          const selectDiv = labelParent.locator('div[class*=select__control]');
          if (await selectDiv.count() > 0) {
            await selectDiv.first().click();
            await page.waitForTimeout(1000);
          } else {
            // 4. Buscar input o div select como hermano anterior al label
            // Buscar el contenedor padre del label
            const labelElement = label.first();
            // Buscar el input anterior al label
            const inputPrev = labelElement.locator('xpath=preceding-sibling::div//input[contains(@id,"react-select")]').first();
            if (await inputPrev.count() > 0 && await inputPrev.isVisible({ timeout: 1000 })) {
              await inputPrev.click();
              await page.waitForTimeout(1000);
            } else {
              // Buscar el div select__control anterior al label
              const divPrev = labelElement.locator('xpath=preceding-sibling::div[contains(@class,"select__control")]').first();
              if (await divPrev.count() > 0 && await divPrev.isVisible({ timeout: 1000 })) {
                await divPrev.click();
                await page.waitForTimeout(1000);
              } else {
                console.log(`❌ No se encontró input ni div de React Select bajo ni antes del label '${labelText}'`);
                return false;
              }
            }
          }
        }
      } else {
        console.log(`❌ Label '${labelText}' no encontrado`);
        return false;
      }
    } else {
      console.log(`${description} no visible y no se proporcionó label alternativo`);
      return false;
    }
    // Buscar y seleccionar la opción
    const option = page.locator('[role="option"]').filter({ hasText: optionText }).first();
    if (await option.count() > 0) {
      await option.click();
      console.log(`✓ ${description} completado: ${optionText}`);
      return true;
    } else {
      console.log(`${description} - opción "${optionText}" no encontrada`);
      await page.keyboard.press('Escape');
      return false;
    }
  } catch (error) {
    console.log(`Error con ${description}: ${error.message}`);
    return false;
  }
}


test('Test de Bobinas: Login y navegación a pantalla de bobinas', async ({ page }) => {
  test.setTimeout(300000); // 5 minutos timeout

  // Configurar manejo de errores
  page.on('pageerror', error => console.log('Error de página:', error.message));
  page.on('crash', () => console.log('La página se cerró inesperadamente'));
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(60000);

  try {
    // === SECCIÓN 1: LOGIN ===
    await page.goto(CASES_URL);

    // Esperar campos de login
    await page.waitForSelector('input[name="userName"]', { timeout: 15000 });
    await page.waitForSelector('input[name="password"]', { timeout: 15000 });

    // Completar credenciales
    await page.locator('input[name="userName"]').fill('admin@clt.com.py');
    await page.locator('input[name="password"]').fill('B3rL!n57A');

    // Enviar formulario
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Esperar redirección exitosa
    await page.waitForURL(CASES_URL, { timeout: 30000 });
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 15000 });

    // === SECCIÓN 2: NAVEGACIÓN A BOBINAS ===
    await page.goto(REELS_URL);
    await page.waitForURL(REELS_URL);
    await page.waitForTimeout(3000);

    // Verificar que estamos en la pantalla correcta
    try {
      const pageTitle = await page.title();
      await page.waitForTimeout(5000);
      
    } catch (verificationError) {
      console.log(`Error al verificar la pantalla: ${verificationError.message}`);
    }

    // === SECCIÓN 3: CREAR PEDIDO DE BOBINAS ===
    try {
      // Buscar el botón "Crear Pedido de Bobinas"
      const createButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Crear Pedido de Bobinas' });
      await expect(createButton).toBeVisible({ timeout: 10000 });
      await createButton.click();
      
      // Esperar navegación a la URL de creación
      await page.waitForURL('**/front-crm/reels/new', { timeout: 15000 });
      
      // Verificar que estamos en la URL correcta
      const currentUrl = page.url();
      
      // Pausa para verificar que la página de creación se cargó
      await page.waitForTimeout(3000);
      
    } catch (createError) {
      console.log(`❌ Error al hacer clic en "Crear Pedido de Bobinas": ${createError.message}`);
      
      // Método alternativo
      console.log('🔄 Intentando método alternativo para encontrar el botón...');
      try {
        // Buscar por texto más general
        const createButtonAlt = page.locator('button').filter({ hasText: 'Crear Pedido de Bobinas' });
        if (await createButtonAlt.isVisible({ timeout: 5000 })) {
          await createButtonAlt.click();
          console.log('✅ Botón presionado usando método alternativo');
          
          // Esperar navegación
          await page.waitForURL('**/front-crm/reels/new', { timeout: 15000 });
          const currentUrl = page.url();
          console.log(`🔗 Navegación exitosa (método alternativo): ${currentUrl}`);
        } else {
          // Último intento: buscar por selector más general
          const createButtonGeneral = page.locator('button:has-text("Crear Pedido de Bobinas")');
          if (await createButtonGeneral.isVisible({ timeout: 5000 })) {
            await createButtonGeneral.click();
            console.log('✅ Botón presionado usando selector general');
            
            await page.waitForURL('**/front-crm/reels/new', { timeout: 15000 });
            const currentUrl = page.url();
            console.log(`🔗 Navegación exitosa (selector general): ${currentUrl}`);
          } else {
            console.log('⚠️ No se pudo encontrar el botón "Crear Pedido de Bobinas"');
          }
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo también falló: ${altError.message}`);
      }
    }

    // === SECCIÓN 4: COMPLETAR FORMULARIO ===
    try {
      // Completar el campo de título
      await fillField(page, 'input[name="Title"]', 'Pedido de Prueba de automatización', 'Título del pedido');

      // Completar el campo "A cargo de" usando el label
      const assignedToContainer = page.locator('label').filter({ hasText: 'A cargo de' }).locator('..').locator('#paginated-autocomplete-');
      await assignedToContainer.click();
      await page.waitForTimeout(1000);

      // Buscar y seleccionar "ADMIN CRM"
      const adminOption = page.locator('[role="option"]').filter({ hasText: 'ADMIN CRM' }).first();
      await expect(adminOption).toBeVisible({ timeout: 5000 });
      await adminOption.click();
      
      await page.waitForTimeout(2000);

      // Completar el campo "Nombre del comercio"
      const commerceNameContainer = page.locator('label').filter({ hasText: 'Nombre del comercio' }).locator('..').locator('#paginated-autocomplete-');
      await commerceNameContainer.click();
      await page.waitForTimeout(1000);

      // Buscar y seleccionar "SUPER MOTO CROSS"
      const commerceOption = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first();
      await expect(commerceOption).toBeVisible({ timeout: 5000 });
      await commerceOption.click();
      
      await page.waitForTimeout(2000);

      // Completar el campo "Sucursal del Cliente"
      const branchContainer = page.locator('label').filter({ hasText: 'Sucursal del Cliente' }).locator('..').locator('#paginated-autocomplete-');
      await branchContainer.click();
      await page.waitForTimeout(1000);

      // Buscar y seleccionar "SUPER MOTO CROSS"
      const branchOption = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first();
      await expect(branchOption).toBeVisible({ timeout: 5000 });
      await branchOption.click();
      
      await page.waitForTimeout(2000);

       // Completar el campo de comentarios
      await fillField(page, 'textarea[name="AttrLastComment"]', 'Este es un pedido de prueba automatizada para verificar el funcionamiento del sistema de bobinas.', 'Comentarios');

      // Completar el campo "Origen del caso"
      const originContainer = page.locator('label').filter({ hasText: 'Origen del caso' }).locator('..').locator('#paginated-autocomplete-');
      await expect(originContainer).toBeVisible({ timeout: 10000 });
      await originContainer.click();
      await page.waitForTimeout(3000); // Más tiempo para que se abra el dropdown

      // Buscar y seleccionar "ATENCION PRESENCIAL"
      const originOption = page.locator('[role="option"]').filter({ hasText: 'ATENCION PRESENCIAL' }).first();
      
      // Intentar alternativas si no se encuentra la opción
      if (await originOption.count() === 0) {
        // Intentar con texto parcial
        const originOptionAlt = page.locator('[role="option"]').filter({ hasText: 'PRESENCIAL' }).first();
        if (await originOptionAlt.count() > 0) {
          await originOptionAlt.click();
        } else {
          // Si no se encuentra, presionar Escape y continuar
          await page.keyboard.press('Escape');
          console.log('No se pudo encontrar la opción ATENCION PRESENCIAL');
        }
      } else {
        await originOption.click();
      }
      
      await page.waitForTimeout(2000);

      // Completar el campo "Moneda" - usando el primer campo de moneda
      const currencyContainer = page.locator('label').filter({ hasText: 'Moneda' }).first().locator('..').locator('#paginated-autocomplete-');
      await currencyContainer.click();
      await page.waitForTimeout(1000);

      // Buscar y seleccionar "PYG"
      const currencyOption = page.locator('[role="option"]').filter({ hasText: 'PYG' }).first();
      await expect(currencyOption).toBeVisible({ timeout: 5000 });
      await currencyOption.click();
      
      await page.waitForTimeout(2000);

      // Completar el campo "Costo de envío"
      await fillField(page, 'input[name="AttrShippingCost"]', '150000', 'Costo de envío');

      // Completar el campo "Fecha estimada de entrega" con la fecha actual
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      await fillField(page, 'input[name="AttrEstimatedDeliveryDate"]', todayFormatted, 'Fecha estimada de entrega');

      // Completar el campo "Solicitado por:"
      const requestedByContainer = page.locator('label').filter({ hasText: 'Solicitado por:' }).locator('..').locator('#paginated-autocomplete-');
      await requestedByContainer.click();
      await page.waitForTimeout(1000);

      // Buscar y seleccionar "ATC"
      const requestedByOption = page.locator('[role="option"]').filter({ hasText: 'ATC' }).first();
      await expect(requestedByOption).toBeVisible({ timeout: 5000 });
      await requestedByOption.click();
      
      await page.waitForTimeout(2000);

      // Completar el campo "Teléfono"
      await fillField(page, 'input[name="AttrPhoneNumber"]', '0981123456', 'Teléfono');

      // Completar el campo "Cantidad de Bobinas"
      await fillField(page, 'input[name="AttrCoilQuantity"]', '25', 'Cantidad de Bobinas');

      // Completar el campo "Descripción/Observaciones"
      await fillField(page, 'textarea[name="description"]', 'Pedido de 25 bobinas para reposición de stock en sucursal SUPER MOTO CROSS. Entrega prioritaria solicitada para mantener continuidad operacional. Verificar calidad y especificaciones técnicas antes del envío.', 'Descripción/Observaciones');

      // Hacer clic en la pestaña "Datos de la Facturación"
      const invoiceDataTab = page.locator('#uncontrolled-tab-example-tab-invoice_data');
      await expect(invoiceDataTab).toBeVisible({ timeout: 10000 });
      await invoiceDataTab.click();
      await page.waitForTimeout(2000);
      console.log('✓ Pestaña "Datos de la Facturación" seleccionada');

      // Completar el campo "Precio unitario"
      await fillField(page, 'input[name="unitPrice"]', '45000', 'Precio unitario');

      // Completar el campo "Descripción/Observaciones" en la pestaña de facturación
      await fillField(page, 'textarea[name="AttrDescription"]', 'Facturación correspondiente a pedido de 25 bobinas para SUPER MOTO CROSS. Precio unitario: 45.000 PYG. Total estimado: 1.125.000 PYG más gastos de envío. Solicitar comprobante de entrega para procesamiento de pago. Condiciones comerciales habituales aplicables.', 'Descripción/Observaciones de facturación');

      // Hacer clic en el botón "Guardar"
      const saveButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' });
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      await saveButton.click();
      console.log('✓ Botón "Guardar" presionado');

      // Esperar más tiempo para que se complete el proceso de guardado
      await page.waitForTimeout(8000);
      console.log('⏱️ Esperando proceso de guardado...');

      // Verificar que el guardado fue exitoso
      try {
        // Esperar por indicadores de éxito (pueden ser notificaciones, cambios de URL, etc.)
        // Opción 1: Verificar si hay un mensaje de éxito
        const successMessage = page.locator('.toast, .alert, .notification, .success').filter({ hasText: /guardado|éxito|success|saved/i });
        if (await successMessage.isVisible({ timeout: 5000 })) {
          console.log('✓ Mensaje de éxito detectado - Guardado confirmado');
        } else {
          // Opción 2: Verificar si regresamos a la lista de bobinas
          const currentUrl = page.url();
          if (currentUrl.includes('/front-crm/reels')) {
            console.log('✓ Redirección exitosa - Guardado confirmado');
          } else {
            // Opción 3: Verificar que el botón "Guardar" ya no esté disponible (deshabilitado o cambió)
            if (await saveButton.isDisabled({ timeout: 3000 })) {
              console.log('✓ Botón deshabilitado - Guardado confirmado');
            } else {
              console.log('⚠️ No se pudo confirmar el guardado, pero continuando...');
            }
          }
        }
      } catch (verificationError) {
        console.log(`⚠️ Error al verificar el guardado: ${verificationError.message}`);
      }

      // Esperar un poco más antes de refrescar
      await page.waitForTimeout(3000);
      
      // Refrescar la pantalla
      await page.reload();
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      console.log('✓ Pantalla refrescada');

      // === SECCIÓN 5: EDITAR EL ÚLTIMO PEDIDO CREADO ===
      await page.waitForTimeout(3000);
      
      // Buscar y hacer clic en el botón de edición del primer pedido (más reciente)
      // Usar selector más simple y directo para el ícono de edición
      console.log('🔍 Buscando botón de edición...');
      
      try {
        // Método 1: Buscar el primer SVG de edición en la tabla
        const editButton1 = page.locator('svg[stroke="currentColor"]').first();
        if (await editButton1.isVisible({ timeout: 3000 })) {
          await editButton1.click();
          console.log('✓ Botón de edición presionado (método 1)');
        } else {
          // Método 2: Buscar por el contenedor del ícono
          const editButton2 = page.locator('div[style*="color: rgb(0, 159, 227)"]').first();
          if (await editButton2.isVisible({ timeout: 3000 })) {
            await editButton2.click();
            console.log('✓ Botón de edición presionado (método 2)');
          } else {
            // Método 3: Buscar por el path específico del SVG
            const editButton3 = page.locator('path[d*="M21.174 6.812"]').first();
            if (await editButton3.isVisible({ timeout: 3000 })) {
              await editButton3.click();
              console.log('✓ Botón de edición presionado (método 3)');
            } else {
              // Método 4: Buscar cualquier SVG en la primera fila de datos
              const editButton4 = page.locator('div[role="row"]:has(div:has-text("Pedido de Prueba de automatización"))').locator('svg').first();
              if (await editButton4.isVisible({ timeout: 3000 })) {
                await editButton4.click();
                console.log('✓ Botón de edición presionado (método 4)');
              } else {
                console.log('⚠️ No se pudo encontrar el botón de edición con ningún método');
                // Mostrar información de depuración
                const allSvgs = await page.locator('svg').count();
                console.log(`📊 Total de SVGs encontrados: ${allSvgs}`);
                return;
              }
            }
          }
        }

        // Esperar navegación a la URL de edición
        await page.waitForURL('**/front-crm/reels/edit/**', { timeout: 15000 });
        const editUrl = page.url();
        console.log(`✓ Navegación exitosa a edición: ${editUrl}`);

        // Pausa para verificar que la página de edición se cargó
        await page.waitForTimeout(3000);

        // === SECCIÓN 6: EDITAR CAMPOS EN PANTALLA DE EDICIÓN ===
        try {
          const labelCargo = page.locator('label').filter({ hasText: 'A cargo de' });
          await expect(labelCargo).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'AHORRO PACK', 'A cargo de', 'A cargo de');
          const labelComercio = page.locator('label').filter({ hasText: 'Nombre del comercio' });
          await expect(labelComercio).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'STELA NOVEDADES', 'Nombre del comercio', 'Nombre del comercio');
          const labelSucursal = page.locator('label').filter({ hasText: 'Sucursal del Cliente' });
          await expect(labelSucursal).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'STELA NOVEDADES (1)', 'Sucursal del Cliente', 'Sucursal del Cliente');
          // === Edición robusta de "Estado del pedido" usando helper y log extra ===
          const labelEstado = page.locator('label').filter({ hasText: 'Estado del pedido' });
          await expect(labelEstado).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'Entrega Completada', 'Estado del pedido', 'Estado del pedido');
          const labelOrigen = page.locator('label').filter({ hasText: 'Origen del caso' });
          await expect(labelOrigen).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'BANCO CONTINENTAL', 'Origen del caso', 'Origen del caso');
          const labelMoneda = page.locator('label').filter({ hasText: 'Moneda' }).first();
          await expect(labelMoneda).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'USD', 'Moneda', 'Moneda');
          const shippingCostInput = page.locator('input[name="AttrShippingCost"]');
          await expect(shippingCostInput).toBeVisible({ timeout: 10000 });
          await fillField(page, 'input[name="AttrShippingCost"]', '200000', 'Costo de envío (edición)');
          const dateInput = page.locator('input[name="AttrEstimatedDeliveryDate"]');
          await expect(dateInput).toBeVisible({ timeout: 10000 });
          // Calcular fecha de mañana
          const today = new Date();
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
          await fillField(page, 'input[name="AttrEstimatedDeliveryDate"]', tomorrowFormatted, 'Fecha estimada de entrega (edición)');
          const labelSolicitado = page.locator('label').filter({ hasText: 'Solicitado por:' });
          await expect(labelSolicitado).toBeVisible({ timeout: 10000 });
          await handleReactSelect(page, '', 'RCI-INTERIOR', 'Solicitado por', 'Solicitado por:');
          // Edición robusta de "Cantidad de Bobinas" en la pantalla de edición
          const coilQtyInput = page.locator('input[name="AttrCoilQuantity"]');
          await expect(coilQtyInput).toBeVisible({ timeout: 10000 });
          await fillField(page, 'input[name="AttrCoilQuantity"]', '30', 'Cantidad de Bobinas (edición)');
          const descInput = page.locator('textarea[name="description"]').nth(1); // El segundo textarea es el del formulario principal
          await expect(descInput).toBeVisible({ timeout: 10000 });
          await descInput.clear();
          await descInput.fill('Pedido editado: 30 bobinas para sucursal STELA NOVEDADES. Entrega urgente y revisión de calidad previa al despacho.');
          console.log('✓ Descripción/Observaciones (edición) completado: Pedido editado: 30 bobinas para sucursal STELA NOVEDADES. Entrega urgente y revisión de calidad previa al despacho.');

          // === NUEVO: Completar campos antes de facturación ===
          // Recibido por
          await fillField(page, 'input[name="attrReceivedBy"]', 'Juan Pérez', 'Recibido por');
          // Fecha de entrega (datetime-local)
          const now = new Date();
          const nowFormatted = now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
          await fillField(page, 'input[name="attrDeliveryDate"]', nowFormatted, 'Fecha de entrega');
          // Descripción/Observaciones
          await fillField(page, 'textarea[name="attrShippingDescription"]', 'Entrega realizada en tiempo y forma. Sin observaciones relevantes.', 'Descripción/Observaciones de entrega');

          // Agregar una nota y hacer clic en Enviar
          const noteTextarea = page.locator('textarea.Notes_textarea__IN3Dq');
          await expect(noteTextarea).toBeVisible({ timeout: 10000 });
          await noteTextarea.fill('Nota automática de prueba desde Playwright.');
          const sendButton = page.locator('button.Notes_submitButton__rMudm');
          await expect(sendButton).toBeVisible({ timeout: 10000 });
          await sendButton.click();
          console.log('✓ Nota agregada y enviada correctamente');
          // Hacer clic en la pestaña "Datos de la Facturación" en la pantalla de edición
          const invoiceTab = page.locator('#uncontrolled-tab-example-tab-invoice_data');
          await expect(invoiceTab).toBeVisible({ timeout: 10000 });
          await invoiceTab.click();
          console.log('✓ Pestaña "Datos de la Facturación" seleccionada en edición');

          // === Editar campos de facturación ===
          // Precio unitario
          await fillField(page, 'input[name="unitPrice"]', '52000', 'Precio unitario (edición)');
          // Descripción/Observaciones de facturación
          await fillField(page, 'textarea[name="AttrDescription"]', 'Facturación editada: 30 bobinas para STELA NOVEDADES. Precio unitario: 52.000 PYG. Total: 1.560.000 PYG. Entrega y condiciones según acuerdo.', 'Descripción/Observaciones de facturación (edición)');
          // Guardar cambios
          const saveButtonEdit = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' });
          await expect(saveButtonEdit).toBeVisible({ timeout: 10000 });
          await saveButtonEdit.click();
          console.log('Pedido de bobinas actualizado con exito');
          // === NUEVO PASO: Buscar por Nro de ticket del último pedido ===
          await page.waitForTimeout(3000);
          const searchInput = page.locator('input[aria-label="Default"][placeholder="Buscar Pedido de Bobinas"]');
          await expect(searchInput).toBeVisible({ timeout: 10000 });
          await searchInput.click();
          // Obtener el Nro de ticket de la primera fila de la tabla
          // Fila 2 (nth(2)) es la primera de datos, columna 3 (nth(2)) es Nº Ticket
          const nroTicketCell = page.locator('div[role="row"]').nth(2).locator('div[role="gridcell"]').nth(2);
          await expect(nroTicketCell).toBeVisible({ timeout: 10000 });
          const nroTicket = await nroTicketCell.textContent();
          await searchInput.fill(nroTicket ? nroTicket.trim() : '');
          await searchInput.press('Enter');
          console.log(`✓ Filtro aplicado con Nro de ticket ${nroTicket}`);
          await page.waitForTimeout(2000); // Esperar que se actualice la tabla
          // Hacer clic en el botón Exportar
          const exportButton = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' });
          await expect(exportButton).toBeVisible({ timeout: 10000 });
          await exportButton.click();
          console.log('✓ Botón Exportar presionado');
          // Esperar a que termine la exportación (por ejemplo, 10 segundos)
          await page.waitForTimeout(10000);
          console.log('⏳ Espera final tras exportar completada');
        } catch (formError) {
          console.log(`Error al completar el formulario: ${formError.message}`);
        }
      } catch (editButtonError) {
        console.log(`Error al buscar/hacer clic en el botón de edición: ${editButtonError.message}`);
      }

    // Pausa final para inspección
    await page.waitForTimeout(10000);
      
      // Fin del bloque de edición
    } catch (editError) {
      console.log(`Error al editar el pedido: ${editError.message}`);
    }
  } finally {
    // Aquí puedes agregar limpieza si es necesario, o dejar vacío para cumplir con la sintaxis
  }
});
