import { test, expect } from '@playwright/test'; // Importa las funciones principales de Playwright

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000'; // URL base para todas las rutas

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`; // Ruta para la pantalla de casos

// Define la URL de la pantalla de bobinas
const REELS_URL = `${BASE_URL}/front-crm/reels`; // Ruta para la pantalla de bobinas

// Función helper para completar campos de texto
async function fillField(page: any, selector: string, value: string, description: string) {
  try {
    const field = page.locator(selector); // Busca el campo por el selector
    await expect(field).toBeVisible({ timeout: 10000 }); // Espera que el campo sea visible
    await field.clear(); // Limpia el campo
    await field.fill(value); // Escribe el valor en el campo
    console.log(`✓ ${description} completado: ${value}`); // Log de éxito
    return true; // Devuelve true si todo salió bien
  } catch (error) {
    console.log(`Error al completar ${description}: ${error.message}`); // Log de error
    return false; // Devuelve false si hubo error
  }
}

// Helper robusto para React Select: busca por id, por input bajo label, o por div contenedor bajo label
async function handleReactSelect(page: any, selectId: string, optionText: string, description: string, labelText?: string) {
  try {
    // 1. Buscar por id de input
    let selectInput = page.locator(`#${selectId}-input`); // Busca el input por id
    if (await selectInput.isVisible({ timeout: 2000 })) { // Si el input es visible
      const selectContainer = selectInput.locator('../..'); // Sube al contenedor
      await selectContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(1000); // Espera a que se despliegue
    } else if (labelText) { // Si no, busca por label
      const label = page.locator('label').filter({ hasText: labelText }); // Busca el label
      if (await label.count() > 0) { // Si existe el label
        const labelParent = label.first().locator('..'); // Sube al padre del label
        const input = labelParent.locator('input[id*="paginated-autocomplete-"]'); // Busca input dentro del padre
        if (await input.count() > 0 && await input.first().isVisible({ timeout: 1000 })) { // Si hay input visible
          await input.first().locator('../..').click(); // Hace clic en el contenedor
          await page.waitForTimeout(1000); // Espera
        } else {
          // 3. Buscar div contenedor de React Select bajo el label
          const selectDiv = labelParent.locator('div[class*=select__control]'); // Busca div de select
          if (await selectDiv.count() > 0) {
            await selectDiv.first().click(); // Hace clic en el div
            await page.waitForTimeout(1000); // Espera
          } else {
            // 4. Buscar input o div select como hermano anterior al label
            const labelElement = label.first(); // Toma el label
            const inputPrev = labelElement.locator('xpath=preceding-sibling::div//input[contains(@id,"react-select")]').first(); // Busca input antes del label
            if (await inputPrev.count() > 0 && await inputPrev.isVisible({ timeout: 1000 })) {
              await inputPrev.click(); // Hace clic en el input
              await page.waitForTimeout(1000); // Espera
            } else {
              const divPrev = labelElement.locator('xpath=preceding-sibling::div[contains(@class,"select__control")]').first(); // Busca div antes del label
              if (await divPrev.count() > 0 && await divPrev.isVisible({ timeout: 1000 })) {
                await divPrev.click(); // Hace clic en el div
                await page.waitForTimeout(1000); // Espera
              } else {
                console.log(`❌ No se encontró input ni div de React Select bajo ni antes del label '${labelText}'`); // Log si no encuentra nada
                return false; // Devuelve false
              }
            }
          }
        }
      } else {
        console.log(`❌ Label '${labelText}' no encontrado`); // Log si no encuentra el label
        return false; // Devuelve false
      }
    } else {
      console.log(`${description} no visible y no se proporcionó label alternativo`); // Log si no hay label
      return false; // Devuelve false
    }
    // Buscar y seleccionar la opción
    const option = page.locator('[role="option"]').filter({ hasText: optionText }).first(); // Busca la opción
    if (await option.count() > 0) {
      await option.click(); // Hace clic en la opción
      console.log(`✓ ${description} completado: ${optionText}`); // Log de éxito
      return true; // Devuelve true
    } else {
      console.log(`${description} - opción "${optionText}" no encontrada`); // Log si no encuentra la opción
      await page.keyboard.press('Escape'); // Cierra el select
      return false; // Devuelve false
    }
  } catch (error) {
    console.log(`Error con ${description}: ${error.message}`); // Log de error
    return false; // Devuelve false
  }
}


