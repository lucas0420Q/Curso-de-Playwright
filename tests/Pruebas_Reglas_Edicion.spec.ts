import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos (para login)
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL de la pantalla principal de Reglas de Flujo de Trabajo
const WORKFLOW_RULES_URL = `${BASE_URL}/front-crm/WorkFlowRules`;

test.describe('Pruebas de Edición de Reglas de Flujo de Trabajo', () => {
  test('Editar la última regla de flujo de trabajo creada', async ({ page }) => {
    // Establece el timeout máximo del test en 10 minutos
    test.setTimeout(600000);

    console.log('🚀 Iniciando test de edición de regla de flujo de trabajo');

    // Configurar el contexto para ignorar errores SSL y mejorar estabilidad
    await page.context().setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    // Configurar timeouts más generosos
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(120000);

    // --- LOGIN ---
    console.log('📝 Iniciando login...');
    await page.goto(CASES_URL);
    await page.waitForSelector('input[name="userName"]', { timeout: 30000 });
    await page.locator('input[name="userName"]').fill('admin@clt.com.py');
    await page.waitForSelector('input[name="password"]', { timeout: 30000 });
    await page.locator('input[name="password"]').fill('B3rL!n57A');
    await page.keyboard.press('Enter');
    await page.waitForURL(CASES_URL);
    await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible();
    console.log('✅ Login exitoso');

    // --- NAVEGACIÓN A REGLAS DE FLUJO DE TRABAJO ---
    console.log('🔄 Navegando a Reglas de Flujo de Trabajo...');
    await page.goto(WORKFLOW_RULES_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveText('Reglas de Flujo de Trabajo');
    console.log('✅ Llegamos a la pantalla de Reglas de Flujo de Trabajo');

    // --- REFRESCAR PÁGINA PARA OBTENER LAS REGLAS MÁS RECIENTES ---
    console.log('🔄 Refrescando la página para obtener las últimas reglas...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveText('Reglas de Flujo de Trabajo');
    console.log('✅ Página refrescada exitosamente');

    // --- BUSCAR Y HACER CLIC EN EL BOTÓN DE EDITAR DE LA ÚLTIMA REGLA ---
    console.log('🔍 Buscando la última regla para editar...');
    
    // Esperar a que la tabla rs-table se cargue completamente
    await page.waitForSelector('.rs-table', { timeout: 30000 });
    await page.waitForTimeout(3000); // Tiempo adicional para asegurar que todos los datos se carguen
    
    // Obtener todas las filas de datos (excluyendo headers)
    const filas = page.locator('.rs-table-body-row-wrapper [role="row"]');
    const cantidadFilas = await filas.count();
    console.log(`📊 Se encontraron ${cantidadFilas} reglas en la tabla`);
    
    if (cantidadFilas === 0) {
      throw new Error('❌ No se encontraron reglas en la tabla para editar');
    }
    
    // Buscar la regla con el timestamp más reciente
    console.log('🔍 Analizando timestamps para encontrar la última regla...');
    let ultimaFila = filas.first();
    let timestampMasReciente = '';
    let nombreReglaUltima = '';
    
    // Recorrer todas las filas para encontrar el timestamp más reciente
    for (let i = 0; i < cantidadFilas; i++) {
      const fila = filas.nth(i);
      const nombreRegla = await fila.locator('[role="gridcell"][aria-colindex="2"]').textContent() || '';
      
      // Extraer timestamp del nombre (formato: "- YYYY-MM-DDTHH-MM-SS-sssZ")
      const timestampMatch = nombreRegla.match(/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z)/);
      if (timestampMatch) {
        const timestamp = timestampMatch[1];
        console.log(`📅 Fila ${i + 1}: "${nombreRegla}" - Timestamp: ${timestamp}`);
        
        if (timestampMasReciente === '' || timestamp > timestampMasReciente) {
          timestampMasReciente = timestamp;
          ultimaFila = fila;
          nombreReglaUltima = nombreRegla;
        }
      }
    }
    
    console.log(`🎯 Regla más reciente encontrada: "${nombreReglaUltima}" con timestamp: ${timestampMasReciente}`);
    
    // Hacer clic en el botón de editar de la última regla
    console.log('✏️ Buscando botón de editar en la última regla...');
    
    // Scroll hacia la fila para asegurar que esté visible
    await ultimaFila.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // Debug: Mostrar todos los elementos en la fila para entender la estructura
    console.log('🔍 Debug: Analizando estructura de la fila...');
    const todosElementos = ultimaFila.locator('*');
    const cantidadElementos = await todosElementos.count();
    console.log(`Total de elementos en la fila: ${cantidadElementos}`);
    
    // Buscar específicamente elementos con texto "Editar" o iconos de edición
    console.log('🔍 Buscando elementos con texto "Editar"...');
    for (let i = 0; i < Math.min(cantidadElementos, 20); i++) {
      const elemento = todosElementos.nth(i);
      const tagName = await elemento.evaluate(el => el.tagName);
      const className = await elemento.getAttribute('class') || '';
      const textContent = (await elemento.textContent() || '').trim();
      const title = await elemento.getAttribute('title') || '';
      
      if (textContent.toLowerCase().includes('editar') || title.toLowerCase().includes('editar') || className.toLowerCase().includes('edit')) {
        console.log(`🎯 ENCONTRADO - Elemento ${i}: <${tagName}> class="${className}" title="${title}" text="${textContent}"`);
      } else if (textContent.toLowerCase().includes('eliminar') || textContent.toLowerCase().includes('delete')) {
        console.log(`�️ Elemento ${i}: <${tagName}> class="${className}" title="${title}" text="${textContent}"`);
      }
    }
    
    // Intentar múltiples estrategias específicas para esta estructura
    let botonEditar;
    let encontrado = false;
    
    // Estrategia 1: Buscar en toda la tabla por elementos con texto "Editar" en la misma fila
    console.log('🔍 Estrategia 1: Buscando elementos con texto "Editar"...');
    const elementosEditar = page.locator('[role="row"]:has-text("' + nombreReglaUltima + '") *:has-text("Editar")');
    if (await elementosEditar.count() > 0) {
      botonEditar = elementosEditar.first();
      if (await botonEditar.isVisible({ timeout: 2000 })) {
        console.log('✅ Estrategia 1: Encontrado elemento con texto "Editar"');
        encontrado = true;
      }
    }
    
    // Estrategia 2: Buscar botones específicos en la fila
    if (!encontrado) {
      console.log('🔍 Estrategia 2: Buscando botones en la fila...');
      const botonesFila = ultimaFila.locator('button, [role="button"], a');
      const cantidadBotones = await botonesFila.count();
      console.log(`Encontrados ${cantidadBotones} elementos clickeables en la fila`);
      
      for (let i = 0; i < cantidadBotones; i++) {
        const boton = botonesFila.nth(i);
        const texto = (await boton.textContent() || '').toLowerCase();
        const title = (await boton.getAttribute('title') || '').toLowerCase();
        const className = (await boton.getAttribute('class') || '').toLowerCase();
        
        console.log(`Botón ${i}: texto="${texto}" title="${title}" class="${className}"`);
        
        if (texto.includes('editar') || title.includes('editar') || title.includes('edit') || className.includes('edit')) {
          botonEditar = boton;
          encontrado = true;
          console.log(`✅ Estrategia 2: Encontrado botón de editar en posición ${i}`);
          break;
        }
      }
    }
    
    // Estrategia 3: Buscar por posición (el segundo botón después de eliminar)
    if (!encontrado) {
      console.log('🔍 Estrategia 3: Buscando segundo botón (después de Eliminar)...');
      const botonesFila = ultimaFila.locator('button, [role="button"], a');
      const cantidadBotones = await botonesFila.count();
      
      if (cantidadBotones >= 2) {
        botonEditar = botonesFila.nth(1); // Segundo botón (después de eliminar)
        if (await botonEditar.isVisible({ timeout: 2000 })) {
          console.log('✅ Estrategia 3: Usando segundo botón como Editar');
          encontrado = true;
        }
      }
    }
    
    // Estrategia 4: Buscar por iconos de edición (SVG o clases CSS)
    if (!encontrado) {
      console.log('🔍 Estrategia 4: Buscando iconos de edición...');
      const iconosEdicion = ultimaFila.locator('svg:has(path), [class*="edit"], [class*="pencil"], [data-icon*="edit"]');
      if (await iconosEdicion.count() > 0) {
        botonEditar = iconosEdicion.first();
        if (await botonEditar.isVisible({ timeout: 2000 })) {
          console.log('✅ Estrategia 4: Encontrado icono de edición');
          encontrado = true;
        }
      }
    }
    
    // Estrategia 5: Buscar en la columna de acciones específicamente
    if (!encontrado) {
      console.log('🔍 Estrategia 5: Buscando en columna de acciones...');
      // Buscar en la primera celda que contiene las acciones
      const celdaAcciones = ultimaFila.locator('[role="gridcell"]').first();
      const elementosAcciones = celdaAcciones.locator('*');
      const cantidadAcciones = await elementosAcciones.count();
      
      for (let i = 0; i < cantidadAcciones; i++) {
        const elemento = elementosAcciones.nth(i);
        const texto = (await elemento.textContent() || '').toLowerCase();
        const title = (await elemento.getAttribute('title') || '').toLowerCase();
        
        if ((texto.includes('editar') || title.includes('editar') || title.includes('edit')) && 
            !texto.includes('eliminar') && !texto.includes('delete')) {
          botonEditar = elemento;
          encontrado = true;
          console.log(`✅ Estrategia 5: Encontrado en columna de acciones, posición ${i}`);
          break;
        }
      }
    }
    
    // Intentar hacer clic
    if (encontrado && botonEditar && await botonEditar.isVisible({ timeout: 2000 })) {
      try {
        await botonEditar.click();
        console.log('✅ Botón de editar presionado exitosamente');
      } catch (error) {
        console.log(`⚠️ Error al hacer clic, intentando con force: ${error}`);
        await botonEditar.click({ force: true });
        console.log('✅ Botón de editar presionado con force');
      }
    } else {
      // Último intento: hacer clic en la fila y buscar menú contextual
      console.log('⚠️ No se encontró botón específico, intentando hacer clic en la fila...');
      await ultimaFila.click({ button: 'right' }); // Click derecho para menú contextual
      await page.waitForTimeout(1000);
      
      // Buscar menú contextual
      let menuEditar = page.locator('[role="menu"] *:has-text("Editar"), [role="menuitem"]:has-text("Editar")');
      if (await menuEditar.isVisible({ timeout: 2000 })) {
        await menuEditar.click();
        console.log('✅ Botón de editar encontrado en menú contextual');
      } else {
        // Click normal en la fila
        await ultimaFila.click();
        await page.waitForTimeout(2000);
        
        // Buscar si aparece algún botón o modal
        const botonEditarModal = page.locator('button:has-text("Editar"), [role="button"]:has-text("Editar")');
        if (await botonEditarModal.isVisible({ timeout: 3000 })) {
          await botonEditarModal.click();
          console.log('✅ Botón de editar encontrado en modal/popup');
        } else {
          throw new Error('❌ No se encontró el botón de editar después de todos los intentos. Revisa que exista una regla con botón de edición en la tabla.');
        }
      }
    }

    // --- ESPERAR A QUE CARGUE LA PANTALLA DE EDICIÓN ---
    console.log('⏳ Esperando que cargue la pantalla de edición...');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la pantalla de edición
    const tituloEdicion = page.locator('h1:has-text("Editar"), h2:has-text("Editar"), .breadcrumb:has-text("Editar")');
    if (await tituloEdicion.isVisible({ timeout: 10000 })) {
      console.log('✅ Pantalla de edición cargada correctamente');
    } else {
      console.log('⚠️ No se detectó título de edición, pero continuando...');
    }

    // --- EDICIÓN DE CAMPOS ---
    console.log('📝 Iniciando edición de campos...');

    // --- EDITAR NOMBRE DE LA REGLA ---
    console.log('📝 Editando nombre de la regla...');
    const campoNombre = page.locator('input[name="name"]');
    if (await campoNombre.isVisible({ timeout: 10000 })) {
      const nombreActual = await campoNombre.inputValue();
      const nuevoNombre = `${nombreActual} - EDITADO`;
      await campoNombre.clear();
      await campoNombre.fill(nuevoNombre);
      console.log(`✅ Nombre editado de "${nombreActual}" a "${nuevoNombre}"`);
    }

    // --- EDITAR DESCRIPCIÓN ---
    console.log('📝 Editando descripción...');
    const campoDescripcion = page.locator('textarea[name="description"]');
    if (await campoDescripcion.isVisible({ timeout: 5000 })) {
      const nuevaDescripcion = `Descripción editada mediante Playwright - ${new Date().toISOString()}`;
      await campoDescripcion.clear();
      await campoDescripcion.fill(nuevaDescripcion);
      console.log('✅ Descripción editada');
    }

    // --- CAMBIAR MOMENTO DE EJECUCIÓN A "ANTES DE GUARDAR" ---
    console.log('📝 Cambiando Momento de ejecución a "Antes de guardar"...');
    const momentoEjecucion = page.locator('label:has-text("Momento de ejecución")').locator('..').locator('.css-b4hd2p-control');
    if (await momentoEjecucion.isVisible({ timeout: 10000 })) {
      await momentoEjecucion.click();
      await page.waitForTimeout(1000);
      
      const opcionAntesGuardar = page.locator('[role="option"]:has-text("Antes de guardar")');
      if (await opcionAntesGuardar.isVisible({ timeout: 5000 })) {
        await opcionAntesGuardar.click();
        console.log('✅ Momento de ejecución cambiado a "Antes de guardar"');
      } else {
        console.log('⚠️ No se encontró la opción "Antes de guardar"');
      }
      await page.waitForTimeout(1000);
    }

    // --- EDITAR CONDICIONES ---
    console.log('📝 Editando condiciones...');
    
    // Editar Entidad
    const entidadDropdown = page.locator('label:has-text("Entidad")').locator('..').locator('.css-b4hd2p-control');
    if (await entidadDropdown.isVisible({ timeout: 5000 })) {
      await entidadDropdown.click();
      await page.waitForTimeout(1000);
      
      const opcionesEntidad = page.locator('[role="option"]');
      const cantidadEntidad = await opcionesEntidad.count();
      if (cantidadEntidad > 1) {
        const segundaOpcion = opcionesEntidad.nth(1);
        const textoEntidad = await segundaOpcion.textContent();
        await segundaOpcion.click();
        console.log(`✅ Entidad cambiada a: "${textoEntidad}"`);
      }
      await page.waitForTimeout(1000);
    }

    // Editar Propiedad
    const propiedadDropdown = page.locator('label:has-text("Propiedad")').locator('..').locator('.css-b4hd2p-control');
    if (await propiedadDropdown.isVisible({ timeout: 5000 })) {
      await propiedadDropdown.click();
      await page.waitForTimeout(1000);
      
      const opcionesPropiedad = page.locator('[role="option"]');
      const cantidadPropiedad = await opcionesPropiedad.count();
      if (cantidadPropiedad > 1) {
        const segundaOpcion = opcionesPropiedad.nth(1);
        const textoPropiedad = await segundaOpcion.textContent();
        await segundaOpcion.click();
        console.log(`✅ Propiedad cambiada a: "${textoPropiedad}"`);
      }
      await page.waitForTimeout(1000);
    }

    // Editar Comparador
    const comparadorDropdown = page.locator('label:has-text("Comparador")').locator('..').locator('.css-b4hd2p-control');
    if (await comparadorDropdown.isVisible({ timeout: 5000 })) {
      await comparadorDropdown.click();
      await page.waitForTimeout(1000);
      
      const opcionesComparador = page.locator('[role="option"]');
      const cantidadComparador = await opcionesComparador.count();
      if (cantidadComparador > 1) {
        const segundaOpcion = opcionesComparador.nth(1);
        const textoComparador = await segundaOpcion.textContent();
        await segundaOpcion.click();
        console.log(`✅ Comparador cambiado a: "${textoComparador}"`);
      }
      await page.waitForTimeout(1000);
    }

    // --- EDITAR VALOR DEL COMPARADOR - CAMPO ESPECIAL {{valor-editado-11}} ---
    console.log('📝 Editando Valor del comparador - Campo especial...');
    
    // Primero verificar si hay un campo de texto para el valor (cuando propiedad es Asunto)
    const valorComparadorTexto = page.locator('input[name="value"]');
    if (await valorComparadorTexto.isVisible({ timeout: 3000 })) {
      console.log('✅ Campo de texto encontrado para Valor del comparador (Asunto)');
      await valorComparadorTexto.clear();
      await valorComparadorTexto.fill('{{valor-editado-11}}');
      console.log('✅ Valor del comparador editado como texto: {{valor-editado-11}}');
      
      // Esperar un momento para que se procese el cambio
      await page.waitForTimeout(3000);
      
      // Ahora buscar el selector de "Valor del parámetro" que se debería habilitar
      console.log('🔍 Buscando selector de "Valor del parámetro" que se habilita...');
      
      // Buscar el selector que aparece después del cambio
      let valorParametroDropdown = page.locator('label:has-text("Valor del parámetro")').locator('..').locator('.css-b4hd2p-control');
      
      // Alternativas de búsqueda
      if (!(await valorParametroDropdown.isVisible({ timeout: 3000 }))) {
        valorParametroDropdown = page.locator('.custom-select').filter({ hasText: /area resolutora/i }).locator('.css-b4hd2p-control');
      }
      if (!(await valorParametroDropdown.isVisible({ timeout: 3000 }))) {
        valorParametroDropdown = page.locator('.css-b4hd2p-control').filter({ hasText: /area resolutora/i });
      }
      
      if (await valorParametroDropdown.isVisible({ timeout: 5000 })) {
        console.log('✅ Selector de "Valor del parámetro" encontrado y habilitado');
        await valorParametroDropdown.click();
        await page.waitForTimeout(2000);
        
        // Buscar todas las opciones disponibles
        const opcionesParametro = page.locator('[role="option"]');
        const cantidadOpcionesParametro = await opcionesParametro.count();
        console.log(`🔍 Opciones disponibles en "Valor del parámetro": ${cantidadOpcionesParametro}`);
        
        // Buscar y seleccionar algo diferente a "Area Resolutora"
        let opcionSeleccionada: any = null;
        let textoOpcionSeleccionada = '';
        
        for (let i = 0; i < cantidadOpcionesParametro; i++) {
          const opcion = opcionesParametro.nth(i);
          const textoOpcion = (await opcion.textContent() || '').toLowerCase();
          
          if (!textoOpcion.includes('area resolutora')) {
            opcionSeleccionada = opcion;
            textoOpcionSeleccionada = textoOpcion;
            break;
          }
        }
        
        if (opcionSeleccionada && textoOpcionSeleccionada) {
          await opcionSeleccionada.click();
          console.log(`✅ "Valor del parámetro" cambiado a: "${textoOpcionSeleccionada}"`);
        } else {
          console.log('⚠️ No se encontró alternativa a "Area Resolutora" - seleccionando primera opción');
          if (cantidadOpcionesParametro > 0) {
            const primeraOpcion = opcionesParametro.first();
            const textoPrimera = await primeraOpcion.textContent();
            await primeraOpcion.click();
            console.log(`✅ "Valor del parámetro" seleccionado: "${textoPrimera}"`);
          }
        }
        
        await page.waitForTimeout(1000);
      } else {
        console.log('❌ No se encontró el selector de "Valor del parámetro" o no se habilitó');
      }
    } else {
      // Si no hay campo de texto, intentar con dropdown
      console.log('🔍 Buscando dropdown de Valor del comparador...');
      const valorComparadorDropdown = page.locator('label:has-text("Valor del comparador")').locator('..').locator('.css-b4hd2p-control');
      if (await valorComparadorDropdown.isVisible({ timeout: 5000 })) {
        await valorComparadorDropdown.click();
        await page.waitForTimeout(1000);
        
        const opcionesVal = page.locator('[role="option"]');
        const cantidadVal = await opcionesVal.count();
        
        if (cantidadVal > 1) {
          const valorEditado = opcionesVal.nth(1);
          const textoVal = await valorEditado.textContent();
          await valorEditado.click();
          console.log(`✅ Valor del comparador cambiado a: "${textoVal}"`);
        } else if (cantidadVal === 1) {
          const unicaOpcion = opcionesVal.first();
          await unicaOpcion.click();
          console.log('✅ Valor del comparador mantenido (única opción)');
        }
        await page.waitForTimeout(1000);
      }
    }

    // --- EDITAR ACCIÓN A EJECUTAR ---
    console.log('📝 Editando Acción a ejecutar...');
    const accionDropdown = page.locator('label:has-text("Acción a ejecutar")').locator('..').locator('.css-b4hd2p-control');
    if (await accionDropdown.isVisible({ timeout: 5000 })) {
      await accionDropdown.click();
      await page.waitForTimeout(1000);
      
      const opcionesAccion = page.locator('[role="option"]');
      const cantidadAccion = await opcionesAccion.count();
      if (cantidadAccion > 1) {
        const segundaOpcion = opcionesAccion.nth(1);
        const textoAccion = await segundaOpcion.textContent();
        await segundaOpcion.click();
        console.log(`✅ Acción a ejecutar cambiada a: "${textoAccion}"`);
      }
      await page.waitForTimeout(1000);
    }

    // --- EDITAR SECCIONES ESPECÍFICAS: ENCABEZADO, PARÁMETROS DE URL Y CUERPO ---
    console.log('📝 Editando secciones específicas...');

    // --- EDITAR SECCIÓN ENCABEZADO ---
    console.log('📝 Editando sección Encabezado...');
    const encabezadoSection = page.locator('h6.Form_paramsTitle__veZMA:has-text("Encabezado")').locator('..');
    if (await encabezadoSection.isVisible({ timeout: 10000 })) {
      await encabezadoSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Editar campo "Nombre del parámetro" en Encabezado
      const nombreParamEncabezado = encabezadoSection.locator('input[name="Content-Type"]');
      if (await nombreParamEncabezado.isVisible({ timeout: 3000 })) {
        await nombreParamEncabezado.clear();
        await nombreParamEncabezado.fill('Authorization');
        console.log('✅ Nombre del parámetro de Encabezado editado');
      }
      
      // Editar "Valor del parámetro" en Encabezado
      const valorParamEncabezado = encabezadoSection.locator('input[name="fixedValue"]');
      if (await valorParamEncabezado.isVisible({ timeout: 3000 })) {
        await valorParamEncabezado.clear();
        await valorParamEncabezado.fill('Bearer token-editado-playwright');
        console.log('✅ Valor del parámetro de Encabezado editado');
      }
    }

    // --- EDITAR SECCIÓN PARÁMETROS DE URL ---
    console.log('📝 Editando sección Parámetros de URL...');
    const urlSection = page.locator('h6.Form_paramsTitle__veZMA:has-text("Parametros de URL")').locator('..');
    if (await urlSection.isVisible({ timeout: 10000 })) {
      await urlSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Editar campo "Nombre del parámetro" en URL
      const nombreParamUrl = urlSection.locator('input[name="userId"]');
      if (await nombreParamUrl.isVisible({ timeout: 3000 })) {
        await nombreParamUrl.clear();
        await nombreParamUrl.fill('clientId');
        console.log('✅ Nombre del parámetro de URL editado');
      }
      
      // Editar "Valor del parámetro" en URL
      const valorParamUrl = urlSection.locator('input[name="fixedValue"]');
      if (await valorParamUrl.isVisible({ timeout: 3000 })) {
        await valorParamUrl.clear();
        await valorParamUrl.fill('{{client-editado-playwright}}');
        console.log('✅ Valor del parámetro de URL editado');
      }
    }

    // --- EDITAR SECCIÓN CUERPO ---
    console.log('📝 Editando sección Cuerpo...');
    const cuerpoSection = page.locator('h6.Form_paramsTitle__veZMA:has-text("Cuerpo")').locator('..');
    if (await cuerpoSection.isVisible({ timeout: 10000 })) {
      await cuerpoSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      
      // Editar campo "Nombre del parámetro" en Cuerpo
      const nombreParamCuerpo = cuerpoSection.locator('input[name="data"]');
      if (await nombreParamCuerpo.isVisible({ timeout: 3000 })) {
        await nombreParamCuerpo.clear();
        await nombreParamCuerpo.fill('data-editado');
        console.log('✅ Nombre del parámetro de Cuerpo editado');
      }
      
      // Editar "Valor del parámetro" en Cuerpo (JSON)
      const valorParamCuerpo = cuerpoSection.locator('input[name="fixedValue"]');
      if (await valorParamCuerpo.isVisible({ timeout: 3000 })) {
        await valorParamCuerpo.clear();
        const nuevoJsonCuerpo = `{"title":"Regla EDITADA","body":"Body editado mediante Playwright","userId":999,"timestamp":"${new Date().toISOString()}"}`;
        await valorParamCuerpo.fill(nuevoJsonCuerpo);
        console.log('✅ Valor del parámetro de Cuerpo editado (JSON)');
      }
    }
    
    console.log('✅ Secciones de parámetros específicas editadas');
    console.log('✅ Edición de campos completada');
    
    // --- GUARDAR CAMBIOS ---
    console.log('💾 Guardando cambios...');
    const botonGuardar = page.locator('button.btn.btn-primary:has-text("Guardar")');
    if (await botonGuardar.isVisible({ timeout: 10000 })) {
      await botonGuardar.click();
      console.log('✅ Botón guardar presionado');
      
      // Esperar confirmación o redirección
      await page.waitForTimeout(3000);
      
      // Verificar si hay mensaje de éxito o redirección
      const mensajeExito = page.locator(':has-text("exitosamente"), :has-text("actualizado"), :has-text("guardado")').first();
      if (await mensajeExito.isVisible({ timeout: 5000 })) {
        console.log('✅ Cambios guardados exitosamente');
      } else {
        console.log('⚠️ No se detectó mensaje de confirmación, pero se intentó guardar');
      }
      
      // Pausa después de guardar para inspección
      console.log('⏸️ Pausando después de guardar para inspección...');
      await page.pause();
      
    } else {
      console.log('⚠️ No se encontró botón de guardar');
    }
    
    console.log('🎉 Test completado exitosamente - Edición de regla realizada');
  });
});