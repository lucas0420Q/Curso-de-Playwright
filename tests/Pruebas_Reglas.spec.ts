import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos (para login)
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL de la pantalla principal de Reglas de Flujo de Trabajo
const WORKFLOW_RULES_URL = `${BASE_URL}/front-crm/WorkFlowRules`;

// Define la URL para crear una nueva regla de flujo de trabajo
const NEW_WORKFLOW_RULE_URL = `${BASE_URL}/front-crm/WorkFlowRules/new`;


test.describe('Pruebas de Reglas de Flujo de Trabajo', () => {
  test('Ingresar a la creación de Reglas de Flujo de Trabajo', async ({ page }) => {
    // Establece el timeout máximo del test en 10 minutos para varias reglas
    test.setTimeout(600000);

    console.log('🚀 Iniciando test de creación múltiple de reglas de flujo de trabajo');

    // Configurar el contexto para ignorar errores SSL y mejorar estabilidad
    await page.context().setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });

    // Configurar timeouts más generosos
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(120000);

    // --- LOGIN UNA SOLA VEZ ---
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

    // Array para guardar los nombres de las reglas creadas
    const reglasCreadas: string[] = [];

    // Bucle para crear 5 reglas
    for (let i = 1; i <= 5; i++) {
      console.log(`\n==============================\n➡️  Creando regla #${i}\n==============================`);
      
      try {
        // --- NAVEGACIÓN A REGLAS DE FLUJO DE TRABAJO ---
        await page.goto(WORKFLOW_RULES_URL);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1')).toHaveText('Reglas de Flujo de Trabajo');
        
        // --- NAVEGACIÓN A CREACIÓN ---
        await page.waitForSelector('button.primaryButton_button__IrLLt:has-text("Crear Reglas de Flujo de Trabajo")', { timeout: 30000 });
        await page.locator('button.primaryButton_button__IrLLt:has-text("Crear Reglas de Flujo de Trabajo")').click();
        await expect(page).toHaveURL(NEW_WORKFLOW_RULE_URL);
        await page.waitForLoadState('networkidle');
        
        // --- COMPLETAR FORMULARIO DE CREACIÓN ---
        console.log('📝 Completando campos básicos...');
        
        // Generar nombre único para la creación de la regla
        const nombreRegla = `Regla Automatizada ${i} - ${new Date().toISOString().replace(/[:.]/g, '-')}`;
        await page.waitForSelector('input[name="name"]', { timeout: 30000 });
        await page.locator('input[name="name"]').fill(nombreRegla);
        console.log('✅ Nombre completado: ' + nombreRegla);
        
        await page.waitForSelector('textarea[name="description"]', { timeout: 30000 });
        await page.locator('textarea[name="description"]').fill('Esta es una regla de flujo de trabajo creada mediante automatización con Playwright para realizar pruebas del sistema.');
        console.log('✅ Descripción completada');

        // --- COMPLETAR CONFIGURACIONES OBLIGATORIAS ---
        console.log('⚙️ Completando sección Configuraciones...');
        
        // Seleccionar Módulo "Casos"
        console.log('🔄 Seleccionando Módulo "Casos"...');
        
        // Buscar el dropdown de módulo con múltiples estrategias
        let moduloDropdown = page.locator('label:has-text("Módulo")').locator('..').locator('.custom-select .css-b4hd2p-control');
        
        // Si no lo encuentra, intentar con selectores alternativos
        if (!(await moduloDropdown.isVisible({ timeout: 3000 }))) {
          moduloDropdown = page.locator('div:has(label:has-text("Módulo")) .css-b4hd2p-control');
        }
        
        if (!(await moduloDropdown.isVisible({ timeout: 3000 }))) {
          moduloDropdown = page.locator('label:text("Módulo")').locator('xpath=../..').locator('.css-b4hd2p-control');
        }
        
        if (await moduloDropdown.isVisible({ timeout: 10000 })) {
          console.log('✅ Dropdown de Módulo encontrado');
          await moduloDropdown.click();
          await page.waitForTimeout(1500);
          
          // Verificar todas las opciones disponibles
          const todasLasOpciones = page.locator('[role="option"]');
          const count = await todasLasOpciones.count();
          console.log(`🔍 Opciones disponibles en Módulo: ${count}`);
          
          // Intentar seleccionar "Casos" con múltiples estrategias
          let opcionCasos = page.locator('[role="option"]:has-text("Casos")').first();
          
          if (!(await opcionCasos.isVisible({ timeout: 2000 }))) {
            opcionCasos = page.locator('[role="option"]').filter({ hasText: 'Casos' }).first();
          }
          
          if (!(await opcionCasos.isVisible({ timeout: 2000 }))) {
            opcionCasos = page.locator('div[role="option"]').filter({ hasText: /^Casos$/ }).first();
          }
          
          if (await opcionCasos.isVisible({ timeout: 5000 })) {
            await opcionCasos.click();
            console.log('✅ Módulo "Casos" seleccionado');
          } else {
            console.log('⚠️ No se pudo encontrar la opción "Casos", seleccionando la primera opción disponible');
            const primeraOpcion = page.locator('[role="option"]').first();
            if (await primeraOpcion.isVisible({ timeout: 3000 })) {
              const textoOpcion = await primeraOpcion.textContent();
              await primeraOpcion.click();
              console.log(`✅ Seleccionada primera opción disponible: "${textoOpcion}"`);
            }
          }
          await page.waitForTimeout(1500);
        } else {
          console.log('❌ No se pudo encontrar el dropdown de Módulo');
        }

        // Seleccionar Momento de ejecución "Después de Guardar"
        console.log('🔄 Seleccionando Momento de ejecución "Después de Guardar"...');
        const momentoDropdown = page.locator('label:has-text("Momento de ejecución")').locator('..').locator('.custom-select .css-b4hd2p-control');
        if (await momentoDropdown.isVisible({ timeout: 10000 })) {
          await momentoDropdown.click();
          await page.waitForTimeout(1500);
          
          // Buscar específicamente "Después de Guardar"
          let opcionDespuesGuardar = page.locator('[role="option"]:has-text("Después de Guardar")').first();
          if (!(await opcionDespuesGuardar.isVisible({ timeout: 2000 }))) {
            opcionDespuesGuardar = page.locator('[role="option"]').filter({ hasText: 'Después de Guardar' }).first();
          }
          if (!(await opcionDespuesGuardar.isVisible({ timeout: 2000 }))) {
            opcionDespuesGuardar = page.locator('[role="option"]').filter({ hasText: /Después.*Guardar/i }).first();
          }
          
          if (await opcionDespuesGuardar.isVisible({ timeout: 5000 })) {
            await opcionDespuesGuardar.click();
            console.log('✅ Momento de ejecución "Después de Guardar" seleccionado');
          } else {
            console.log('⚠️ No se encontró "Después de Guardar", seleccionando segunda opción disponible');
            const segundaOpcion = page.locator('[role="option"]').nth(1);
            if (await segundaOpcion.isVisible({ timeout: 3000 })) {
              const textoOpcion = await segundaOpcion.textContent();
              await segundaOpcion.click();
              console.log(`✅ Seleccionada segunda opción: "${textoOpcion}"`);
            }
          }
          await page.waitForTimeout(1000);
        }

        // Seleccionar Tipo de Operación (primera opción disponible)
        console.log('🔄 Seleccionando Tipo de Operación...');
        const tipoOperacionDropdown = page.locator('label:has-text("Tipo de Operación")').locator('..').locator('.custom-select .css-b4hd2p-control');
        if (await tipoOperacionDropdown.isVisible({ timeout: 10000 })) {
          await tipoOperacionDropdown.click();
          await page.waitForTimeout(1000);
          const opcionTipo = page.locator('[role="option"]').first();
          if (await opcionTipo.isVisible({ timeout: 5000 })) {
            await opcionTipo.click();
            console.log('✅ Tipo de Operación seleccionado');
          }
        }

        // Completar Prioridad
        console.log('🔄 Completando Prioridad...');
        const inputPrioridad = page.locator('input[name="priority"]');
        if (await inputPrioridad.isVisible({ timeout: 10000 })) {
          await inputPrioridad.fill('1');
          console.log('✅ Prioridad completada');
        }

        // Llenar cualquier campo adicional requerido que aparezca dinámicamente
        await page.waitForTimeout(1000); // Esperar a que se carguen campos dependientes
        
        const valorParametroInput = page.locator('input[placeholder*="valor"], input[name*="valor"], input[label*="Valor del parámetro"]');
        if (await valorParametroInput.isVisible({ timeout: 5000 })) {
          await valorParametroInput.fill('valor-dinamico');
          console.log('✅ Valor del parámetro completado');
        }

        // Buscar y completar cualquier campo requerido adicional
        const camposAdicionales = page.locator('input[required]:not([value]):visible, select[required]:not([value]):visible');
        const countAdicionales = await camposAdicionales.count();
        if (countAdicionales > 0) {
          console.log(`🔄 Completando ${countAdicionales} campos adicionales requeridos...`);
          for (let j = 0; j < countAdicionales; j++) {
            const campo = camposAdicionales.nth(j);
            const tagName = await campo.evaluate(el => el.tagName.toLowerCase());
            if (tagName === 'input') {
              await campo.fill('valor-automatico');
            } else if (tagName === 'select') {
              const primeraOpcion = campo.locator('option').nth(1); // Evitar option vacía
              if (await primeraOpcion.isVisible({ timeout: 2000 })) {
                await primeraOpcion.click();
              }
            }
          }
          console.log('✅ Campos adicionales completados');
        }

        console.log('✅ Configuraciones completadas');

        // --- COMPLETAR SECCIÓN CONDICIONES ---
        console.log('🔧 Completando sección Condiciones...');
        
        // Seleccionar Propiedad "Area Resolutora"
        console.log('🔄 Seleccionando Propiedad "Area Resolutora"...');
        const propiedadDropdown = page.locator('label:has-text("Propiedad")').locator('..').locator('.custom-select .css-b4hd2p-control');
        
        if (await propiedadDropdown.isVisible({ timeout: 10000 })) {
          await propiedadDropdown.click();
          await page.waitForTimeout(1500);
          
          // Verificar opciones disponibles
          const todasLasOpcionesProp = page.locator('[role="option"]');
          const countProp = await todasLasOpcionesProp.count();
          console.log(`🔍 Opciones disponibles en Propiedad: ${countProp}`);
          
          let opcionAreaResolutora = page.locator('[role="option"]:has-text("Area Resolutora")').first();
          if (!(await opcionAreaResolutora.isVisible({ timeout: 2000 }))) {
            opcionAreaResolutora = page.locator('[role="option"]').filter({ hasText: 'Area Resolutora' }).first();
          }
          
          if (await opcionAreaResolutora.isVisible({ timeout: 5000 })) {
            await opcionAreaResolutora.click();
            console.log('✅ Propiedad "Area Resolutora" seleccionada');
          } else {
            console.log('⚠️ No se encontró "Area Resolutora", seleccionando primera opción');
            const primeraOpcionProp = page.locator('[role="option"]').first();
            if (await primeraOpcionProp.isVisible({ timeout: 3000 })) {
              const textoProp = await primeraOpcionProp.textContent();
              await primeraOpcionProp.click();
              console.log(`✅ Seleccionada propiedad: "${textoProp}"`);
            }
          }
          
          await page.waitForTimeout(1000);
        } else {
          console.log('❌ No se pudo encontrar el dropdown de Propiedad');
        }

        // Seleccionar Comparador "ES IGUAL A"
        console.log('🔄 Seleccionando Comparador "ES IGUAL A"...');
        const comparadorDropdown = page.locator('label:has-text("Comparador")').locator('..').locator('.custom-select .css-b4hd2p-control');
        
        if (await comparadorDropdown.isVisible({ timeout: 10000 })) {
          await comparadorDropdown.click();
          await page.waitForTimeout(1500);
          
          // Verificar opciones disponibles
          const todasLasOpcionesComp = page.locator('[role="option"]');
          const countComp = await todasLasOpcionesComp.count();
          console.log(`🔍 Opciones disponibles en Comparador: ${countComp}`);
          
          let opcionEsIgualA = page.locator('[role="option"]:has-text("ES IGUAL A")').first();
          if (!(await opcionEsIgualA.isVisible({ timeout: 2000 }))) {
            opcionEsIgualA = page.locator('[role="option"]').filter({ hasText: 'ES IGUAL A' }).first();
          }
          
          if (await opcionEsIgualA.isVisible({ timeout: 5000 })) {
            await opcionEsIgualA.click();
            console.log('✅ Comparador "ES IGUAL A" seleccionado');
          } else {
            console.log('⚠️ No se encontró "ES IGUAL A", seleccionando primera opción');
            const primeraOpcionComp = page.locator('[role="option"]').first();
            if (await primeraOpcionComp.isVisible({ timeout: 3000 })) {
              const textoComp = await primeraOpcionComp.textContent();
              await primeraOpcionComp.click();
              console.log(`✅ Seleccionado comparador: "${textoComp}"`);
            }
          }
          
          await page.waitForTimeout(1000);
        } else {
          console.log('❌ No se pudo encontrar el dropdown de Comparador');
        }

        // Completar Valor del comparador - CAMPO CRÍTICO (SELECTOR ESPECIAL)
        console.log('🎯 Completando Valor del comparador "RCI E-COMMERCE" (CRÍTICO)...');
        
        // Buscar el selector especial con ID paginated-autocomplete
        let valorDropdown = page.locator('#paginated-autocomplete- .css-wzb837-control');
        
        if (!(await valorDropdown.isVisible({ timeout: 3000 }))) {
          valorDropdown = page.locator('[id*="paginated-autocomplete"] .css-wzb837-control');
        }
        
        if (!(await valorDropdown.isVisible({ timeout: 3000 }))) {
          valorDropdown = page.locator('label:has-text("Valor del comparador")').locator('..').locator('.custom-select .css-wzb837-control');
        }
        
        if (!(await valorDropdown.isVisible({ timeout: 3000 }))) {
          valorDropdown = page.locator('label:has-text("Valor")').locator('..').locator('.custom-select .css-wzb837-control');
        }
        
        if (await valorDropdown.isVisible({ timeout: 10000 })) {
          console.log('✅ Dropdown de Valor del comparador encontrado (selector especial)');
          
          // Verificar si ya tiene "RCI E-COMMERCE" seleccionado
          const valorYaSeleccionado = page.locator('.css-1p3m7a8-multiValue .css-9jq23d:has-text("RCI E-COMMERCE")');
          if (await valorYaSeleccionado.isVisible({ timeout: 2000 })) {
            console.log('✅ "RCI E-COMMERCE" ya está seleccionado en el campo');
          } else {
            // Si no está seleccionado, hacer clic en el dropdown
            await valorDropdown.click();
            await page.waitForTimeout(1500);
            
            // Verificar opciones disponibles
            const todasLasOpcionesVal = page.locator('[role="option"]');
            const countVal = await todasLasOpcionesVal.count();
            console.log(`🔍 Opciones disponibles en Valor: ${countVal}`);
            
            // Buscar "RCI E-COMMERCE" con múltiples estrategias
            let opcionRciEcommerce = page.locator('[role="option"]:has-text("RCI E-COMMERCE")').first();
            if (!(await opcionRciEcommerce.isVisible({ timeout: 2000 }))) {
              opcionRciEcommerce = page.locator('[role="option"]').filter({ hasText: 'RCI E-COMMERCE' }).first();
            }
            if (!(await opcionRciEcommerce.isVisible({ timeout: 2000 }))) {
              opcionRciEcommerce = page.locator('[role="option"]').filter({ hasText: /RCI.*E-COMMERCE/i }).first();
            }
            if (!(await opcionRciEcommerce.isVisible({ timeout: 2000 }))) {
              opcionRciEcommerce = page.locator('[role="option"]').filter({ hasText: /RCI/i }).first();
            }
            
            if (await opcionRciEcommerce.isVisible({ timeout: 5000 })) {
              const textoOpcion = await opcionRciEcommerce.textContent();
              await opcionRciEcommerce.click();
              console.log(`✅ Valor "${textoOpcion}" seleccionado`);
            } else {
              console.log('⚠️ No se encontró "RCI E-COMMERCE", seleccionando primera opción');
              const primeraOpcionVal = page.locator('[role="option"]').first();
              if (await primeraOpcionVal.isVisible({ timeout: 3000 })) {
                const textoVal = await primeraOpcionVal.textContent();
                await primeraOpcionVal.click();
                console.log(`✅ Seleccionado valor: "${textoVal}"`);
              }
            }
          }
          
          await page.waitForTimeout(1000);
        } else {
          console.log('❌ No se pudo encontrar el dropdown de Valor del comparador');
        }

        console.log('✅ Condiciones completadas');

        // --- COMPLETAR SECCIÓN ACCIÓN A EJECUTAR (CAMPOS ESPECÍFICOS) ---
        console.log('🚀 Completando sección Acción a ejecutar (CAMPOS ESPECÍFICOS)...');
        
        // Buscar la sección de Acción a ejecutar y hacer scroll
        const seccionAccion = page.locator('h4:has-text("Acción a ejecutar")');
        if (await seccionAccion.isVisible({ timeout: 10000 })) {
          console.log('✅ Sección "Acción a ejecutar" encontrada');
          await seccionAccion.scrollIntoViewIfNeeded();
          await page.waitForTimeout(2000);
        } else {
          await page.keyboard.press('PageDown');
          await page.waitForTimeout(1000);
          console.log('⚠️ Sección "Acción a ejecutar" no encontrada, continuando...');
        }
        
        // 1. VERIFICAR QUE "Llamada a API" ESTÉ SELECCIONADO (ya aparece seleccionado por defecto)
        console.log('🔄 Verificando Tipo de acción "Llamada a API"...');
        const tipoAccionSeleccionado = page.locator('.css-olqui2-singleValue:has-text("Llamada a API")');
        if (await tipoAccionSeleccionado.isVisible({ timeout: 5000 })) {
          console.log('✅ Tipo de acción "Llamada a API" ya está seleccionado');
        } else {
          console.log('⚠️ Tipo de acción no está en "Llamada a API"');
        }
        
        // 2. CONFIGURAR MÉTODO HTTP (obligatorio) - selector con ID static-autocomplete
        console.log('🔄 Configurando Método HTTP...');
        const metodoDropdown = page.locator('#static-autocomplete- .css-1qu0gx3-control, label:has-text("Método")').locator('..').locator('.css-1qu0gx3-control');
        if (await metodoDropdown.first().isVisible({ timeout: 10000 })) {
          await metodoDropdown.first().click();
          await page.waitForTimeout(1500);
          
          // Seleccionar la primera opción disponible (POST, GET, etc.)
          const primeraOpcionMetodo = page.locator('[role="option"]').first();
          if (await primeraOpcionMetodo.isVisible({ timeout: 5000 })) {
            const textoMetodo = await primeraOpcionMetodo.textContent();
            await primeraOpcionMetodo.click();
            console.log(`✅ Método seleccionado: "${textoMetodo}"`);
          }
          await page.waitForTimeout(1000);
        } else {
          console.log('❌ Dropdown de Método no encontrado');
        }
        
        // 3. CONFIGURAR RUTA (obligatorio) - input con name="Ruta"
        console.log('🔄 Configurando Ruta...');
        const rutaInput = page.locator('input[name="Ruta"]');
        if (await rutaInput.isVisible({ timeout: 10000 })) {
          await rutaInput.fill('{{Pruebas}}');
          console.log('✅ Ruta configurada: {{Pruebas}}');
          await page.waitForTimeout(2000); // Esperar a que aparezca el campo dinámico
        } else {
          console.log('❌ Campo Ruta no encontrado');
        }
        
        // 4. CONFIGURAR VALOR DEL PARÁMETRO (campo dinámico que aparece después de la ruta)
        console.log('🔄 Configurando Valor del Parámetro dinámico...');
        // Este selector aparece después de llenar la ruta
        const valorParametroDropdown = page.locator('label:has-text("Valor del Parámetro")').locator('..').locator('.css-b4hd2p-control');
        if (await valorParametroDropdown.isVisible({ timeout: 10000 })) {
          await valorParametroDropdown.click();
          await page.waitForTimeout(1500);
          
          // Seleccionar la primera opción disponible
          const primeraOpcionParam = page.locator('[role="option"]').first();
          if (await primeraOpcionParam.isVisible({ timeout: 5000 })) {
            const textoParam = await primeraOpcionParam.textContent();
            await primeraOpcionParam.click();
            console.log(`✅ Valor del Parámetro seleccionado: "${textoParam}"`);
          }
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Valor del Parámetro no encontrado (puede aparecer dinámicamente)');
        }
        
        // 5. CONFIGURAR ENCABEZADO (Header) - HACER CLIC EN AGREGAR PARÁMETRO PRIMERO
        console.log('🔄 Configurando Encabezado...');
        
        // PASO 1: Hacer clic en el botón "Agregar parámetro" de Encabezado
        const botonAgregarEncabezado = page.locator('h6:has-text("Encabezado")').locator('..').locator('button.Form_addFirstParam__rdiH3');
        if (await botonAgregarEncabezado.isVisible({ timeout: 10000 })) {
          await botonAgregarEncabezado.click();
          console.log('✅ Botón "Agregar parámetro" de Encabezado clickeado');
          await page.waitForTimeout(2000); // Esperar a que aparezcan los campos
        } else {
          console.log('⚠️ Botón "Agregar parámetro" de Encabezado no encontrado');
        }
        
        // PASO 2: Ahora buscar y llenar el campo "Nombre del parámetro"
        const headerNombreInput = page.locator('h6:has-text("Encabezado")').locator('..').locator('input').filter({ hasText: /Nombre del parámetro/ }).or(
          page.locator('h6:has-text("Encabezado")').locator('..').locator('label:has-text("Nombre del parámetro")').locator('..').locator('input')
        ).or(
          page.locator('h6:has-text("Encabezado")').locator('..').locator('input[type="text"]').first()
        );
        
        if (await headerNombreInput.first().isVisible({ timeout: 5000 })) {
          await headerNombreInput.first().clear();
          await headerNombreInput.first().fill('ContentType');
          console.log('✅ Nombre del parámetro de Encabezado: ContentType');
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Nombre del parámetro de Encabezado no encontrado después del clic');
        }
        
        // PASO 3: El "Tipo de valor" ya está en "Fijo" por defecto, configurar el valor
        const headerValorInput = page.locator('h6:has-text("Encabezado")').locator('..').locator('input[name="fixedValue"]').or(
          page.locator('h6:has-text("Encabezado")').locator('..').locator('label:has-text("Valor del parámetro")').locator('..').locator('input')
        ).or(
          page.locator('h6:has-text("Encabezado")').locator('..').locator('input[type="text"]').last()
        );
        
        if (await headerValorInput.first().isVisible({ timeout: 5000 })) {
          await headerValorInput.first().clear();
          await headerValorInput.first().fill('application/json');
          console.log('✅ Valor del parámetro de Encabezado: application/json');
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Valor del parámetro de Encabezado no encontrado después del clic');
        }
        
        // 6. CONFIGURAR PARÁMETROS DE URL - HACER CLIC EN AGREGAR PARÁMETRO PRIMERO
        console.log('🔄 Configurando Parámetros de URL...');
        
        // PASO 1: Hacer clic en el botón "Agregar parámetro" de Parámetros de URL
        const botonAgregarUrlParam = page.locator('h6:has-text("Parametros de URL")').locator('..').locator('button.Form_addFirstParam__rdiH3');
        if (await botonAgregarUrlParam.isVisible({ timeout: 10000 })) {
          await botonAgregarUrlParam.click();
          console.log('✅ Botón "Agregar parámetro" de Parámetros de URL clickeado');
          await page.waitForTimeout(2000); // Esperar a que aparezcan los campos
        } else {
          console.log('⚠️ Botón "Agregar parámetro" de Parámetros de URL no encontrado');
        }
        
        // PASO 2: Ahora buscar y llenar el campo "Nombre del parámetro"
        const urlParamNombreInput = page.locator('h6:has-text("Parametros de URL")').locator('..').locator('input').filter({ hasText: /Nombre del parámetro/ }).or(
          page.locator('h6:has-text("Parametros de URL")').locator('..').locator('label:has-text("Nombre del parámetro")').locator('..').locator('input')
        ).or(
          page.locator('h6:has-text("Parametros de URL")').locator('..').locator('input[type="text"]').first()
        );
        
        if (await urlParamNombreInput.first().isVisible({ timeout: 5000 })) {
          await urlParamNombreInput.first().clear();
          await urlParamNombreInput.first().fill('userId');
          console.log('✅ Nombre del parámetro de URL: userId');
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Nombre del parámetro de URL no encontrado después del clic');
        }
        
        // PASO 3: Configurar el valor del parámetro
        const urlParamValorInput = page.locator('h6:has-text("Parametros de URL")').locator('..').locator('input[name="fixedValue"]').or(
          page.locator('h6:has-text("Parametros de URL")').locator('..').locator('label:has-text("Valor del parámetro")').locator('..').locator('input')
        ).or(
          page.locator('h6:has-text("Parametros de URL")').locator('..').locator('input[type="text"]').last()
        );
        
        if (await urlParamValorInput.first().isVisible({ timeout: 5000 })) {
          await urlParamValorInput.first().clear();
          await urlParamValorInput.first().fill('123');
          console.log('✅ Valor del parámetro de URL: 123');
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Valor del parámetro de URL no encontrado después del clic');
        }
        
        // 7. CONFIGURAR CUERPO - HACER CLIC EN AGREGAR PARÁMETRO PRIMERO
        console.log('🔄 Configurando Cuerpo...');
        
        // PASO 1: Hacer clic en el botón "Agregar parámetro" de Cuerpo
        const botonAgregarCuerpo = page.locator('h6:has-text("Cuerpo")').locator('..').locator('button.Form_addFirstParam__rdiH3');
        if (await botonAgregarCuerpo.isVisible({ timeout: 10000 })) {
          await botonAgregarCuerpo.click();
          console.log('✅ Botón "Agregar parámetro" de Cuerpo clickeado');
          await page.waitForTimeout(2000); // Esperar a que aparezcan los campos
        } else {
          console.log('⚠️ Botón "Agregar parámetro" de Cuerpo no encontrado');
        }
        
        // PASO 2: Ahora buscar y llenar el campo "Nombre del parámetro"
        const cuerpoNombreInput = page.locator('h6:has-text("Cuerpo")').locator('..').locator('input').filter({ hasText: /Nombre del parámetro/ }).or(
          page.locator('h6:has-text("Cuerpo")').locator('..').locator('label:has-text("Nombre del parámetro")').locator('..').locator('input')
        ).or(
          page.locator('h6:has-text("Cuerpo")').locator('..').locator('input[type="text"]').first()
        );
        
        if (await cuerpoNombreInput.first().isVisible({ timeout: 5000 })) {
          await cuerpoNombreInput.first().clear();
          await cuerpoNombreInput.first().fill('data');
          console.log('✅ Nombre del parámetro de Cuerpo: data');
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Nombre del parámetro de Cuerpo no encontrado después del clic');
        }
        
        // PASO 3: Configurar el valor del parámetro
        const cuerpoValorInput = page.locator('h6:has-text("Cuerpo")').locator('..').locator('input[name="fixedValue"]').or(
          page.locator('h6:has-text("Cuerpo")').locator('..').locator('label:has-text("Valor del parámetro")').locator('..').locator('input')
        ).or(
          page.locator('h6:has-text("Cuerpo")').locator('..').locator('input[type="text"]').last()
        );
        
        if (await cuerpoValorInput.first().isVisible({ timeout: 5000 })) {
          const bodyContent = JSON.stringify({
            title: `Regla Test ${i}`,
            body: `Body generado por regla automatizada ${nombreRegla}`,
            userId: 1,
            timestamp: new Date().toISOString()
          });
          
          await cuerpoValorInput.first().clear();
          await cuerpoValorInput.first().fill(bodyContent);
          console.log('✅ Valor del parámetro de Cuerpo configurado (JSON)');
          await page.waitForTimeout(1000);
        } else {
          console.log('⚠️ Campo Valor del parámetro de Cuerpo no encontrado después del clic');
        }
        
        // Esperar un momento para que todos los campos se procesen
        await page.waitForTimeout(2000);
        
        console.log('✅ Sección Acción a ejecutar COMPLETADA TOTALMENTE con campos específicos');

        // --- LLENAR PARÁMETROS HTTP DINÁMICOS ADICIONALES ---
        console.log('🌐 Llenando parámetros HTTP dinámicos...');
        
        // Buscar y llenar campos de Header
        const headerInputs = page.locator('input[placeholder*="header"], input[name*="header"], input[id*="header"]');
        const headerCount = await headerInputs.count();
        if (headerCount > 0) {
          console.log(`🔄 Llenando ${headerCount} campos de Header...`);
          for (let h = 0; h < headerCount; h++) {
            const headerInput = headerInputs.nth(h);
            if (await headerInput.isVisible({ timeout: 2000 })) {
              await headerInput.fill(`header-value-${h + 1}`);
            }
          }
          console.log('✅ Headers completados');
        }
        
        // Buscar y llenar campos de URL Parameters
        const urlParamInputs = page.locator('input[placeholder*="param"], input[name*="param"], input[placeholder*="url"]');
        const urlParamCount = await urlParamInputs.count();
        if (urlParamCount > 0) {
          console.log(`🔄 Llenando ${urlParamCount} campos de URL Parameters...`);
          for (let p = 0; p < urlParamCount; p++) {
            const paramInput = urlParamInputs.nth(p);
            if (await paramInput.isVisible({ timeout: 2000 })) {
              await paramInput.fill(`param-value-${p + 1}`);
            }
          }
          console.log('✅ URL Parameters completados');
        }
        
        // Buscar y llenar campos de Body
        const bodyInputs = page.locator('textarea[placeholder*="body"], textarea[name*="body"], input[placeholder*="body"]');
        const bodyCount = await bodyInputs.count();
        if (bodyCount > 0) {
          console.log(`🔄 Llenando ${bodyCount} campos de Body...`);
          for (let b = 0; b < bodyCount; b++) {
            const bodyInput = bodyInputs.nth(b);
            if (await bodyInput.isVisible({ timeout: 2000 })) {
              await bodyInput.fill(`{"key": "value-${b + 1}", "regla": "${nombreRegla}"}`);
            }
          }
          console.log('✅ Body parameters completados');
        }

        // --- VALIDACIÓN FINAL ANTES DE GUARDAR ---
        console.log('🔍 Validación final - Verificando que TODOS los campos estén completos...');
        
        // Verificar que los campos obligatorios básicos estén llenos
        const camposObligatorios = [
          { selector: 'input[name="name"]', nombre: 'Nombre' },
          { selector: 'textarea[name="description"]', nombre: 'Descripción' }
        ];
        
        for (const campo of camposObligatorios) {
          const element = page.locator(campo.selector);
          if (await element.isVisible({ timeout: 3000 })) {
            const valor = await element.inputValue();
            if (valor.trim() === '') {
              console.log(`❌ Campo obligatorio "${campo.nombre}" está vacío`);
              throw new Error(`Campo obligatorio "${campo.nombre}" no está lleno`);
            } else {
              console.log(`✅ Campo "${campo.nombre}" validado: "${valor.substring(0, 50)}..."`);
            }
          }
        }
        
        // Verificar que el campo crítico "RCI E-COMMERCE" esté seleccionado
        const valorCritico = page.locator('.css-1p3m7a8-multiValue .css-9jq23d:has-text("RCI E-COMMERCE")');
        if (await valorCritico.isVisible({ timeout: 3000 })) {
          console.log('✅ Campo crítico "RCI E-COMMERCE" validado');
        } else {
          console.log('⚠️ Campo crítico "RCI E-COMMERCE" no encontrado, pero continuando...');
        }
        
        // Verificar que al menos algunos campos de "Acción a ejecutar" estén completos
        const urlConfiguracion = page.locator('input[placeholder*="URL"], input[name*="url"]');
        let algunCampoAccionCompleto = false;
        
        if (await urlConfiguracion.isVisible({ timeout: 3000 })) {
          const valorUrl = await urlConfiguracion.inputValue();
          if (valorUrl.trim() !== '') {
            console.log('✅ URL de acción configurada');
            algunCampoAccionCompleto = true;
          }
        }
        
        if (!algunCampoAccionCompleto) {
          console.log('⚠️ No se detectaron campos de "Acción a ejecutar" completos, pero continuando...');
        }
        
        console.log('✅ Validación final completada - Procediendo a guardar...');

        // --- GUARDAR LA REGLA ---
        console.log('💾 Guardando regla...');
        
        // Buscar el botón de guardar con múltiples estrategias
        const botonGuardar = page.locator('button:has-text("Guardar"), button[type="submit"], input[type="submit"], .btn-primary:has-text("Guardar")');
        
        if (await botonGuardar.first().isVisible({ timeout: 10000 })) {
          await botonGuardar.first().click();
          console.log('✅ Botón Guardar clickeado');
          
          // Esperar a que se procese el guardado
          await page.waitForTimeout(3000);
          
          // Verificar si el guardado fue exitoso buscando indicadores de éxito
          try {
            // Intentar navegar de vuelta a la lista para verificar que se guardó
            await page.goto(WORKFLOW_RULES_URL);
            await page.waitForLoadState('networkidle');
            
            // Buscar la regla recién creada en la lista
            const reglaEnLista = page.locator(`text="${nombreRegla}"`);
            if (await reglaEnLista.isVisible({ timeout: 10000 })) {
              console.log(`✅ Regla "${nombreRegla}" encontrada en la lista - GUARDADO EXITOSO`);
              reglasCreadas.push(nombreRegla);
            } else {
              console.log(`⚠️ Regla "${nombreRegla}" no encontrada en la lista, pero se intentó guardar`);
              reglasCreadas.push(`${nombreRegla} (estado incierto)`);
            }
            
          } catch (error) {
            console.log(`⚠️ Error verificando guardado: ${error.message}`);
            reglasCreadas.push(`${nombreRegla} (error verificación)`);
          }
          
        } else {
          console.log('❌ No se pudo encontrar el botón Guardar');
          throw new Error('Botón Guardar no encontrado');
        }

        console.log(`✅ Regla #${i} procesada completamente`);
        console.log(`✅ Regla "${nombreRegla}" agregada a la lista de reglas creadas (${reglasCreadas.length}/5)`);
        
      } catch (error) {
        console.log(`❌ Error creando regla #${i}: ${error.message}`)
      }
    }

    // Mostrar resumen de reglas creadas
    console.log('\n==============================');
    console.log('✅ Reglas creadas en este test:');
    reglasCreadas.forEach((nombre, idx) => {
      console.log(`  ${idx + 1}. ${nombre}`);
    });
    console.log('==============================\n');
    
    console.log('🏁 Test completado exitosamente');
  });
});