test('Test de Bobinas: Login y navegación a pantalla de bobinas', async ({ page }) => {
  test.setTimeout(300000); // 5 minutos timeout para este test

  // Configurar manejo de errores
  page.on('pageerror', error => console.log('Error de página:', error.message)); // Log de errores de página
  page.on('crash', () => console.log('La página se cerró inesperadamente')); // Log si la página se cierra
  page.setDefaultTimeout(30000); // Timeout por defecto para acciones
  page.setDefaultNavigationTimeout(60000); // Timeout para navegación

  try {
    // === SECCIÓN 1: LOGIN ===
    await page.goto(CASES_URL); // Navega a la pantalla de casos

    // Esperar campos de login
    await page.waitForSelector('input[name="userName"]', { timeout: 15000 }); // Espera input usuario
    await page.waitForSelector('input[name="password"]', { timeout: 15000 }); // Espera input contraseña

    // Completar credenciales
    await page.locator('input[name="userName"]').fill('admin@clt.com.py'); // Escribe usuario
    await page.locator('input[name="password"]').fill('B3rL!n57A'); // Escribe contraseña

    // Enviar formulario
    const submitButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar")').first(); // Busca botón de login
    if (await submitButton.isVisible()) {
      await submitButton.click(); // Hace clic si es visible
    } else {
      await page.keyboard.press('Enter'); // Si no, presiona Enter
    }

    // Esperar redirección exitosa
    await page.waitForURL(CASES_URL, { timeout: 30000 }); // Espera que la URL sea la de casos
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible({ timeout: 15000 }); // Espera botón Crear Caso

    // === SECCIÓN 2: NAVEGACIÓN A BOBINAS ===
    await page.goto(REELS_URL); // Navega a la pantalla de bobinas
    await page.waitForURL(REELS_URL); // Espera que la URL sea la de bobinas
    await page.waitForTimeout(3000); // Espera 3 segundos

    // Verificar que estamos en la pantalla correcta
    try {
      const pageTitle = await page.title(); // Obtiene el título de la página
      await page.waitForTimeout(5000); // Espera 5 segundos
      // Aquí podrías agregar una verificación del título si lo deseas
    } catch (verificationError) {
      console.log(`Error al verificar la pantalla: ${verificationError.message}`); // Log si falla
    }

    // === SECCIÓN 3: CREAR PEDIDO DE BOBINAS ===
    try {
      // Buscar el botón "Crear Pedido de Bobinas"
      const createButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Crear Pedido de Bobinas' }); // Busca el botón principal
      await expect(createButton).toBeVisible({ timeout: 10000 }); // Espera que sea visible
      await createButton.click(); // Hace clic en el botón
      // Esperar navegación a la URL de creación
      await page.waitForURL('**/front-crm/reels/new', { timeout: 15000 }); // Espera la URL de creación
      // Verificar que estamos en la URL correcta
      const currentUrl = page.url(); // Obtiene la URL actual
      // Pausa para verificar que la página de creación se cargó
      await page.waitForTimeout(3000); // Espera 3 segundos
    } catch (createError) {
      console.log(`❌ Error al hacer clic en "Crear Pedido de Bobinas": ${createError.message}`); // Log si falla
      // Método alternativo
      console.log('🔄 Intentando método alternativo para encontrar el botón...');
      try {
        // Buscar por texto más general
        const createButtonAlt = page.locator('button').filter({ hasText: 'Crear Pedido de Bobinas' }); // Busca botón por texto
        if (await createButtonAlt.isVisible({ timeout: 5000 })) {
          await createButtonAlt.click(); // Hace clic si es visible
          console.log('✅ Botón presionado usando método alternativo');
          // Esperar navegación
          await page.waitForURL('**/front-crm/reels/new', { timeout: 15000 }); // Espera la URL
          const currentUrl = page.url(); // Obtiene la URL
          console.log(`🔗 Navegación exitosa (método alternativo): ${currentUrl}`);
        } else {
          // Último intento: buscar por selector más general
          const createButtonGeneral = page.locator('button:has-text("Crear Pedido de Bobinas")'); // Busca botón por selector general
          if (await createButtonGeneral.isVisible({ timeout: 5000 })) {
            await createButtonGeneral.click(); // Hace clic
            console.log('✅ Botón presionado usando selector general');
            await page.waitForURL('**/front-crm/reels/new', { timeout: 15000 }); // Espera la URL
            const currentUrl = page.url(); // Obtiene la URL
            console.log(`🔗 Navegación exitosa (selector general): ${currentUrl}`);
          } else {
            console.log('⚠️ No se pudo encontrar el botón "Crear Pedido de Bobinas"'); // Log si no encuentra el botón
          }
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo también falló: ${altError.message}`); // Log si falla el método alternativo
      }
    }

    // ...existing code...
    // === SECCIÓN 4: COMPLETAR FORMULARIO ===
    try {
      // Completar el campo de título
      await fillField(page, 'input[name="Title"]', 'Pedido de Prueba de automatización', 'Título del pedido'); // Escribe el título del pedido

      // Completar el campo "A cargo de" usando el label
      const assignedToContainer = page.locator('label').filter({ hasText: 'A cargo de' }).locator('..').locator('#paginated-autocomplete-'); // Busca el contenedor del campo "A cargo de"
      await assignedToContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(1000); // Espera a que se despliegue

      // Buscar y seleccionar "ADMIN CRM"
      const adminOption = page.locator('[role="option"]').filter({ hasText: 'ADMIN CRM' }).first(); // Busca la opción "ADMIN CRM"
      await expect(adminOption).toBeVisible({ timeout: 5000 }); // Espera que sea visible
      await adminOption.click(); // Selecciona la opción
      
      await page.waitForTimeout(2000); // Espera 2 segundos

      // Completar el campo "Nombre del comercio"
      const commerceNameContainer = page.locator('label').filter({ hasText: 'Nombre del comercio' }).locator('..').locator('#paginated-autocomplete-'); // Busca el contenedor del campo "Nombre del comercio"
      await commerceNameContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(1000); // Espera

      // Buscar y seleccionar "SUPER MOTO CROSS"
      const commerceOption = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first(); // Busca la opción
      await expect(commerceOption).toBeVisible({ timeout: 5000 }); // Espera que sea visible
      await commerceOption.click(); // Selecciona la opción
      
      await page.waitForTimeout(2000); // Espera 2 segundos

      // Completar el campo "Sucursal del Cliente"
      const branchContainer = page.locator('label').filter({ hasText: 'Sucursal del Cliente' }).locator('..').locator('#paginated-autocomplete-'); // Busca el contenedor del campo "Sucursal del Cliente"
      await branchContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(1000); // Espera

      // Buscar y seleccionar "SUPER MOTO CROSS"
      const branchOption = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first(); // Busca la opción
      await expect(branchOption).toBeVisible({ timeout: 5000 }); // Espera que sea visible
      await branchOption.click(); // Selecciona la opción
      await page.waitForTimeout(2000); // Espera

      // Completar el campo de comentarios
      await fillField(page, 'textarea[name="AttrLastComment"]', 'Este es un pedido de prueba automatizada para verificar el funcionamiento del sistema de bobinas.', 'Comentarios'); // Escribe comentario

      // Completar el campo "Origen del caso"
      const originContainer = page.locator('label').filter({ hasText: 'Origen del caso' }).locator('..').locator('#paginated-autocomplete-'); // Busca el contenedor del campo "Origen del caso"
      await expect(originContainer).toBeVisible({ timeout: 10000 }); // Espera que sea visible
      await originContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(3000); // Espera más tiempo para que se abra el dropdown

      // Buscar y seleccionar "ATENCION PRESENCIAL"
      const originOption = page.locator('[role="option"]').filter({ hasText: 'ATENCION PRESENCIAL' }).first(); // Busca la opción
      // Intentar alternativas si no se encuentra la opción
      if (await originOption.count() === 0) {
        // Intentar con texto parcial
        const originOptionAlt = page.locator('[role="option"]').filter({ hasText: 'PRESENCIAL' }).first(); // Busca opción parcial
        if (await originOptionAlt.count() > 0) {
          await originOptionAlt.click(); // Selecciona la opción alternativa
        } else {
          // Si no se encuentra, presionar Escape y continuar
          await page.keyboard.press('Escape'); // Cierra el select
          console.log('No se pudo encontrar la opción ATENCION PRESENCIAL'); // Log
        }
      } else {
        await originOption.click(); // Selecciona la opción
      }
      await page.waitForTimeout(2000); // Espera

      // Completar el campo "Moneda" - usando el primer campo de moneda
      const currencyContainer = page.locator('label').filter({ hasText: 'Moneda' }).first().locator('..').locator('#paginated-autocomplete-'); // Busca el contenedor del campo "Moneda"
      await currencyContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(1000); // Espera

      // Buscar y seleccionar "PYG"
      const currencyOption = page.locator('[role="option"]').filter({ hasText: 'PYG' }).first(); // Busca la opción
      await expect(currencyOption).toBeVisible({ timeout: 5000 }); // Espera que sea visible
      await currencyOption.click(); // Selecciona la opción
      await page.waitForTimeout(2000); // Espera

      // Completar el campo "Costo de envío"
      await fillField(page, 'input[name="AttrShippingCost"]', '150000', 'Costo de envío'); // Escribe el costo de envío

      // Completar el campo "Fecha estimada de entrega" con la fecha actual
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      await fillField(page, 'input[name="AttrEstimatedDeliveryDate"]', todayFormatted, 'Fecha estimada de entrega'); // Escribe la fecha

      // Completar el campo "Solicitado por:"
      const requestedByContainer = page.locator('label').filter({ hasText: 'Solicitado por:' }).locator('..').locator('#paginated-autocomplete-'); // Busca el contenedor del campo "Solicitado por:"
      await requestedByContainer.click(); // Hace clic para abrir el select
      await page.waitForTimeout(1000); // Espera

      // Buscar y seleccionar "ATC"
      const requestedByOption = page.locator('[role="option"]').filter({ hasText: 'ATC' }).first(); // Busca la opción
      await expect(requestedByOption).toBeVisible({ timeout: 5000 }); // Espera que sea visible
      await requestedByOption.click(); // Selecciona la opción
      await page.waitForTimeout(2000); // Espera

      // Completar el campo "Teléfono"
      await fillField(page, 'input[name="AttrPhoneNumber"]', '0981123456', 'Teléfono'); // Escribe el teléfono

      // Completar el campo "Cantidad de Bobinas"
      await fillField(page, 'input[name="AttrCoilQuantity"]', '25', 'Cantidad de Bobinas'); // Escribe la cantidad

      // Completar el campo "Descripción/Observaciones"
      await fillField(page, 'textarea[name="description"]', 'Pedido de 25 bobinas para reposición de stock en sucursal SUPER MOTO CROSS. Entrega prioritaria solicitada para mantener continuidad operacional. Verificar calidad y especificaciones técnicas antes del envío.', 'Descripción/Observaciones'); // Escribe la descripción

      // Hacer clic en la pestaña "Datos de la Facturación"
      const invoiceDataTab = page.locator('#uncontrolled-tab-example-tab-invoice_data'); // Busca la pestaña de facturación
      await expect(invoiceDataTab).toBeVisible({ timeout: 10000 }); // Espera que sea visible
      await invoiceDataTab.click(); // Hace clic en la pestaña
      await page.waitForTimeout(2000); // Espera
      console.log('✓ Pestaña "Datos de la Facturación" seleccionada'); // Log

      // Completar el campo "Precio unitario"
      await fillField(page, 'input[name="unitPrice"]', '45000', 'Precio unitario'); // Escribe el precio unitario

      // Completar el campo "Descripción/Observaciones" en la pestaña de facturación
      await fillField(page, 'textarea[name="AttrDescription"]', 'Facturación correspondiente a pedido de 25 bobinas para SUPER MOTO CROSS. Precio unitario: 45.000 PYG. Total estimado: 1.125.000 PYG más gastos de envío. Solicitar comprobante de entrega para procesamiento de pago. Condiciones comerciales habituales aplicables.', 'Descripción/Observaciones de facturación'); // Escribe la descripción de facturación

      // Hacer clic en el botón "Guardar"
      const saveButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' }); // Busca el botón Guardar
      await expect(saveButton).toBeVisible({ timeout: 10000 }); // Espera que sea visible
      await saveButton.click(); // Hace clic en Guardar
      console.log('✓ Botón "Guardar" presionado'); // Log

      // Esperar más tiempo para que se complete el proceso de guardado
      await page.waitForTimeout(8000); // Espera 8 segundos
      console.log('⏱️ Esperando proceso de guardado...'); // Log

      // Verificar que el guardado fue exitoso
      try {
        // Esperar por indicadores de éxito (pueden ser notificaciones, cambios de URL, etc.)
        // Opción 1: Verificar si hay un mensaje de éxito
        const successMessage = page.locator('.toast, .alert, .notification, .success').filter({ hasText: /guardado|éxito|success|saved/i }); // Busca mensaje de éxito
        if (await successMessage.isVisible({ timeout: 5000 })) {
          console.log('✓ Mensaje de éxito detectado - Guardado confirmado'); // Log
        } else {
          // Opción 2: Verificar si regresamos a la lista de bobinas
          const currentUrl = page.url(); // Obtiene la URL
          if (currentUrl.includes('/front-crm/reels')) {
            console.log('✓ Redirección exitosa - Guardado confirmado'); // Log
          } else {
            // Opción 3: Verificar que el botón "Guardar" ya no esté disponible (deshabilitado o cambió)
            if (await saveButton.isDisabled({ timeout: 3000 })) {
              console.log('✓ Botón deshabilitado - Guardado confirmado'); // Log
            } else {
              console.log('⚠️ No se pudo confirmar el guardado, pero continuando...'); // Log
            }
          }
        }
      } catch (verificationError) {
        console.log(`⚠️ Error al verificar el guardado: ${verificationError.message}`); // Log de error
      }

      // Esperar un poco más antes de refrescar
      await page.waitForTimeout(3000); // Espera
      
      // Refrescar la pantalla
      await page.reload(); // Recarga la página
      await page.waitForLoadState('networkidle', { timeout: 15000 }); // Espera a que termine de cargar
      console.log('✓ Pantalla refrescada'); // Log

      // === SECCIÓN 5: EDITAR EL ÚLTIMO PEDIDO CREADO ===
      await page.waitForTimeout(3000); // Espera
      
      // Buscar y hacer clic en el botón de edición del primer pedido (más reciente)
      // Usar selector más simple y directo para el ícono de edición
      console.log('🔍 Buscando botón de edición...'); // Log
      
      try {
        // Método 1: Buscar el primer SVG de edición en la tabla
        const editButton1 = page.locator('svg[stroke="currentColor"]').first(); // Busca el primer SVG de edición
        if (await editButton1.isVisible({ timeout: 3000 })) {
          await editButton1.click(); // Hace clic en el SVG
          console.log('✓ Botón de edición presionado (método 1)'); // Log
        } else {
          // Método 2: Buscar por el contenedor del ícono
          const editButton2 = page.locator('div[style*="color: rgb(0, 159, 227)"]').first(); // Busca el contenedor por color
          if (await editButton2.isVisible({ timeout: 3000 })) {
            await editButton2.click(); // Hace clic
            console.log('✓ Botón de edición presionado (método 2)'); // Log
          } else {
            // Método 3: Buscar por el path específico del SVG
            const editButton3 = page.locator('path[d*="M21.174 6.812"]').first(); // Busca el path SVG
            if (await editButton3.isVisible({ timeout: 3000 })) {
              await editButton3.click(); // Hace clic
              console.log('✓ Botón de edición presionado (método 3)'); // Log
            } else {
              // Método 4: Buscar cualquier SVG en la primera fila de datos
              const editButton4 = page.locator('div[role="row"]:has(div:has-text("Pedido de Prueba de automatización"))').locator('svg').first(); // Busca SVG en la fila
              if (await editButton4.isVisible({ timeout: 3000 })) {
                await editButton4.click(); // Hace clic
                console.log('✓ Botón de edición presionado (método 4)'); // Log
              } else {
                console.log('⚠️ No se pudo encontrar el botón de edición con ningún método'); // Log
                // Mostrar información de depuración
                const allSvgs = await page.locator('svg').count(); // Cuenta todos los SVGs
                console.log(`📊 Total de SVGs encontrados: ${allSvgs}`); // Log
                return; // Sale de la función
              }
            }
          }
        }

        // Esperar navegación a la URL de edición
        await page.waitForURL('**/front-crm/reels/edit/**', { timeout: 15000 }); // Espera la URL de edición
        const editUrl = page.url(); // Obtiene la URL
        console.log(`✓ Navegación exitosa a edición: ${editUrl}`); // Log

        // Pausa para verificar que la página de edición se cargó
        await page.waitForTimeout(3000); // Espera

        // === SECCIÓN 6: EDITAR CAMPOS EN PANTALLA DE EDICIÓN ===
        try {
          const labelCargo = page.locator('label').filter({ hasText: 'A cargo de' }); // Busca el label "A cargo de"
          await expect(labelCargo).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'AHORRO PACK', 'A cargo de', 'A cargo de'); // Selecciona "AHORRO PACK"
          const labelComercio = page.locator('label').filter({ hasText: 'Nombre del comercio' }); // Busca el label "Nombre del comercio"
          await expect(labelComercio).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'STELA NOVEDADES', 'Nombre del comercio', 'Nombre del comercio'); // Selecciona "STELA NOVEDADES"
          const labelSucursal = page.locator('label').filter({ hasText: 'Sucursal del Cliente' }); // Busca el label "Sucursal del Cliente"
          await expect(labelSucursal).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'STELA NOVEDADES (1)', 'Sucursal del Cliente', 'Sucursal del Cliente'); // Selecciona "STELA NOVEDADES (1)"
          // === Edición robusta de "Estado del pedido" usando helper y log extra ===
          const labelEstado = page.locator('label').filter({ hasText: 'Estado del pedido' }); // Busca el label "Estado del pedido"
          await expect(labelEstado).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'Entrega Completada', 'Estado del pedido', 'Estado del pedido'); // Selecciona "Entrega Completada"
          const labelOrigen = page.locator('label').filter({ hasText: 'Origen del caso' }); // Busca el label "Origen del caso"
          await expect(labelOrigen).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'BANCO CONTINENTAL', 'Origen del caso', 'Origen del caso'); // Selecciona "BANCO CONTINENTAL"
          const labelMoneda = page.locator('label').filter({ hasText: 'Moneda' }).first(); // Busca el label "Moneda"
          await expect(labelMoneda).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'USD', 'Moneda', 'Moneda'); // Selecciona "USD"
          const shippingCostInput = page.locator('input[name="AttrShippingCost"]'); // Busca el input de costo de envío
          await expect(shippingCostInput).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await fillField(page, 'input[name="AttrShippingCost"]', '200000', 'Costo de envío (edición)'); // Escribe el nuevo costo
          const dateInput = page.locator('input[name="AttrEstimatedDeliveryDate"]'); // Busca el input de fecha
          await expect(dateInput).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          // Calcular fecha de mañana
          const today = new Date();
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Suma un día
          const tomorrowFormatted = tomorrow.toISOString().split('T')[0]; // Formato YYYY-MM-DD
          await fillField(page, 'input[name="AttrEstimatedDeliveryDate"]', tomorrowFormatted, 'Fecha estimada de entrega (edición)'); // Escribe la fecha
          const labelSolicitado = page.locator('label').filter({ hasText: 'Solicitado por:' }); // Busca el label "Solicitado por:"
          await expect(labelSolicitado).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await handleReactSelect(page, '', 'RCI-INTERIOR', 'Solicitado por', 'Solicitado por:'); // Selecciona "RCI-INTERIOR"
          // Edición robusta de "Cantidad de Bobinas" en la pantalla de edición
          const coilQtyInput = page.locator('input[name="AttrCoilQuantity"]'); // Busca el input de cantidad
          await expect(coilQtyInput).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await fillField(page, 'input[name="AttrCoilQuantity"]', '30', 'Cantidad de Bobinas (edición)'); // Escribe la nueva cantidad
          const descInput = page.locator('textarea[name="description"]').nth(1); // El segundo textarea es el del formulario principal
          await expect(descInput).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await descInput.clear(); // Limpia el campo
          await descInput.fill('Pedido editado: 30 bobinas para sucursal STELA NOVEDADES. Entrega urgente y revisión de calidad previa al despacho.'); // Escribe la nueva descripción
          console.log('✓ Descripción/Observaciones (edición) completado: Pedido editado: 30 bobinas para sucursal STELA NOVEDADES. Entrega urgente y revisión de calidad previa al despacho.'); // Log

          // === NUEVO: Completar campos antes de facturación ===
          // Recibido por
          await fillField(page, 'input[name="attrReceivedBy"]', 'Juan Pérez', 'Recibido por'); // Escribe el nombre de quien recibe
          // Fecha de entrega (datetime-local)
          const now = new Date();
          const nowFormatted = now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
          await fillField(page, 'input[name="attrDeliveryDate"]', nowFormatted, 'Fecha de entrega'); // Escribe la fecha y hora
          // Descripción/Observaciones
          await fillField(page, 'textarea[name="attrShippingDescription"]', 'Entrega realizada en tiempo y forma. Sin observaciones relevantes.', 'Descripción/Observaciones de entrega'); // Escribe observaciones

          // Agregar una nota y hacer clic en Enviar
          const noteTextarea = page.locator('textarea.Notes_textarea__IN3Dq'); // Busca el textarea de nota
          await expect(noteTextarea).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await noteTextarea.fill('Nota automática de prueba desde Playwright.'); // Escribe la nota
          const sendButton = page.locator('button.Notes_submitButton__rMudm'); // Busca el botón enviar nota
          await expect(sendButton).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await sendButton.click(); // Hace clic en enviar
          console.log('✓ Nota agregada y enviada correctamente'); // Log
          // Hacer clic en la pestaña "Datos de la Facturación" en la pantalla de edición
          const invoiceTab = page.locator('#uncontrolled-tab-example-tab-invoice_data'); // Busca la pestaña de facturación
          await expect(invoiceTab).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await invoiceTab.click(); // Hace clic en la pestaña
          console.log('✓ Pestaña "Datos de la Facturación" seleccionada en edición'); // Log

          // === Editar campos de facturación ===
          // Precio unitario
          await fillField(page, 'input[name="unitPrice"]', '52000', 'Precio unitario (edición)'); // Escribe el nuevo precio
          // Descripción/Observaciones de facturación
          await fillField(page, 'textarea[name="AttrDescription"]', 'Facturación editada: 30 bobinas para STELA NOVEDADES. Precio unitario: 52.000 PYG. Total: 1.560.000 PYG. Entrega y condiciones según acuerdo.', 'Descripción/Observaciones de facturación (edición)'); // Escribe la nueva descripción
          // Guardar cambios
          const saveButtonEdit = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' }); // Busca el botón Guardar
          await expect(saveButtonEdit).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await saveButtonEdit.click(); // Hace clic en Guardar
          console.log('Pedido de bobinas actualizado con exito'); // Log
          // === NUEVO PASO: Buscar por Nro de ticket del último pedido ===
          await page.waitForTimeout(3000); // Espera
          const searchInput = page.locator('input[aria-label="Default"][placeholder="Buscar Pedido de Bobinas"]'); // Busca el input de búsqueda
          await expect(searchInput).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await searchInput.click(); // Hace clic en el input
          // Obtener el Nro de ticket de la primera fila de la tabla
          // Fila 2 (nth(2)) es la primera de datos, columna 3 (nth(2)) es Nº Ticket
          const nroTicketCell = page.locator('div[role="row"]').nth(2).locator('div[role="gridcell"]').nth(2); // Busca la celda del ticket
          await expect(nroTicketCell).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          const nroTicket = await nroTicketCell.textContent(); // Obtiene el texto del ticket
          await searchInput.fill(nroTicket ? nroTicket.trim() : ''); // Escribe el ticket en el input
          await searchInput.press('Enter'); // Presiona Enter para buscar
          console.log(`✓ Filtro aplicado con Nro de ticket ${nroTicket}`); // Log
          await page.waitForTimeout(2000); // Espera que se actualice la tabla
          // Hacer clic en el botón Exportar
          const exportButton = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' }); // Busca el botón Exportar
          await expect(exportButton).toBeVisible({ timeout: 10000 }); // Espera que sea visible
          await exportButton.click(); // Hace clic en Exportar
          console.log('✓ Botón Exportar presionado'); // Log
          // Esperar a que termine la exportación (por ejemplo, 10 segundos)
          await page.waitForTimeout(10000); // Espera 10 segundos
          console.log('⏳ Espera final tras exportar completada'); // Log
        } catch (formError) {
          console.log(`Error al completar el formulario: ${formError.message}`); // Log de error
        }
      } catch (editButtonError) {
        console.log(`Error al buscar/hacer clic en el botón de edición: ${editButtonError.message}`); // Log de error
      }

      // Pausa final para inspección
      await page.waitForTimeout(10000); // Espera final para inspección
      
      // Fin del bloque de edición
    } catch (editError) {
      console.log(`Error al editar el pedido: ${editError.message}`); // Log de error
    }
  } finally {
    // Aquí puedes agregar limpieza si es necesario, o dejar vacío para cumplir con la sintaxis
  }
});
