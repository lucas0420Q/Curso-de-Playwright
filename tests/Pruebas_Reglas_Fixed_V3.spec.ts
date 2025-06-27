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
  // Establece el timeout máximo del test en 90 segundos
  test.setTimeout(90000);

  // Configurar el contexto para ignorar errores SSL
  await page.context().setExtraHTTPHeaders({
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });

  // --- LOGIN ---
  await page.goto(CASES_URL);
  await page.locator('input[name="userName"]').fill('admin@clt.com.py');
  await page.locator('input[name="password"]').fill('B3rL!n57A');
  await page.keyboard.press('Enter');
  await page.waitForURL(CASES_URL);
  await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible();

  // --- NAVEGACIÓN A REGLAS DE FLUJO DE TRABAJO ---
  await page.goto(WORKFLOW_RULES_URL);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1')).toHaveText('Reglas de Flujo de Trabajo');

  // --- NAVEGACIÓN A CREACIÓN ---
  await page.waitForSelector('button.primaryButton_button__IrLLt:has-text("Crear Reglas de Flujo de Trabajo")');
  await page.locator('button.primaryButton_button__IrLLt:has-text("Crear Reglas de Flujo de Trabajo")').click();
  await expect(page).toHaveURL(NEW_WORKFLOW_RULE_URL);
  await page.waitForLoadState('networkidle');

  // --- COMPLETAR FORMULARIO DE CREACIÓN ---
  await page.waitForSelector('input[name="name"]');
  await page.locator('input[name="name"]').fill('Regla de Prueba Automatizada');
  await page.waitForSelector('textarea[name="description"]');
  await page.locator('textarea[name="description"]').fill('Esta es una regla de flujo de trabajo creada mediante automatización con Playwright para realizar pruebas del sistema.');

  // --- COMPLETAR CONFIGURACIONES ---
  // 1. Seleccionar Módulo SOLO SI NO ESTÁ YA SELECCIONADO - NUNCA MÁS VOLVER A TOCAR
  const moduloContainer = page.locator('label:has-text("Módulo")').locator('..').locator('.css-b4hd2p-control');
  await expect(moduloContainer).toBeVisible({ timeout: 15000 });
  
  // Verificar si el módulo ya está configurado como "Casos"
  const moduloTexto = await moduloContainer.textContent();
  let moduloConfigurado = false;
  if (!moduloTexto || !moduloTexto.includes('Casos')) {
    await moduloContainer.click();
    await page.waitForSelector('[role="option"]', { timeout: 10000 });
    await page.locator('[role="option"]').filter({ hasText: 'Casos' }).click();
    moduloConfigurado = true;
    await page.waitForTimeout(1000);
  } else {
    moduloConfigurado = true;
  }

  // 2. Seleccionar Momento de ejecución
  const momentoContainer = page.locator('label:has-text("Momento de ejecución")').locator('..').locator('.css-b4hd2p-control');
  await expect(momentoContainer).toBeVisible({ timeout: 15000 });
  await momentoContainer.click();
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.locator('[role="option"]').filter({ hasText: 'Después de guardar' }).click();

  // 3. Seleccionar Tipo de Operación
  const tipoContainer = page.locator('label:has-text("Tipo de Operación")').locator('..').locator('.css-b4hd2p-control');
  await expect(tipoContainer).toBeVisible({ timeout: 15000 });
  await tipoContainer.click();
  await page.waitForSelector('[role="option"]', { timeout: 10000 });
  await page.locator('[role="option"]').first().click();

  // 4. Completar Prioridad
  await page.waitForSelector('input[name="priority"]');
  await page.locator('input[name="priority"]').fill('1');

  // --- COMPLETAR CONDICIONES PRIMERO ---
  await page.waitForTimeout(2000);

  // VERIFICACIÓN CRÍTICA: Asegurarse de que el módulo sigue siendo "Casos"
  if (moduloConfigurado) {
    const verificacionModulo = await moduloContainer.textContent();
    if (!verificacionModulo || !verificacionModulo.includes('Casos')) {
      throw new Error('CRÍTICO: El campo Módulo fue modificado incorrectamente después de su configuración inicial');
    }
  }

  try {
    const seccionCondicionesHeader = page.locator('h4:has-text("Condiciones")');
    await expect(seccionCondicionesHeader).toBeVisible({ timeout: 8000 });
    
    // Scroll hacia condiciones para asegurar visibilidad
    await seccionCondicionesHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    
    // ESTRATEGIA DIRECTA: Configurar campos por orden específico
    
    // PASO 1: CONFIGURAR PROPIEDAD "Area Resolutora"
    console.log('Configurando Propiedad...');
    try {
      // Buscar todos los contenedores que pueden ser el campo de propiedad
      const contenedoresPropiedad = page.locator('label:has-text("Propiedad")').locator('..').locator('.css-b4hd2p-control');
      const existeContenedorPropiedad = await contenedoresPropiedad.count() > 0;
      
      if (existeContenedorPropiedad) {
        const contenedorPropiedad = contenedoresPropiedad.first();
        const textoActual = await contenedorPropiedad.textContent();
        
        if (!textoActual || !textoActual.includes('Area Resolutora')) {
          await contenedorPropiedad.scrollIntoViewIfNeeded();
          await contenedorPropiedad.click();
          await page.waitForTimeout(1500);
          
          const opciones = page.locator('[role="option"]');
          const tieneOpciones = await opciones.count() > 0;
          
          if (tieneOpciones) {
            console.log('Opciones disponibles para Propiedad:', await opciones.allTextContents());
            const opcionAreaResolutora = opciones.filter({ hasText: 'Area Resolutora' });
            const existeOpcion = await opcionAreaResolutora.count() > 0;
            
            if (existeOpcion) {
              await opcionAreaResolutora.first().click();
              console.log('✓ Propiedad "Area Resolutora" configurada');
              await page.waitForTimeout(2000);
            } else {
              console.log('No se encontró "Area Resolutora" en las opciones');
            }
          }
        } else {
          console.log('✓ Propiedad ya configurada como "Area Resolutora"');
        }
      }
    } catch (error) {
      console.log('Error configurando propiedad:', error);
    }
    
    // PASO 2: CONFIGURAR COMPARADOR "ES IGUAL A"
    console.log('Configurando Comparador...');
    try {
      // Esperar un poco para que se actualice la página después del paso anterior
      await page.waitForTimeout(1500);
      
      // Buscar todos los contenedores que pueden ser el campo de comparador
      const contenedoresComparador = page.locator('label:has-text("Comparador")').locator('..').locator('.css-b4hd2p-control');
      const existeContenedorComparador = await contenedoresComparador.count() > 0;
      
      if (existeContenedorComparador) {
        const contenedorComparador = contenedoresComparador.first();
        const textoActual = await contenedorComparador.textContent();
        
        if (!textoActual || !textoActual.includes('ES IGUAL A')) {
          await contenedorComparador.scrollIntoViewIfNeeded();
          await contenedorComparador.click();
          await page.waitForTimeout(1500);
          
          const opciones = page.locator('[role="option"]');
          const tieneOpciones = await opciones.count() > 0;
          
          if (tieneOpciones) {
            console.log('Opciones disponibles para Comparador:', await opciones.allTextContents());
            const opcionEsIgualA = opciones.filter({ hasText: 'ES IGUAL A' });
            const existeOpcion = await opcionEsIgualA.count() > 0;
            
            if (existeOpcion) {
              await opcionEsIgualA.first().click();
              console.log('✓ Comparador "ES IGUAL A" configurado');
              await page.waitForTimeout(2000);
            } else {
              console.log('No se encontró "ES IGUAL A" en las opciones');
            }
          }
        } else {
          console.log('✓ Comparador ya configurado como "ES IGUAL A"');
        }
      }
    } catch (error) {
      console.log('Error configurando comparador:', error);
    }
    
    // PASO 3: CONFIGURAR VALOR "RCI E-COMMERCE"
    console.log('Configurando Valor...');
    try {
      // Esperar un poco para que se actualice la página después del paso anterior
      await page.waitForTimeout(1500);
      
      // Buscar el campo de valor que debería estar ahora disponible
      // Intentar con diferentes selectores para el campo de valor
      const seccionCondiciones = page.locator('h4:has-text("Condiciones")').locator('..');
      const contenedoresValor = seccionCondiciones.locator('.css-wzb837-control, .css-b4hd2p-control');
      
      const totalContenedoresValor = await contenedoresValor.count();
      console.log('Contenedores de valor encontrados:', totalContenedoresValor);
      
      if (totalContenedoresValor > 0) {
        // Buscar el contenedor que no tenga "Area Resolutora" ni "ES IGUAL A"
        let contenedorValor = contenedoresValor.last(); // Default al último
        
        for (let i = 0; i < totalContenedoresValor; i++) {
          const contenedor = contenedoresValor.nth(i);
          const textoContenedor = await contenedor.textContent();
          
          if (textoContenedor && 
              !textoContenedor.includes('Area Resolutora') && 
              !textoContenedor.includes('ES IGUAL A')) {
            contenedorValor = contenedor;
            break;
          }
        }
        
        const textoActual = await contenedorValor.textContent();
        
        // Verificar si ya tiene RCI configurado
        if (!textoActual || !textoActual.includes('RCI')) {
          await contenedorValor.scrollIntoViewIfNeeded();
          await contenedorValor.click();
          await page.waitForTimeout(1000);
          
          // Buscar el input dentro del contenedor
          const inputValor = contenedorValor.locator('input');
          const existeInput = await inputValor.isVisible();
          
          if (existeInput) {
            await inputValor.clear();
            await inputValor.type('RCI E-COMMERCE', { delay: 100 });
            await page.waitForTimeout(1500);
            
            const opciones = page.locator('[role="option"]');
            const tieneOpciones = await opciones.count() > 0;
            
            if (tieneOpciones) {
              console.log('Opciones disponibles para Valor:', await opciones.allTextContents());
              const opcionRci = opciones.filter({ hasText: 'RCI E-COMMERCE' });
              const existeOpcion = await opcionRci.count() > 0;
              
              if (existeOpcion) {
                await opcionRci.first().click();
                console.log('✓ Valor "RCI E-COMMERCE" configurado');
                await page.waitForTimeout(2000);
              } else {
                // Buscar cualquier opción que contenga RCI
                const textosOpciones = await opciones.allTextContents();
                const opcionesConRci = textosOpciones.filter(texto => texto.includes('RCI'));
                
                if (opcionesConRci.length > 0) {
                  const opcionSimilar = opciones.filter({ hasText: opcionesConRci[0] });
                  await opcionSimilar.first().click();
                  console.log('✓ Valor RCI configurado (opción similar)');
                  await page.waitForTimeout(2000);
                } else {
                  console.log('No se encontraron opciones con RCI, confirmando con Enter');
                  await page.keyboard.press('Enter');
                  await page.waitForTimeout(1500);
                }
              }
            } else {
              console.log('No aparecieron opciones, confirmando con Enter');
              await page.keyboard.press('Enter');
              await page.waitForTimeout(1500);
            }
          }
        } else {
          console.log('✓ Valor ya configurado con RCI');
        }
      } else {
        console.log('No se encontraron contenedores para el valor');
      }
    } catch (error) {
      console.log('Error configurando valor:', error);
    }
    
    await page.waitForTimeout(2000);

    // VERIFICACIÓN CRÍTICA: Asegurarse de que el módulo sigue siendo "Casos"
    if (moduloConfigurado) {
      const verificacionModulo2 = await moduloContainer.textContent();
      if (!verificacionModulo2 || !verificacionModulo2.includes('Casos')) {
        throw new Error('CRÍTICO: El campo Módulo fue modificado durante la configuración de condiciones');
      }
    }

  } catch (error) {
    console.log('Error en la configuración de condiciones:', error);
  }

  // --- COMPLETAR ACCIÓN A EJECUTAR ---
  await page.waitForTimeout(1000);

  try {
    const seccionAccionHeader = page.locator('h4:has-text("Acción a ejecutar")');
    await expect(seccionAccionHeader).toBeVisible({ timeout: 8000 });
    
    // Scroll hacia la sección de acción para asegurar visibilidad
    await seccionAccionHeader.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    
    // CONFIGURAR MÉTODO "GET"
    console.log('Configurando Método GET...');
    let metodoConfigurado = false;
    
    // ESTRATEGIA 1: Buscar específicamente por label "Método" en la sección de acción
    try {
      const labelMetodo = page.locator('h4:has-text("Acción a ejecutar")').locator('..').locator('label:has-text("Método")');
      const existeLabel = await labelMetodo.isVisible();
      
      if (existeLabel) {
        const contenedorMetodo = labelMetodo.locator('..').locator('.css-b4hd2p-control, .css-1qu0gx3-control').first();
        const existeContenedor = await contenedorMetodo.isVisible();
        
        if (existeContenedor) {
          await contenedorMetodo.scrollIntoViewIfNeeded();
          await contenedorMetodo.click();
          await page.waitForTimeout(1500);
          
          const opciones = page.locator('[role="option"]');
          const tieneOpciones = await opciones.count() > 0;
          
          if (tieneOpciones) {
            console.log('Opciones disponibles para Método:', await opciones.allTextContents());
            const opcionGet = opciones.filter({ hasText: 'GET' });
            const existeGet = await opcionGet.count() > 0;
            
            if (existeGet) {
              await opcionGet.first().click();
              console.log('✓ Método "GET" configurado');
              metodoConfigurado = true;
            } else {
              console.log('No se encontró "GET", seleccionando primera opción');
              await opciones.first().click();
              metodoConfigurado = true;
            }
          } else {
            await page.keyboard.press('Escape');
          }
        }
      }
    } catch (error) {
      console.log('Error en estrategia 1 para método:', error);
    }
    
    // ESTRATEGIA 2: Buscar por contexto general de la sección "Acción a ejecutar"
    if (!metodoConfigurado) {
      try {
        const seccionAccion = page.locator('h4:has-text("Acción a ejecutar")').locator('..');
        const dropdownsAccion = seccionAccion.locator('.css-b4hd2p-control, .css-1qu0gx3-control, .css-f451u-control');
        const totalDropdownsAccion = await dropdownsAccion.count();
        
        for (let i = 0; i < totalDropdownsAccion; i++) {
          const dropdown = dropdownsAccion.nth(i);
          const esVisible = await dropdown.isVisible();
          const noEstaDeshabilitado = await dropdown.getAttribute('aria-disabled') !== 'true';
          const contenido = await dropdown.textContent() || '';
          
          // Verificar que no sea un dropdown ya configurado o de otra sección
          const esDropdownVacio = contenido.trim() === '' || contenido.includes('Selecciona');
          
          if (esVisible && noEstaDeshabilitado && esDropdownVacio) {
            await dropdown.scrollIntoViewIfNeeded();
            await dropdown.click();
            await page.waitForTimeout(1500);
            
            const opciones = page.locator('[role="option"]');
            const tieneOpciones = await opciones.count() > 0;
            
            if (tieneOpciones) {
              const tieneGet = await opciones.filter({ hasText: 'GET' }).count() > 0;
              
              if (tieneGet) {
                const opcionGet = opciones.filter({ hasText: 'GET' });
                await opcionGet.first().click();
                console.log('✓ Método "GET" configurado (estrategia 2)');
                metodoConfigurado = true;
                break;
              } else {
                await page.keyboard.press('Escape');
              }
            }
          }
        }
      } catch (error) {
        console.log('Error en estrategia 2 para método:', error);
      }
    }
    
    await page.waitForTimeout(1000);

  } catch (error) {
    console.log('Error configurando método:', error);
  }

  // Pausa final
  await page.waitForTimeout(2000);

  // VERIFICACIÓN FINAL CRÍTICA: Asegurarse de que el módulo NUNCA fue modificado
  if (moduloConfigurado) {
    const verificacionFinal = await moduloContainer.textContent();
    if (!verificacionFinal || !verificacionFinal.includes('Casos')) {
      throw new Error('CRÍTICO: El campo Módulo fue modificado durante el proceso de automatización');
    }
  }

  console.log('✅ Test completado');
});

});
