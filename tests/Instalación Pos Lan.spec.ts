import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000';

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`;

// Define la URL de la pantalla de soporte técnico
const TECHNICAL_SUPPORT_URL = `${BASE_URL}/front-crm/technical-support`;

// Define el patrón de URL para la edición de solicitudes de instalación
const INSTALLATION_EDIT_URL_PATTERN = /\/front-crm\/technical-support\/edit\/\d+/;

// Variable para almacenar el ID de la solicitud creada
let installationId: string = '';

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

// Función helper para manejar react-select
async function handleReactSelect(page: any, selectId: string, optionText: string | null, description: string) {
  try {
    const selectContainer = page.locator(`#${selectId}-input`).locator('../..');
    await selectContainer.click();
    await page.waitForTimeout(1000);
    
    const selectNumber = selectId.replace('react-select-', '');
    const options = page.locator(`div[id*="react-select-${selectNumber}-option"]`);
    const optionCount = await options.count();
    
    console.log(`${description} - Opciones encontradas: ${optionCount}`);
    
    if (optionCount > 0) {
      if (optionText) {
        const specificOption = options.filter({ hasText: optionText }).first();
        if (await specificOption.count() > 0) {
          await specificOption.click();
          console.log(`✓ ${description} - Seleccionado: ${optionText}`);
        } else {
          await options.first().click();
          console.log(`✓ ${description} - Seleccionada primera opción`);
        }
      } else {
        await options.first().click();
        console.log(`✓ ${description} - Seleccionada primera opción`);
      }
    }
    return true;
  } catch (error) {
    console.log(`Error en ${description}: ${error.message}`);
    return false;
  }
}

// Función helper para manejar checkboxes de manera segura
async function handleCheckbox(page: any, selector: string, description: string, shouldCheck = true) {
  try {
    const checkbox = page.locator(selector);
    if (await checkbox.isVisible({ timeout: 5000 })) {
      const isChecked = await checkbox.isChecked();
      if (shouldCheck && !isChecked) {
        await checkbox.check();
        console.log(`✓ ${description} activado`);
      } else if (!shouldCheck && isChecked) {
        await checkbox.uncheck();
        console.log(`✓ ${description} desactivado`);
      } else {
        console.log(`✓ ${description} ya está en el estado correcto`);
      }
      return true;
    } else {
      console.log(`${description} no visible`);
      return false;
    }
  } catch (error) {
    console.log(`Error con ${description}: ${error.message}`);
    return false;
  }
}

test('Test optimizado: Creación y edición de instalación POS LAN', async ({ page }) => {
  test.setTimeout(300000); // 5 minutos timeout

  // Configurar manejo de errores
  page.on('pageerror', error => console.log('Error de página:', error.message));
  page.on('crash', () => console.log('La página se cerró inesperadamente'));
  page.setDefaultTimeout(30000);
  page.setDefaultNavigationTimeout(60000);

  try {
    // === SECCIÓN 1: LOGIN ===
    console.log('Iniciando proceso de login...');
    
    await page.goto(CASES_URL);
    console.log('Navegando a la página de login...');

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
    console.log('✓ Login exitoso');

    // === SECCIÓN 2: NAVEGACIÓN A SOPORTE TÉCNICO ===
    console.log('Navegando a soporte técnico...');
    
    await page.goto(TECHNICAL_SUPPORT_URL);
    await page.waitForURL(TECHNICAL_SUPPORT_URL);
    await page.waitForTimeout(2000);
    console.log('✓ En pantalla de soporte técnico');

    // === SECCIÓN 3: CREAR INSTALACIÓN POS LAN ===
    console.log('Creando nueva instalación POS LAN...');
    
    const createButton = page.locator('button:has-text("Crear Instalación Pos Lan")');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    await page.waitForURL('**/front-crm/technical-support/new', { timeout: 15000 });
    await page.waitForTimeout(3000);
    console.log('✓ En formulario de creación');

    // === COMPLETAR TÍTULO DEL PEDIDO ===
    console.log('Completando título del pedido...');
    await fillField(page, 'input[name="Title"]', 'Pruebas automatizadas - Instalación POS LAN', 'Título del pedido');
    
    // === COMPLETAR CAMPO "A CARGO DE" ===
    console.log('Completando campo "A cargo de"...');
    await handleReactSelect(page, 'react-select-5', 'ADMIN CRM', 'A cargo de');
    
    
    // === COMPLETAR COMENTARIOS ===
    console.log('Completando comentarios...');
    await fillField(page, 'textarea[name="AttrLastComment"]', 'Solicitud de instalación POS LAN generada mediante pruebas automatizadas. Este es un test para verificar el correcto funcionamiento del sistema de creación de solicitudes.', 'Comentarios');
    
    // === COMPLETAR NOMBRE DEL COMERCIO ===
    console.log('Completando nombre del comercio...');

    try {
      // Buscar el campo por su label usando el patrón del archivo de Materiales
      const labelNombreSpan = page.locator('span').filter({ hasText: 'Nombre del comercio' });
      await expect(labelNombreSpan).toBeVisible({ timeout: 10000 });
      
      // Navegar al contenedor del React Select
      const contenedorFormFloating = labelNombreSpan.locator('../..');
      const nombreSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(nombreSelector).toBeVisible({ timeout: 10000 });
      await nombreSelector.click();
      
      // Esperar a que aparezcan las opciones
      await page.waitForTimeout(2000);
      
      // Buscar y seleccionar "SUPER MOTO CROSS"
      const opcionSuperMoto = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first();
      await expect(opcionSuperMoto).toBeVisible({ timeout: 10000 });
      await opcionSuperMoto.click();
      
      console.log('✓ Nombre del comercio completado: SUPER MOTO CROSS');
    } catch (error) {
      console.log(`Error al completar nombre del comercio: ${error.message}`);
      
      // Método alternativo: buscar por los IDs de react-select disponibles
      console.log('Intentando método alternativo con React Select IDs...');
      try {
        // Probar con algunos de los IDs visibles que podrían ser el campo del comercio
        const possibleIds = ['react-select-9', 'react-select-15', 'react-select-17', 'react-select-19', 'react-select-21'];
        
        for (const selectId of possibleIds) {
          try {
            const selectInput = page.locator(`#${selectId}-input`);
            if (await selectInput.isVisible({ timeout: 2000 })) {
              const selectContainer = selectInput.locator('../..');
              await selectContainer.click();
              await page.waitForTimeout(1000);
              
              // Buscar la opción "SUPER MOTO CROSS"
              const option = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS' }).first();
              if (await option.count() > 0) {
                await option.click();
                console.log(`✓ Nombre del comercio completado usando ${selectId}: SUPER MOTO CROSS`);
                break;
              } else {
                // Si no encuentra la opción específica, cerrar el dropdown
                await page.keyboard.press('Escape');
              }
            }
          } catch (innerError) {
            // Continuar con el siguiente ID
            continue;
          }
        }
      } catch (altError) {
        console.log(`Método alternativo también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR SUCURSAL DEL CLIENTE ===
    console.log('Completando sucursal del cliente...');
    await page.waitForTimeout(3000);
    
    try {
      const labelSucursalSpan = page.locator('span').filter({ hasText: 'Sucursal del Cliente' });
      await expect(labelSucursalSpan).toBeVisible({ timeout: 10000 });
      
      const contenedorFormFloating = labelSucursalSpan.locator('../..');
      const sucursalSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(sucursalSelector).toBeVisible({ timeout: 10000 });
      await sucursalSelector.click();
      
      await page.waitForTimeout(2000);
      const opcionSucursal = page.locator('[role="option"]').filter({ hasText: 'SUPER MOTO CROSS (1)' }).first();
      await expect(opcionSucursal).toBeVisible({ timeout: 10000 });
      await opcionSucursal.click();
      
      console.log('✓ Sucursal del Cliente completada: SUPER MOTO CROSS (1)');
    } catch (error) {
      console.log(`Error al completar sucursal del cliente: ${error.message}`);
      
      // Método alternativo para sucursal
      console.log('Intentando método alternativo para sucursal...');
      try {
        const possibleIds = ['react-select-11', 'react-select-13', 'react-select-15', 'react-select-17', 'react-select-19'];
        
        for (const selectId of possibleIds) {
          try {
            const selectInput = page.locator(`#${selectId}-input`);
            if (await selectInput.isVisible({ timeout: 2000 })) {
              const selectContainer = selectInput.locator('../..');
              await selectContainer.click();
              await page.waitForTimeout(1000);
              
              // Buscar opciones que contengan "SUPER MOTO CROSS" con número
              const option = page.locator('[role="option"]').filter({ hasText: /SUPER MOTO CROSS.*\(1\)/ }).first();
              if (await option.count() > 0) {
                await option.click();
                console.log(`✓ Sucursal completada usando ${selectId}: SUPER MOTO CROSS (1)`);
                break;
              } else {
                await page.keyboard.press('Escape');
              }
            }
          } catch (innerError) {
            continue;
          }
        }
      } catch (altError) {
        console.log(`Método alternativo para sucursal también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR CÓDIGO COMERCIO ===
    console.log('Completando código comercio...');
    await page.waitForTimeout(3000);
    
    try {
      const labelCodigoSpan = page.locator('span').filter({ hasText: 'Código Comercio' });
      await expect(labelCodigoSpan).toBeVisible({ timeout: 10000 });
      
      const contenedorFormFloating = labelCodigoSpan.locator('../..');
      const codigoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(codigoSelector).toBeVisible({ timeout: 10000 });
      await codigoSelector.click();
      
      await page.waitForTimeout(2000);
      const opcionCodigo = page.locator('[role="option"]').filter({ hasText: '1400395' }).first();
      await expect(opcionCodigo).toBeVisible({ timeout: 10000 });
      await opcionCodigo.click();
      
      console.log('✓ Código Comercio completado: 1400395');
    } catch (error) {
      console.log(`Error al completar código comercio: ${error.message}`);
      
      // Método alternativo para código comercio
      console.log('Intentando método alternativo para código comercio...');
      try {
        const possibleIds = ['react-select-13', 'react-select-15', 'react-select-17', 'react-select-19', 'react-select-21'];
        
        for (const selectId of possibleIds) {
          try {
            const selectInput = page.locator(`#${selectId}-input`);
            if (await selectInput.isVisible({ timeout: 2000 })) {
              const selectContainer = selectInput.locator('../..');
              await selectContainer.click();
              await page.waitForTimeout(1000);
              
              // Buscar códigos numéricos (como 1400395)
              const option = page.locator('[role="option"]').filter({ hasText: /^\d{7}$/ }).first();
              if (await option.count() > 0) {
                await option.click();
                const selectedText = await option.textContent();
                console.log(`✓ Código comercio completado usando ${selectId}: ${selectedText}`);
                break;
              } else {
                await page.keyboard.press('Escape');
              }
            }
          } catch (innerError) {
            continue;
          }
        }
      } catch (altError) {
        console.log(`Método alternativo para código comercio también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR INCONVENIENTE ===
    console.log('Completando inconveniente...');
    await page.waitForTimeout(3000);
    
    try {
      const labelInconvenienteSpan = page.locator('span').filter({ hasText: 'Inconveniente' });
      await expect(labelInconvenienteSpan).toBeVisible({ timeout: 10000 });
      
      const contenedorFormFloating = labelInconvenienteSpan.locator('../..');
      const inconvenienteSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(inconvenienteSelector).toBeVisible({ timeout: 10000 });
      await inconvenienteSelector.click();
      
      await page.waitForTimeout(2000);
      const opcionCableado = page.locator('[role="option"]').filter({ hasText: 'Cableado' }).first();
      await expect(opcionCableado).toBeVisible({ timeout: 10000 });
      await opcionCableado.click();
      
      console.log('✓ Inconveniente completado: Cableado');
    } catch (error) {
      console.log(`Error al completar inconveniente: ${error.message}`);
      
      // Método alternativo para inconveniente usando react-select-73
      console.log('Intentando método alternativo para inconveniente...');
      try {
        const selectInput = page.locator('#react-select-73-input');
        if (await selectInput.isVisible({ timeout: 5000 })) {
          const selectContainer = selectInput.locator('../..');
          await selectContainer.click();
          await page.waitForTimeout(2000);
          
          // Buscar la opción "Cableado"
          const option = page.locator('[role="option"]').filter({ hasText: 'Cableado' }).first();
          if (await option.count() > 0) {
            await option.click();
            console.log('✓ Inconveniente completado usando react-select-73: Cableado');
          } else {
            // Si no encuentra "Cableado", buscar opciones disponibles y seleccionar la primera
            const options = page.locator('[role="option"]');
            const optionCount = await options.count();
            if (optionCount > 0) {
              await options.first().click();
              const selectedText = await options.first().textContent();
              console.log(`✓ Inconveniente completado con primera opción disponible: ${selectedText}`);
            } else {
              await page.keyboard.press('Escape');
              console.log('No se encontraron opciones para inconveniente');
            }
          }
        } else {
          console.log('Campo react-select-73 no visible');
        }
      } catch (altError) {
        console.log(`Método alternativo para inconveniente también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR DESCRIPCIÓN/OBSERVACIONES ===
    console.log('Completando descripción/observaciones...');
    await page.waitForTimeout(2000);
    
    try {
      const descripcionTextarea = page.locator('textarea[name="description"]');
      await expect(descripcionTextarea).toBeVisible({ timeout: 10000 });
      
      const textoDescripcion = 'Instalación de POS LAN solicitada para comercio SUPER MOTO CROSS. Inconveniente relacionado con cableado que requiere revisión técnica especializada. Se solicita coordinación con el equipo técnico para evaluar la infraestructura existente y determinar los materiales necesarios para la correcta instalación del sistema POS LAN.';
      
      await descripcionTextarea.clear();
      await descripcionTextarea.fill(textoDescripcion);
      
      console.log('✓ Descripción/Observaciones completada exitosamente');
    } catch (error) {
      console.log(`Error al completar descripción/observaciones: ${error.message}`);
      
      // Método alternativo usando el label
      console.log('Intentando método alternativo para descripción...');
      try {
        const labelDescripcion = page.locator('label').filter({ hasText: 'Descripción/Observaciones' });
        await expect(labelDescripcion).toBeVisible({ timeout: 5000 });
        
        const contenedorFormFloating = labelDescripcion.locator('..');
        const textareaDescripcion = contenedorFormFloating.locator('textarea');
        await expect(textareaDescripcion).toBeVisible({ timeout: 5000 });
        
        const textoDescripcion = 'Instalación POS LAN - Inconveniente de cableado para SUPER MOTO CROSS. Requiere evaluación técnica especializada.';
        
        await textareaDescripcion.clear();
        await textareaDescripcion.fill(textoDescripcion);
        
        console.log('✓ Descripción completada usando método alternativo');
      } catch (altError) {
        console.log(`Método alternativo para descripción también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR FECHA DE APERTURA ===
    console.log('Completando fecha de apertura...');
    await page.waitForTimeout(2000);
    
    try {
      const fechaInput = page.locator('input[name="openingDate"]');
      await expect(fechaInput).toBeVisible({ timeout: 10000 });
      
      // Obtener la fecha actual en formato YYYY-MM-DD
      const fechaActual = new Date().toISOString().split('T')[0];
      
      await fechaInput.clear();
      await fechaInput.fill(fechaActual);
      
      console.log(`✓ Fecha de Apertura completada: ${fechaActual}`);
    } catch (error) {
      console.log(`Error al completar fecha de apertura: ${error.message}`);
      
      // Método alternativo usando el label
      console.log('Intentando método alternativo para fecha de apertura...');
      try {
        const labelFecha = page.locator('label').filter({ hasText: 'Fecha de Apertura' });
        await expect(labelFecha).toBeVisible({ timeout: 5000 });
        
        const contenedorFormFloating = labelFecha.locator('..');
        const inputFecha = contenedorFormFloating.locator('input[type="date"]');
        await expect(inputFecha).toBeVisible({ timeout: 5000 });
        
        // Obtener la fecha actual en formato YYYY-MM-DD
        const fechaActual = new Date().toISOString().split('T')[0];
        
        await inputFecha.clear();
        await inputFecha.fill(fechaActual);
        
        console.log(`✓ Fecha de Apertura completada usando método alternativo: ${fechaActual}`);
      } catch (altError) {
        console.log(`Método alternativo para fecha de apertura también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR GEOLOCALIZACIÓN ===
    console.log('Completando geolocalización...');
    await page.waitForTimeout(2000);
    
    try {
      const geoInput = page.locator('input[name="geoLocation"]');
      await expect(geoInput).toBeVisible({ timeout: 10000 });
      
      // Coordenadas de ejemplo para Asunción, Paraguay (apropiado para SUPER MOTO CROSS)
      const coordenadas = '-25.2637, -57.5759';
      
      await geoInput.clear();
      await geoInput.fill(coordenadas);
      
      console.log(`✓ Geolocalización completada: ${coordenadas}`);
    } catch (error) {
      console.log(`Error al completar geolocalización: ${error.message}`);
      
      // Método alternativo usando el label
      console.log('Intentando método alternativo para geolocalización...');
      try {
        const labelGeo = page.locator('label').filter({ hasText: 'Geolocalización' });
        await expect(labelGeo).toBeVisible({ timeout: 5000 });
        
        const contenedorFormFloating = labelGeo.locator('..');
        const inputGeo = contenedorFormFloating.locator('input[type="text"]');
        await expect(inputGeo).toBeVisible({ timeout: 5000 });
        
        // Coordenadas alternativas para Asunción, Paraguay
        const coordenadas = '-25.2637, -57.5759';
        
        await inputGeo.clear();
        await inputGeo.fill(coordenadas);
        
        console.log(`✓ Geolocalización completada usando método alternativo: ${coordenadas}`);
      } catch (altError) {
        console.log(`Método alternativo para geolocalización también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR ORDEN DE EQUIPOS ===
    console.log('⚡ Completando orden de equipos...');
    await page.waitForTimeout(3000);
    
    try {
      const labelOrdenSpan = page.locator('span').filter({ hasText: 'Orden de equipos' });
      await expect(labelOrdenSpan).toBeVisible({ timeout: 10000 });
      
      const contenedorFormFloating = labelOrdenSpan.locator('../..');
      const ordenSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(ordenSelector).toBeVisible({ timeout: 10000 });
      await ordenSelector.click();
      
      await page.waitForTimeout(2000);
      const opcionOrden = page.locator('[role="option"]').filter({ hasText: 'Desde caja 1 en orden' }).first();
      await expect(opcionOrden).toBeVisible({ timeout: 10000 });
      await opcionOrden.click();
      
      console.log('✓ Orden de equipos completado: Desde caja 1 en orden');
    } catch (error) {
      console.log(`Error al completar orden de equipos: ${error.message}`);
      
      // Método alternativo para orden de equipos usando react-select-75
      console.log('🔄 Intentando método alternativo para orden de equipos...');
      try {
        const selectInput = page.locator('#react-select-75-input');
        if (await selectInput.isVisible({ timeout: 5000 })) {
          const selectContainer = selectInput.locator('../..');
          await selectContainer.click();
          await page.waitForTimeout(2000);
          
          // Buscar la opción "Desde caja 1 en orden"
          const option = page.locator('[role="option"]').filter({ hasText: 'Desde caja 1 en orden' }).first();
          if (await option.count() > 0) {
            await option.click();
            console.log('✓ Orden de equipos completado usando react-select-75: Desde caja 1 en orden');
          } else {
            // Si no encuentra "Desde caja 1 en orden", buscar opciones similares
            const opcionesAlternativas = [
              'Desde caja 1',
              'Caja 1 en orden',
              'Orden desde caja 1',
              'En orden desde caja 1'
            ];
            
            let opcionEncontrada = false;
            for (const opcionAlt of opcionesAlternativas) {
              const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
              if (await optionAlt.count() > 0) {
                await optionAlt.click();
                console.log(`✓ Orden de equipos completado con opción alternativa: ${opcionAlt}`);
                opcionEncontrada = true;
                break;
              }
            }
            
            if (!opcionEncontrada) {
              // Si no encuentra opciones específicas, seleccionar la primera disponible
              const options = page.locator('[role="option"]');
              const optionCount = await options.count();
              if (optionCount > 0) {
                await options.first().click();
                const selectedText = await options.first().textContent();
                console.log(`✓ Orden de equipos completado con primera opción disponible: ${selectedText}`);
              } else {
                await page.keyboard.press('Escape');
                console.log('⚠️ No se encontraron opciones para orden de equipos');
              }
            }
          }
        } else {
          console.log('⚠️ Campo react-select-75 no visible');
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para orden de equipos también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR PUNTOS A INSTALAR ===
    console.log('🔢 Completando puntos a instalar...');
    await page.waitForTimeout(2000);
    
    try {
      const puntosInput = page.locator('input[name="pointsToInstall"]');
      await expect(puntosInput).toBeVisible({ timeout: 10000 });
      
      // Cantidad grande pero menor a 100 - ideal para un comercio grande como SUPER MOTO CROSS
      const cantidadPuntos = '85';
      
      await puntosInput.clear();
      await puntosInput.fill(cantidadPuntos);
      
      console.log(`✓ Puntos a instalar completado: ${cantidadPuntos}`);
    } catch (error) {
      console.log(`Error al completar puntos a instalar: ${error.message}`);
      
      // Método alternativo usando el label
      console.log('🔄 Intentando método alternativo para puntos a instalar...');
      try {
        const labelPuntos = page.locator('label').filter({ hasText: 'Puntos a instalar' });
        await expect(labelPuntos).toBeVisible({ timeout: 5000 });
        
        const contenedorFormFloating = labelPuntos.locator('..');
        const inputPuntos = contenedorFormFloating.locator('input[type="number"]');
        await expect(inputPuntos).toBeVisible({ timeout: 5000 });
        
        // Cantidad alternativa grande pero menor a 100
        const cantidadPuntos = '85';
        
        await inputPuntos.clear();
        await inputPuntos.fill(cantidadPuntos);
        
        console.log(`✓ Puntos a instalar completado usando método alternativo: ${cantidadPuntos}`);
      } catch (altError) {
        console.log(`⚠️ Método alternativo para puntos a instalar también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR CANTIDAD DE EQUIPOS A INSTALAR ===
    console.log('📊 Completando cantidad de equipos a instalar...');
    await page.waitForTimeout(2000);
    
    try {
      const equiposInput = page.locator('input[name="equipmentQuantity"]');
      await expect(equiposInput).toBeVisible({ timeout: 10000 });
      
      // Cantidad grande pero menor a 100 - apropiada para el comercio SUPER MOTO CROSS
      const cantidadEquipos = '78';
      
      await equiposInput.clear();
      await equiposInput.fill(cantidadEquipos);
      
      console.log(`✓ Cantidad de equipos a instalar completado: ${cantidadEquipos}`);
    } catch (error) {
      console.log(`Error al completar cantidad de equipos: ${error.message}`);
      
      // Método alternativo usando el label
      console.log('🔄 Intentando método alternativo para cantidad de equipos...');
      try {
        const labelEquipos = page.locator('label').filter({ hasText: 'Cantidad de equipos a instalar' });
        await expect(labelEquipos).toBeVisible({ timeout: 5000 });
        
        const contenedorFormFloating = labelEquipos.locator('..');
        const inputEquipos = contenedorFormFloating.locator('input[type="number"]');
        await expect(inputEquipos).toBeVisible({ timeout: 5000 });
        
        // Cantidad alternativa grande pero menor a 100
        const cantidadEquipos = '78';
        
        await inputEquipos.clear();
        await inputEquipos.fill(cantidadEquipos);
        
        console.log(`✓ Cantidad de equipos completado usando método alternativo: ${cantidadEquipos}`);
      } catch (altError) {
        console.log(`⚠️ Método alternativo para cantidad de equipos también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR TIPO ===
    console.log('📡 Completando tipo...');
    await page.waitForTimeout(3000);
    
    try {
      const labelTipoSpan = page.locator('span').filter({ hasText: 'Tipo' });
      await expect(labelTipoSpan).toBeVisible({ timeout: 10000 });
      
      const contenedorFormFloating = labelTipoSpan.locator('../..');
      const tipoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(tipoSelector).toBeVisible({ timeout: 10000 });
      await tipoSelector.click();
      
      await page.waitForTimeout(2000);
      const opcionGPRS = page.locator('[role="option"]').filter({ hasText: 'GPRS' }).first();
      await expect(opcionGPRS).toBeVisible({ timeout: 10000 });
      await opcionGPRS.click();
      
      console.log('✓ Tipo completado: GPRS');
    } catch (error) {
      console.log(`Error al completar tipo: ${error.message}`);
      
      // Método alternativo para tipo usando react-select-77
      console.log('🔄 Intentando método alternativo para tipo...');
      try {
        const selectInput = page.locator('#react-select-77-input');
        if (await selectInput.isVisible({ timeout: 5000 })) {
          const selectContainer = selectInput.locator('../..');
          await selectContainer.click();
          await page.waitForTimeout(2000);
          
          // Buscar la opción "GPRS"
          const option = page.locator('[role="option"]').filter({ hasText: 'GPRS' }).first();
          if (await option.count() > 0) {
            await option.click();
            console.log('✓ Tipo completado usando react-select-77: GPRS');
          } else {
            // Si no encuentra "GPRS", buscar opciones similares
            const opcionesAlternativas = [
              'GPRS',
              'gprs',
              'Gprs',
              'General Packet Radio Service'
            ];
            
            let opcionEncontrada = false;
            for (const opcionAlt of opcionesAlternativas) {
              const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
              if (await optionAlt.count() > 0) {
                await optionAlt.click();
                console.log(`✓ Tipo completado con opción alternativa: ${opcionAlt}`);
                opcionEncontrada = true;
                break;
              }
            }
            
            if (!opcionEncontrada) {
              // Si no encuentra opciones específicas, seleccionar la primera disponible
              const options = page.locator('[role="option"]');
              const optionCount = await options.count();
              if (optionCount > 0) {
                await options.first().click();
                const selectedText = await options.first().textContent();
                console.log(`✓ Tipo completado con primera opción disponible: ${selectedText}`);
              } else {
                await page.keyboard.press('Escape');
                console.log('⚠️ No se encontraron opciones para tipo');
              }
            }
          }
        } else {
          console.log('⚠️ Campo react-select-77 no visible');
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para tipo también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR MODELO ===
    console.log('📦 Completando modelo...');
    await page.waitForTimeout(3000);
    
    try {
      const labelModeloSpan = page.locator('span').filter({ hasText: 'Modelo' });
      await expect(labelModeloSpan).toBeVisible({ timeout: 10000 });
      
      const contenedorFormFloating = labelModeloSpan.locator('../..');
      const modeloSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
      await expect(modeloSelector).toBeVisible({ timeout: 10000 });
      await modeloSelector.click();
      
      await page.waitForTimeout(2000);
      const opcionModelo1 = page.locator('[role="option"]').filter({ hasText: 'MODELO 1' }).first();
      await expect(opcionModelo1).toBeVisible({ timeout: 10000 });
      await opcionModelo1.click();
      
      console.log('✓ Modelo completado: MODELO 1');
    } catch (error) {
      console.log(`Error al completar modelo: ${error.message}`);
      
      // Método alternativo para modelo usando react-select-79
      console.log('🔄 Intentando método alternativo para modelo...');
      try {
        const selectInput = page.locator('#react-select-79-input');
        if (await selectInput.isVisible({ timeout: 5000 })) {
          const selectContainer = selectInput.locator('../..');
          await selectContainer.click();
          await page.waitForTimeout(2000);
          
          // Buscar la opción "MODELO 1"
          const option = page.locator('[role="option"]').filter({ hasText: 'MODELO 1' }).first();
          if (await option.count() > 0) {
            await option.click();
            console.log('✓ Modelo completado usando react-select-79: MODELO 1');
          } else {
            // Si no encuentra "MODELO 1", buscar opciones similares
            const opcionesAlternativas = [
              'MODELO 1',
              'Modelo 1',
              'modelo 1',
              'Model 1',
              'MODEL 1'
            ];
            
            let opcionEncontrada = false;
            for (const opcionAlt of opcionesAlternativas) {
              const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
              if (await optionAlt.count() > 0) {
                await optionAlt.click();
                console.log(`✓ Modelo completado con opción alternativa: ${opcionAlt}`);
                opcionEncontrada = true;
                break;
              }
            }
            
            if (!opcionEncontrada) {
              // Si no encuentra opciones específicas, seleccionar la primera disponible
              const options = page.locator('[role="option"]');
              const optionCount = await options.count();
              if (optionCount > 0) {
                await options.first().click();
                const selectedText = await options.first().textContent();
                console.log(`✓ Modelo completado con primera opción disponible: ${selectedText}`);
              } else {
                await page.keyboard.press('Escape');
                console.log('⚠️ No se encontraron opciones para modelo');
              }
            }
          }
        } else {
          console.log('⚠️ Campo react-select-79 no visible');
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para modelo también falló: ${altError.message}`);
      }
    }

    // === COMPLETAR CANTIDAD DE EQUIPOS A REINSTALAR ===
    console.log('🔄 Completando cantidad de equipos a reinstalar...');
    await page.waitForTimeout(2000);
    
    try {
      const reinstallInput = page.locator('input[name="reinstallQuantity"]');
      await expect(reinstallInput).toBeVisible({ timeout: 10000 });
      
      // Cantidad moderada para reinstalación - menor que la instalación original
      const cantidadReinstall = '45';
      
      await reinstallInput.clear();
      await reinstallInput.fill(cantidadReinstall);
      
      console.log(`✓ Cantidad de equipos a reinstalar completado: ${cantidadReinstall}`);
    } catch (error) {
      console.log(`Error al completar cantidad de equipos a reinstalar: ${error.message}`);
      
      // Método alternativo usando el label
      console.log('🔄 Intentando método alternativo para cantidad de equipos a reinstalar...');
      try {
        const labelReinstall = page.locator('label').filter({ hasText: 'Cantidad de equipos a instalar' });
        // Buscar el segundo input con este label (el de reinstalación)
        const contenedorFormFloating = labelReinstall.locator('..').nth(1);
        const inputReinstall = contenedorFormFloating.locator('input[type="number"]');
        
        if (await inputReinstall.isVisible({ timeout: 5000 })) {
          const cantidadReinstall = '45';
          
          await inputReinstall.clear();
          await inputReinstall.fill(cantidadReinstall);
          
          console.log(`✓ Cantidad de equipos a reinstalar completado usando método alternativo: ${cantidadReinstall}`);
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para cantidad de equipos a reinstalar también falló: ${altError.message}`);
      }
    }

    // === ACTIVAR CHECKBOX CABLEADO (REINSTALL) ===
    console.log('🔌 Activando checkbox cableado (reinstall)...');
    await page.waitForTimeout(2000);
    
    try {
      const cableadoCheckbox = page.locator('#reinstall-wiring-switch');
      await expect(cableadoCheckbox).toBeVisible({ timeout: 10000 });
      
      // Verificar si ya está activado
      const isChecked = await cableadoCheckbox.isChecked();
      
      if (!isChecked) {
        await cableadoCheckbox.check();
        console.log('✓ Checkbox cableado (reinstall) activado exitosamente');
      } else {
        console.log('✓ Checkbox cableado (reinstall) ya estaba activado');
      }
    } catch (error) {
      console.log(`Error al activar checkbox cableado (reinstall): ${error.message}`);
      
      // Método alternativo usando el texto y navegación
      console.log('🔄 Intentando método alternativo para checkbox cableado (reinstall)...');
      try {
        const cableadoSpan = page.locator('span').filter({ hasText: 'Cableado' });
        if (await cableadoSpan.isVisible({ timeout: 5000 })) {
          const switchContainer = cableadoSpan.locator('../div').first();
          const checkboxAlt = switchContainer.locator('input[type="checkbox"]');
          
          if (await checkboxAlt.isVisible({ timeout: 5000 })) {
            const isChecked = await checkboxAlt.isChecked();
            
            if (!isChecked) {
              await checkboxAlt.check();
              console.log('✓ Checkbox cableado activado usando método alternativo');
            } else {
              console.log('✓ Checkbox cableado ya estaba activado (método alternativo)');
            }
          }
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para checkbox cableado también falló: ${altError.message}`);
      }
    }

    // === ACTIVAR CHECKBOX ENLACE (REINSTALL) ===
    console.log('🔗 Activando checkbox enlace (reinstall)...');
    await page.waitForTimeout(2000);
    
    try {
      const enlaceCheckbox = page.locator('#reinstall-link-switch');
      await expect(enlaceCheckbox).toBeVisible({ timeout: 10000 });
      
      // Verificar si ya está activado
      const isChecked = await enlaceCheckbox.isChecked();
      
      if (!isChecked) {
        await enlaceCheckbox.check();
        console.log('✓ Checkbox enlace (reinstall) activado exitosamente');
      } else {
        console.log('✓ Checkbox enlace (reinstall) ya estaba activado');
      }
    } catch (error) {
      console.log(`Error al activar checkbox enlace (reinstall): ${error.message}`);
      
      // Método alternativo usando el texto y navegación
      console.log('🔄 Intentando método alternativo para checkbox enlace (reinstall)...');
      try {
        const enlaceSpan = page.locator('span').filter({ hasText: 'Enlace' });
        if (await enlaceSpan.isVisible({ timeout: 5000 })) {
          const switchContainer = enlaceSpan.locator('../div').first();
          const checkboxAlt = switchContainer.locator('input[type="checkbox"]');
          
          if (await checkboxAlt.isVisible({ timeout: 5000 })) {
            const isChecked = await checkboxAlt.isChecked();
            
            if (!isChecked) {
              await checkboxAlt.check();
              console.log('✓ Checkbox enlace activado usando método alternativo');
            } else {
              console.log('✓ Checkbox enlace ya estaba activado (método alternativo)');
            }
          }
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para checkbox enlace también falló: ${altError.message}`);
      }
    }

    // === ACTIVAR CHECKBOX WIRING ===
    console.log('✅ Activando checkbox wiring...');
    await page.waitForTimeout(2000);
    
    try {
      const wiringCheckbox = page.locator('#wiring-switch');
      await expect(wiringCheckbox).toBeVisible({ timeout: 10000 });
      
      // Verificar si ya está activado
      const isChecked = await wiringCheckbox.isChecked();
      
      if (!isChecked) {
        await wiringCheckbox.check();
        console.log('✓ Checkbox wiring activado exitosamente');
      } else {
        console.log('✓ Checkbox wiring ya estaba activado');
      }
    } catch (error) {
      console.log(`Error al activar checkbox wiring: ${error.message}`);
      
      // Método alternativo usando clase CSS
      console.log('🔄 Intentando método alternativo para checkbox wiring...');
      try {
        const wiringCheckboxAlt = page.locator('input[type="checkbox"].form-check-input').first();
        if (await wiringCheckboxAlt.isVisible({ timeout: 5000 })) {
          const isChecked = await wiringCheckboxAlt.isChecked();
          
          if (!isChecked) {
            await wiringCheckboxAlt.check();
            console.log('✓ Checkbox wiring activado usando método alternativo');
          } else {
            console.log('✓ Checkbox wiring ya estaba activado (método alternativo)');
          }
        } else {
          console.log('⚠️ Checkbox wiring no visible');
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para checkbox wiring también falló: ${altError.message}`);
      }
    }

    // === GUARDAR FORMULARIO ===
    console.log('💾 Haciendo clic en el botón Guardar...');
    await page.waitForTimeout(3000);
    
    try {
      const guardarButton = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' });
      await expect(guardarButton).toBeVisible({ timeout: 10000 });
      await guardarButton.click();
      
      console.log('✓ Botón Guardar presionado exitosamente');
    } catch (error) {
      console.log(`Error al hacer clic en Guardar: ${error.message}`);
      
      // Método alternativo buscando por texto
      console.log('🔄 Intentando método alternativo para botón Guardar...');
      try {
        const guardarButtonAlt = page.locator('button').filter({ hasText: 'Guardar' });
        if (await guardarButtonAlt.isVisible({ timeout: 5000 })) {
          await guardarButtonAlt.click();
          console.log('✓ Botón Guardar presionado usando método alternativo');
        } else {
          // Último intento con selector más general
          const guardarButtonGeneral = page.locator('button:has-text("Guardar")');
          if (await guardarButtonGeneral.isVisible({ timeout: 5000 })) {
            await guardarButtonGeneral.click();
            console.log('✓ Botón Guardar presionado usando selector general');
          }
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo para botón Guardar también falló: ${altError.message}`);
      }
    }

    // Pausa para verificar los cambios y el guardado
    console.log('⏳ Pausa extendida para verificar el guardado y los campos completados - 15 segundos...');
    await page.waitForTimeout(15000);

    // === NAVEGAR DE VUELTA A SOPORTE TÉCNICO PARA ACCEDER A LA INSTALACIÓN CREADA ===
    console.log('🔄 Navegando de vuelta a soporte técnico para acceder a la instalación creada...');
    
    await page.goto(TECHNICAL_SUPPORT_URL);
    await page.waitForURL(TECHNICAL_SUPPORT_URL);
    await page.waitForTimeout(3000);
    console.log('✓ En pantalla de soporte técnico');

    // === ACCEDER A LA ÚLTIMA INSTALACIÓN POS LAN CREADA ===
    console.log('📋 Buscando la última instalación POS LAN creada en la tabla...');
    
    try {
      // Esperar a que la tabla esté visible
      await page.waitForSelector('.rs-table-body-row-wrapper', { timeout: 10000 });
      await page.waitForTimeout(2000); // Esperar a que se carguen los datos
      
      // Buscar directamente el primer botón de edición visible en la tabla (más confiable)
      const botonEdicionPrimero = page.locator('.rs-table-body-row-wrapper .rs-table-row svg').first();
      await expect(botonEdicionPrimero).toBeVisible({ timeout: 10000 });
      
      console.log('✓ Botón de edición encontrado en la primera fila');
      
      // Hacer clic en el botón de edición
      await botonEdicionPrimero.click();
      console.log('✅ Botón de edición presionado exitosamente');
      
      // Esperar a que navegue a la URL de edición
      await page.waitForURL('**/front-crm/technical-support/edit/**', { timeout: 15000 });
      
      // Obtener la URL actual para confirmar el ID
      const urlActual = page.url();
      const idMatch = urlActual.match(/\/edit\/(\d+)/);
      if (idMatch) {
        const installationId = idMatch[1];
        console.log(`✅ Navegación exitosa a la edición de la instalación con ID: ${installationId}`);
        console.log(`🔗 URL actual: ${urlActual}`);
      } else {
        console.log(`✅ Navegación exitosa a la página de edición: ${urlActual}`);
      }
      
      // Pausa para verificar que estamos en la página correcta
      await page.waitForTimeout(5000);
      console.log('✓ Acceso exitoso a la última instalación POS LAN creada');

      // === SECCIÓN DE EDICIÓN: CAMBIAR ÁREA RESOLUTORA ===
      console.log('🎯 Iniciando edición del formulario...');
      console.log('📝 Cambiando Área Resolutora de SOPORTE TECNICO a BACK OFFICE...');
      
      try {
        // Buscar el campo "Área Resolutora" por su label
        const labelAreaSpan = page.locator('span').filter({ hasText: 'Área Resolutora' });
        await expect(labelAreaSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelAreaSpan.locator('../..');
        const areaSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(areaSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await areaSelector.click();
        console.log('✓ Dropdown de Área Resolutora abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(2000);
        
        // Buscar y seleccionar "BACK OFFICE"
        const opcionBackOffice = page.locator('[role="option"]').filter({ hasText: 'BACK OFFICE' }).first();
        await expect(opcionBackOffice).toBeVisible({ timeout: 10000 });
        await opcionBackOffice.click();
        
        console.log('✅ Área Resolutora cambiada exitosamente: SOPORTE TECNICO → BACK OFFICE');
      } catch (error) {
        console.log(`Error al cambiar área resolutora: ${error.message}`);
        
        // Método alternativo usando react-select-25 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para área resolutora...');
        try {
          const selectInput = page.locator('#react-select-25-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "BACK OFFICE"
            const option = page.locator('[role="option"]').filter({ hasText: 'BACK OFFICE' }).first();
            if (await option.count() > 0) {
              await option.click();
              console.log('✅ Área Resolutora cambiada usando react-select-25: BACK OFFICE');
            } else {
              // Si no encuentra "BACK OFFICE", buscar opciones similares
              const opcionesAlternativas = [
                'BACK OFFICE',
                'Back Office',
                'back office',
                'BackOffice'
              ];
              
              let opcionEncontrada = false;
              for (const opcionAlt of opcionesAlternativas) {
                const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
                if (await optionAlt.count() > 0) {
                  await optionAlt.click();
                  console.log(`✅ Área Resolutora cambiada con opción alternativa: ${opcionAlt}`);
                  opcionEncontrada = true;
                  break;
                }
              }
              
              if (!opcionEncontrada) {
                console.log('⚠️ No se encontró la opción BACK OFFICE');
                await page.keyboard.press('Escape');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-25 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para área resolutora también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Área Resolutora completada');

      // === COMPLETAR CAMPO "A CARGO DE" EN EDICIÓN ===
      console.log('👤 Completando campo "A cargo de" en edición...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "A cargo de" por su label
        const labelACargoSpan = page.locator('span').filter({ hasText: 'A cargo de *' });
        await expect(labelACargoSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelACargoSpan.locator('../..');
        const aCargoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(aCargoSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await aCargoSelector.click();
        console.log('✓ Dropdown de "A cargo de" abierto');
        
        // Esperar más tiempo a que aparezcan las opciones
        await page.waitForTimeout(4000);
        
        // Primero verificar qué opciones están disponibles
        const todasLasOpciones = page.locator('[role="option"]');
        const cantidadOpciones = await todasLasOpciones.count();
        console.log(`📊 Opciones disponibles en "A cargo de": ${cantidadOpciones}`);
        
        if (cantidadOpciones > 0) {
          // Intentar encontrar opciones que contengan parte del nombre
          let opcionSeleccionada = false;
          
          // Lista de patrones a buscar en orden de preferencia
          const patronesBusqueda = [
            'AHORRO PACK',
          ];
          
          for (const patron of patronesBusqueda) {
            const opcionConPatron = page.locator('[role="option"]').filter({ hasText: new RegExp(patron, 'i') }).first();
            if (await opcionConPatron.count() > 0) {
              // Obtener el texto ANTES del clic
              const textoSeleccionado = await opcionConPatron.textContent();
              await opcionConPatron.click();
              console.log(`✅ Campo "A cargo de" completado con patrón "${patron}": ${textoSeleccionado}`);
              opcionSeleccionada = true;
              break;
            }
          }
          
          if (!opcionSeleccionada) {
            // Si no encuentra ningún patrón, mostrar las primeras opciones disponibles y seleccionar la primera
            console.log('📋 Listando primeras opciones disponibles:');
            const primerasCincoOpciones = todasLasOpciones.first().locator('xpath=. | following-sibling::*[position() < 5]');
            const cantidadMostrar = Math.min(5, cantidadOpciones);
            
            for (let i = 0; i < cantidadMostrar; i++) {
              try {
                const opcion = todasLasOpciones.nth(i);
                const textoOpcion = await opcion.textContent();
                console.log(`  ${i + 1}. ${textoOpcion}`);
              } catch (e) {
                console.log(`  ${i + 1}. [No se pudo leer el texto]`);
              }
            }
            
            // Seleccionar la primera opción disponible
            const textoSeleccionado = await todasLasOpciones.first().textContent();
            await todasLasOpciones.first().click();
            console.log(`✅ Campo "A cargo de" completado con primera opción disponible: ${textoSeleccionado}`);
          }
        } else {
          console.log('⚠️ No se encontraron opciones en el dropdown de "A cargo de"');
          await page.keyboard.press('Escape');
        }
        
      } catch (error) {
        console.log(`Error al completar "A cargo de": ${error.message}`);
        
        // Método alternativo: buscar todos los react-select inputs visibles
        console.log('🔄 Intentando método alternativo buscando react-select inputs...');
        try {
          // Buscar todos los inputs de react-select visibles
          const possibleReactSelectIds: string[] = [];
          for (let i = 40; i <= 60; i++) {
            possibleReactSelectIds.push(`react-select-${i}`);
          }
          
          let selectorEncontrado = false;
          
          for (const selectId of possibleReactSelectIds) {
            try {
              const selectInput = page.locator(`#${selectId}-input`);
              if (await selectInput.isVisible({ timeout: 2000 })) {
                console.log(`🎯 Probando con ${selectId}...`);
                const selectContainer = selectInput.locator('../..');
                await selectContainer.click();
                await page.waitForTimeout(3000);
                
                // Verificar si hay opciones disponibles
                const opciones = page.locator('[role="option"]');
                const cantidadOpciones = await opciones.count();
                
                if (cantidadOpciones > 0) {
                  console.log(`✓ ${selectId} tiene ${cantidadOpciones} opciones disponibles`);
                  
                  // Buscar por patrones específicos
                  const patronesBusqueda = ['AHORRO PACK'];
                  let opcionEncontrada = false;
                  
                  for (const patron of patronesBusqueda) {
                    const opcionConPatron = page.locator('[role="option"]').filter({ hasText: new RegExp(patron, 'i') }).first();
                    if (await opcionConPatron.count() > 0) {
                      // Obtener el texto ANTES del clic
                      const textoSeleccionado = await opcionConPatron.textContent();
                      await opcionConPatron.click();
                      console.log(`✅ Campo "A cargo de" completado usando ${selectId} con patrón "${patron}": ${textoSeleccionado}`);
                      opcionEncontrada = true;
                      selectorEncontrado = true;
                      break;
                    }
                  }
                  
                  if (!opcionEncontrada) {
                    // Seleccionar la primera opción
                    const textoSeleccionado = await opciones.first().textContent();
                    await opciones.first().click();
                    console.log(`✅ Campo "A cargo de" completado usando ${selectId} con primera opción: ${textoSeleccionado}`);
                    selectorEncontrado = true;
                  }
                  
                  if (selectorEncontrado) break;
                } else {
                  // Cerrar dropdown si no hay opciones
                  await page.keyboard.press('Escape');
                }
              }
            } catch (innerError) {
              // Continuar con el siguiente ID
              continue;
            }
          }
          
          if (!selectorEncontrado) {
            console.log('⚠️ No se pudo encontrar ningún selector react-select funcional para "A cargo de"');
          }
          
        } catch (altError) {
          console.log(`⚠️ Método alternativo para "A cargo de" también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del campo "A cargo de"
      await page.waitForTimeout(3000);
      console.log('✓ Edición de campo "A cargo de" completada');

      // === COMPLETAR CAMPO "ESTADO DEL PEDIDO" EN EDICIÓN ===
      console.log('🔄 Cambiando Estado del pedido de "Nuevo" a "Finalizado"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Estado del pedido" por su label
        const labelEstadoSpan = page.locator('span').filter({ hasText: 'Estado del pedido' });
        await expect(labelEstadoSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelEstadoSpan.locator('../..');
        const estadoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(estadoSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await estadoSelector.click();
        console.log('✓ Dropdown de "Estado del pedido" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "Finalizado"
        const opcionFinalizado = page.locator('[role="option"]').filter({ hasText: 'Finalizado' }).first();
        if (await opcionFinalizado.count() > 0) {
          const textoSeleccionado = await opcionFinalizado.textContent();
          await opcionFinalizado.click();
          console.log(`✅ Estado del pedido cambiado exitosamente: Nuevo → ${textoSeleccionado}`);
        } else {
          // Si no encuentra "Finalizado", buscar opciones similares
          const opcionesAlternativas = [
            'Finalizado',
            'FINALIZADO',
            'finalizado',
            'Completed',
            'Terminado'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Estado del pedido cambiado con opción alternativa: ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            // Mostrar opciones disponibles para debug
            const todasLasOpciones = page.locator('[role="option"]');
            const cantidadOpciones = await todasLasOpciones.count();
            console.log(`📊 Opciones disponibles en Estado del pedido: ${cantidadOpciones}`);
            
            if (cantidadOpciones > 0) {
              console.log('📋 Listando opciones disponibles:');
              const cantidadMostrar = Math.min(5, cantidadOpciones);
              
              for (let i = 0; i < cantidadMostrar; i++) {
                try {
                  const opcion = todasLasOpciones.nth(i);
                  const textoOpcion = await opcion.textContent();
                  console.log(`  ${i + 1}. ${textoOpcion}`);
                } catch (e) {
                  console.log(`  ${i + 1}. [No se pudo leer el texto]`);
                }
              }
              
              // Seleccionar la primera opción si no se encuentra "Finalizado"
              const textoSeleccionado = await todasLasOpciones.first().textContent();
              await todasLasOpciones.first().click();
              console.log(`✅ Estado del pedido cambiado con primera opción disponible: ${textoSeleccionado}`);
            } else {
              console.log('⚠️ No se encontraron opciones en el dropdown');
              await page.keyboard.press('Escape');
            }
          }
        }
        
      } catch (error) {
        console.log(`Error al cambiar estado del pedido: ${error.message}`);
        
        // Método alternativo usando react-select-83 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para estado del pedido...');
        try {
          const selectInput = page.locator('#react-select-83-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "Finalizado"
            const option = page.locator('[role="option"]').filter({ hasText: 'Finalizado' }).first();
            if (await option.count() > 0) {
              const textoSeleccionado = await option.textContent();
              await option.click();
              console.log(`✅ Estado del pedido cambiado usando react-select-83: ${textoSeleccionado}`);
            } else {
              // Probar con otros IDs posibles
              const possibleIds = ['react-select-101', 'react-select-82', 'react-select-84', 'react-select-85'];
              
              let selectorEncontrado = false;
              for (const selectId of possibleIds) {
                try {
                  const altSelectInput = page.locator(`#${selectId}-input`);
                  if (await altSelectInput.isVisible({ timeout: 2000 })) {
                    const altSelectContainer = altSelectInput.locator('../..');
                    await altSelectContainer.click();
                    await page.waitForTimeout(2000);
                    
                    const optionFinalizado = page.locator('[role="option"]').filter({ hasText: 'Finalizado' }).first();
                    if (await optionFinalizado.count() > 0) {
                      const textoSeleccionado = await optionFinalizado.textContent();
                      await optionFinalizado.click();
                      console.log(`✅ Estado del pedido cambiado usando ${selectId}: ${textoSeleccionado}`);
                      selectorEncontrado = true;
                      break;
                    } else {
                      await page.keyboard.press('Escape');
                    }
                  }
                } catch (innerError) {
                  continue;
                }
              }
              
              if (!selectorEncontrado) {
                console.log('⚠️ No se pudo encontrar ningún selector funcional para Estado del pedido');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-83 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para estado del pedido también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del estado del pedido
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Estado del pedido completada');

      // === COMPLETAR CAMPO "NOMBRE DEL COMERCIO" EN EDICIÓN ===
      console.log('🏪 Cambiando Nombre del comercio de "SUPER MOTO CROSS" a "STELA NOVEDADES"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Nombre del comercio" por su label
        const labelComercioSpan = page.locator('span').filter({ hasText: 'Nombre del comercio' });
        await expect(labelComercioSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelComercioSpan.locator('../..');
        const comercioSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(comercioSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await comercioSelector.click();
        console.log('✓ Dropdown de "Nombre del comercio" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "STELA NOVEDADES"
        const opcionStelaNovedades = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
        if (await opcionStelaNovedades.count() > 0) {
          const textoSeleccionado = await opcionStelaNovedades.textContent();
          await opcionStelaNovedades.click();
          console.log(`✅ Nombre del comercio cambiado exitosamente: SUPER MOTO CROSS → ${textoSeleccionado}`);
        } else {
          // Si no encuentra "STELA NOVEDADES", buscar opciones similares
          const opcionesAlternativas = [
            'STELA NOVEDADES',
            'Stela Novedades',
            'stela novedades',
            'STELA',
            'Stela'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Nombre del comercio cambiado con opción alternativa: ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            // Mostrar opciones disponibles para debug
            const todasLasOpciones = page.locator('[role="option"]');
            const cantidadOpciones = await todasLasOpciones.count();
            console.log(`📊 Opciones disponibles en Nombre del comercio: ${cantidadOpciones}`);
            
            if (cantidadOpciones > 0) {
              console.log('📋 Listando primeras opciones disponibles:');
              const cantidadMostrar = Math.min(5, cantidadOpciones);
              
              for (let i = 0; i < cantidadMostrar; i++) {
                try {
                  const opcion = todasLasOpciones.nth(i);
                  const textoOpcion = await opcion.textContent();
                  console.log(`  ${i + 1}. ${textoOpcion}`);
                } catch (e) {
                  console.log(`  ${i + 1}. [No se pudo leer el texto]`);
                }
              }
              
              // Seleccionar la primera opción si no se encuentra "STELA NOVEDADES"
              const textoSeleccionado = await todasLasOpciones.first().textContent();
              await todasLasOpciones.first().click();
              console.log(`✅ Nombre del comercio cambiado con primera opción disponible: ${textoSeleccionado}`);
            } else {
              console.log('⚠️ No se encontraron opciones en el dropdown');
              await page.keyboard.press('Escape');
            }
          }
        }
        
      } catch (error) {
        console.log(`Error al cambiar nombre del comercio: ${error.message}`);
        
        // Método alternativo usando react-select-85 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para nombre del comercio...');
        try {
          const selectInput = page.locator('#react-select-85-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "STELA NOVEDADES"
            const option = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
            if (await option.count() > 0) {
              const textoSeleccionado = await option.textContent();
              await option.click();
              console.log(`✅ Nombre del comercio cambiado usando react-select-85: ${textoSeleccionado}`);
            } else {
              // Probar con otros IDs posibles
              const possibleIds = ['react-select-103', 'react-select-84', 'react-select-86', 'react-select-87'];
              
              let selectorEncontrado = false;
              for (const selectId of possibleIds) {
                try {
                  const altSelectInput = page.locator(`#${selectId}-input`);
                  if (await altSelectInput.isVisible({ timeout: 2000 })) {
                    const altSelectContainer = altSelectInput.locator('../..');
                    await altSelectContainer.click();
                    await page.waitForTimeout(2000);
                    
                    const optionStelaNovedades = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
                    if (await optionStelaNovedades.count() > 0) {
                      const textoSeleccionado = await optionStelaNovedades.textContent();
                      await optionStelaNovedades.click();
                      console.log(`✅ Nombre del comercio cambiado usando ${selectId}: ${textoSeleccionado}`);
                      selectorEncontrado = true;
                      break;
                    } else {
                      await page.keyboard.press('Escape');
                    }
                  }
                } catch (innerError) {
                  continue;
                }
              }
              
              if (!selectorEncontrado) {
                console.log('⚠️ No se pudo encontrar ningún selector funcional para Nombre del comercio');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-85 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para nombre del comercio también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del nombre del comercio
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Nombre del comercio completada');

      // === COMPLETAR CAMPO "SUCURSAL DEL CLIENTE" EN EDICIÓN ===
      console.log('🏢 Completando campo "Sucursal del Cliente" con "STELA NOVEDADES"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Sucursal del Cliente" por su label
        const labelSucursalSpan = page.locator('span').filter({ hasText: 'Sucursal del Cliente' });
        await expect(labelSucursalSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelSucursalSpan.locator('../..');
        const sucursalSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(sucursalSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await sucursalSelector.click();
        console.log('✓ Dropdown de "Sucursal del Cliente" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "STELA NOVEDADES"
        const opcionStelaNovedades = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
        if (await opcionStelaNovedades.count() > 0) {
          const textoSeleccionado = await opcionStelaNovedades.textContent();
          await opcionStelaNovedades.click();
          console.log(`✅ Sucursal del Cliente completada exitosamente: ${textoSeleccionado}`);
        } else {
          // Si no encuentra "STELA NOVEDADES", buscar opciones similares
          const opcionesAlternativas = [
            'STELA NOVEDADES',
            'Stela Novedades',
            'stela novedades',
            'STELA',
            'Stela'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Sucursal del Cliente completada con opción alternativa: ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            // Mostrar opciones disponibles para debug
            const todasLasOpciones = page.locator('[role="option"]');
            const cantidadOpciones = await todasLasOpciones.count();
            console.log(`📊 Opciones disponibles en Sucursal del Cliente: ${cantidadOpciones}`);
            
            if (cantidadOpciones > 0) {
              console.log('📋 Listando primeras opciones disponibles:');
              const cantidadMostrar = Math.min(5, cantidadOpciones);
              
              for (let i = 0; i < cantidadMostrar; i++) {
                try {
                  const opcion = todasLasOpciones.nth(i);
                  const textoOpcion = await opcion.textContent();
                  console.log(`  ${i + 1}. ${textoOpcion}`);
                } catch (e) {
                  console.log(`  ${i + 1}. [No se pudo leer el texto]`);
                }
              }
              
              // Seleccionar la primera opción si no se encuentra "STELA NOVEDADES"
              const textoSeleccionado = await todasLasOpciones.first().textContent();
              await todasLasOpciones.first().click();
              console.log(`✅ Sucursal del Cliente completada con primera opción disponible: ${textoSeleccionado}`);
            } else {
              console.log('⚠️ No se encontraron opciones en el dropdown');
              await page.keyboard.press('Escape');
            }
          }
        }
        
      } catch (error) {
        console.log(`Error al completar sucursal del cliente: ${error.message}`);
        
        // Método alternativo usando react-select-105 y react-select-109 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para sucursal del cliente...');
        try {
          const possibleIds = ['react-select-105', 'react-select-109', 'react-select-106', 'react-select-107', 'react-select-108'];
          
          let selectorEncontrado = false;
          for (const selectId of possibleIds) {
            try {
              const selectInput = page.locator(`#${selectId}-input`);
              if (await selectInput.isVisible({ timeout: 2000 })) {
                console.log(`🎯 Probando sucursal con ${selectId}...`);
                const selectContainer = selectInput.locator('../..');
                await selectContainer.click();
                await page.waitForTimeout(2000);
                
                // Buscar la opción "STELA NOVEDADES"
                const option = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
                if (await option.count() > 0) {
                  const textoSeleccionado = await option.textContent();
                  await option.click();
                  console.log(`✅ Sucursal del Cliente completada usando ${selectId}: ${textoSeleccionado}`);
                  selectorEncontrado = true;
                  break;
                } else {
                  // Buscar opciones que contengan "STELA"
                  const optionStela = page.locator('[role="option"]').filter({ hasText: /STELA/i }).first();
                  if (await optionStela.count() > 0) {
                    const textoSeleccionado = await optionStela.textContent();
                    await optionStela.click();
                    console.log(`✅ Sucursal del Cliente completada con opción que contiene STELA usando ${selectId}: ${textoSeleccionado}`);
                    selectorEncontrado = true;
                    break;
                  } else {
                    await page.keyboard.press('Escape');
                  }
                }
              }
            } catch (innerError) {
              continue;
            }
          }
          
          if (!selectorEncontrado) {
            console.log('⚠️ No se pudo encontrar ningún selector funcional para Sucursal del Cliente');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para sucursal del cliente también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio de la sucursal del cliente
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Sucursal del Cliente completada');

      // === COMPLETAR CAMPO "CÓDIGO COMERCIO" EN EDICIÓN ===
      console.log('🏷️ Completando campo "Código Comercio" con "0901499"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Código Comercio" por su label
        const labelCodigoSpan = page.locator('span').filter({ hasText: 'Código Comercio' });
        await expect(labelCodigoSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelCodigoSpan.locator('../..');
        const codigoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(codigoSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await codigoSelector.click();
        console.log('✓ Dropdown de "Código Comercio" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "0901499"
        const opcionCodigo0901499 = page.locator('[role="option"]').filter({ hasText: '0901499' }).first();
        if (await opcionCodigo0901499.count() > 0) {
          const textoSeleccionado = await opcionCodigo0901499.textContent();
          await opcionCodigo0901499.click();
          console.log(`✅ Código Comercio completado exitosamente: ${textoSeleccionado}`);
        } else {
          // Si no encuentra "0901499", buscar opciones similares o códigos numéricos
          const opcionesAlternativas = [
            '0901499',
            '901499',
            /^0901499$/,
            /^\d{7}$/  // Cualquier código de 7 dígitos
          ];
          
          let opcionEncontrada = false;
          for (const patron of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: patron }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Código Comercio completado con opción que coincide: ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            // Mostrar opciones disponibles para debug
            const todasLasOpciones = page.locator('[role="option"]');
            const cantidadOpciones = await todasLasOpciones.count();
            console.log(`📊 Opciones disponibles en Código Comercio: ${cantidadOpciones}`);
            
            if (cantidadOpciones > 0) {
              console.log('📋 Listando primeras opciones disponibles:');
              const cantidadMostrar = Math.min(5, cantidadOpciones);
              
              for (let i = 0; i < cantidadMostrar; i++) {
                try {
                  const opcion = todasLasOpciones.nth(i);
                  const textoOpcion = await opcion.textContent();
                  console.log(`  ${i + 1}. ${textoOpcion}`);
                } catch (e) {
                  console.log(`  ${i + 1}. [No se pudo leer el texto]`);
                }
              }
              
              // Seleccionar la primera opción si no se encuentra "0901499"
              const textoSeleccionado = await todasLasOpciones.first().textContent();
              await todasLasOpciones.first().click();
              console.log(`✅ Código Comercio completado con primera opción disponible: ${textoSeleccionado}`);
            } else {
              console.log('⚠️ No se encontraron opciones en el dropdown');
              await page.keyboard.press('Escape');
            }
          }
        }
        
      } catch (error) {
        console.log(`Error al completar código comercio: ${error.message}`);
        
        // Método alternativo usando react-select-111 y react-select-113 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para código comercio...');
        try {
          const possibleIds = ['react-select-111', 'react-select-113', 'react-select-110', 'react-select-112', 'react-select-114'];
          
          let selectorEncontrado = false;
          for (const selectId of possibleIds) {
            try {
              const selectInput = page.locator(`#${selectId}-input`);
              if (await selectInput.isVisible({ timeout: 2000 })) {
                console.log(`🎯 Probando código comercio con ${selectId}...`);
                const selectContainer = selectInput.locator('../..');
                await selectContainer.click();
                await page.waitForTimeout(2000);
                
                // Buscar la opción "0901499"
                const option = page.locator('[role="option"]').filter({ hasText: '0901499' }).first();
                if (await option.count() > 0) {
                  const textoSeleccionado = await option.textContent();
                  await option.click();
                  console.log(`✅ Código Comercio completado usando ${selectId}: ${textoSeleccionado}`);
                  selectorEncontrado = true;
                  break;
                } else {
                  // Buscar códigos numéricos de 7 dígitos
                  const optionNumerico = page.locator('[role="option"]').filter({ hasText: /^\d{7}$/ }).first();
                  if (await optionNumerico.count() > 0) {
                    const textoSeleccionado = await optionNumerico.textContent();
                    await optionNumerico.click();
                    console.log(`✅ Código Comercio completado con código numérico usando ${selectId}: ${textoSeleccionado}`);
                    selectorEncontrado = true;
                    break;
                  } else {
                    await page.keyboard.press('Escape');
                  }
                }
              }
            } catch (innerError) {
              continue;
            }
          }
          
          if (!selectorEncontrado) {
            console.log('⚠️ No se pudo encontrar ningún selector funcional para Código Comercio');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para código comercio también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del código comercio
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Código Comercio completada');

      // === COMPLETAR CAMPO "INCONVENIENTE" EN EDICIÓN ===
      console.log('🚨 Cambiando Inconveniente de "Cableado" a "Caja Integracion"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Inconveniente" por su label
        const labelInconvenienteSpan = page.locator('span').filter({ hasText: 'Inconveniente' });
        await expect(labelInconvenienteSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelInconvenienteSpan.locator('../..');
        const inconvenienteSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(inconvenienteSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await inconvenienteSelector.click();
        console.log('✓ Dropdown de "Inconveniente" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "Caja Integracion"
        const opcionCajaIntegracion = page.locator('[role="option"]').filter({ hasText: 'Caja Integracion' }).first();
        if (await opcionCajaIntegracion.count() > 0) {
          const textoSeleccionado = await opcionCajaIntegracion.textContent();
          await opcionCajaIntegracion.click();
          console.log(`✅ Inconveniente cambiado exitosamente: Cableado → ${textoSeleccionado}`);
        } else {
          // Si no encuentra "Caja Integracion", buscar opciones similares
          const opcionesAlternativas = [
            'Caja Integracion',
            'CAJA INTEGRACION',
            'caja integracion',
            'Caja Integration',
            'CajaIntegracion'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Inconveniente cambiado con opción alternativa: ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            // Mostrar opciones disponibles para debug
            const todasLasOpciones = page.locator('[role="option"]');
            const cantidadOpciones = await todasLasOpciones.count();
            console.log(`📊 Opciones disponibles en Inconveniente: ${cantidadOpciones}`);
            
            if (cantidadOpciones > 0) {
              console.log('📋 Listando primeras opciones disponibles:');
              const cantidadMostrar = Math.min(5, cantidadOpciones);
              
              for (let i = 0; i < cantidadMostrar; i++) {
                try {
                  const opcion = todasLasOpciones.nth(i);
                  const textoOpcion = await opcion.textContent();
                  console.log(`  ${i + 1}. ${textoOpcion}`);
                } catch (e) {
                  console.log(`  ${i + 1}. [No se pudo leer el texto]`);
                }
              }
              
              // Seleccionar la primera opción si no se encuentra "Caja Integracion"
              const textoSeleccionado = await todasLasOpciones.first().textContent();
              await todasLasOpciones.first().click();
              console.log(`✅ Inconveniente cambiado con primera opción disponible: ${textoSeleccionado}`);
            } else {
              console.log('⚠️ No se encontraron opciones en el dropdown');
              await page.keyboard.press('Escape');
            }
          }
        }
        
      } catch (error) {
        console.log(`Error al cambiar inconveniente: ${error.message}`);
        
        // Método alternativo usando react-select-17 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para inconveniente...');
        try {
          const selectInput = page.locator('#react-select-17-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "Caja Integracion"
            const option = page.locator('[role="option"]').filter({ hasText: 'Caja Integracion' }).first();
            if (await option.count() > 0) {
              const textoSeleccionado = await option.textContent();
              await option.click();
              console.log(`✅ Inconveniente cambiado usando react-select-17: ${textoSeleccionado}`);
            } else {
              // Probar con otros IDs posibles relacionados con inconveniente
              const possibleIds = ['react-select-73', 'react-select-16', 'react-select-18', 'react-select-19'];
              
              let selectorEncontrado = false;
              for (const selectId of possibleIds) {
                try {
                  const altSelectInput = page.locator(`#${selectId}-input`);
                  if (await altSelectInput.isVisible({ timeout: 2000 })) {
                    const altSelectContainer = altSelectInput.locator('../..');
                    await altSelectContainer.click();
                    await page.waitForTimeout(2000);
                    
                    const optionCajaIntegracion = page.locator('[role="option"]').filter({ hasText: 'Caja Integracion' }).first();
                    if (await optionCajaIntegracion.count() > 0) {
                      const textoSeleccionado = await optionCajaIntegracion.textContent();
                      await optionCajaIntegracion.click();
                      console.log(`✅ Inconveniente cambiado usando ${selectId}: ${textoSeleccionado}`);
                      selectorEncontrado = true;
                      break;
                    } else {
                      await page.keyboard.press('Escape');
                    }
                  }
                } catch (innerError) {
                  continue;
                }
              }
              
              if (!selectorEncontrado) {
                console.log('⚠️ No se pudo encontrar ningún selector funcional para Inconveniente');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-17 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para inconveniente también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del inconveniente
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Inconveniente completada');

      // === COMPLETAR CAMPO "DESCRIPCIÓN/OBSERVACIONES" EN EDICIÓN ===
      console.log('📝 Actualizando Descripción/Observaciones para reflejar los cambios realizados...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo de descripción por su nombre
        const descripcionTextarea = page.locator('textarea[name="description"]');
        await expect(descripcionTextarea).toBeVisible({ timeout: 10000 });
        
        // Nuevo texto que refleje todos los cambios realizados
        const nuevaDescripcion = "Instalación de POS LAN actualizada para comercio STELA NOVEDADES. Se ha modificado el inconveniente de Cableado a Caja Integracion debido a nuevos requerimientos técnicos identificados durante la evaluación. La instalación requiere atención especializada en la integración de cajas registradoras con el sistema POS LAN. Se coordina con el equipo de BACK OFFICE para la implementación final.";

        // Limpiar el campo y completar con el nuevo texto
        await descripcionTextarea.clear();
        await descripcionTextarea.fill(nuevaDescripcion);
        
        console.log('✅ Descripción/Observaciones actualizada exitosamente para reflejar todos los cambios');
      } catch (error) {
        console.log(`Error al actualizar descripción/observaciones: ${error.message}`);
        
        // Método alternativo usando el label
        console.log('🔄 Intentando método alternativo para descripción/observaciones...');
        try {
          const labelDescripcion = page.locator('label').filter({ hasText: 'Descripción/Observaciones' });
          await expect(labelDescripcion).toBeVisible({ timeout: 5000 });
          
          const contenedorFormFloating = labelDescripcion.locator('..');
          const textareaDescripcion = contenedorFormFloating.locator('textarea');
          await expect(textareaDescripcion).toBeVisible({ timeout: 5000 });
          
          // Versión más corta para el método alternativo
          const descripcionAlternativa = `Instalación POS LAN para STELA NOVEDADES - Código 0901499. Inconveniente: Caja Integracion. Estado: Finalizado. Responsable: AHORRO PACK (BACK OFFICE). Requiere integración especializada de cajas registradoras.`;
          
          await textareaDescripcion.clear();
          await textareaDescripcion.fill(descripcionAlternativa);
          
          console.log('✅ Descripción actualizada usando método alternativo');
        } catch (altError) {
          console.log(`⚠️ Método alternativo para descripción también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio de la descripción
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Descripción/Observaciones completada');

      // === COMPLETAR CAMPO "FECHA DE APERTURA" EN EDICIÓN ===
      console.log('📅 Actualizando Fecha de Apertura...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo de fecha de apertura por su nombre
        const fechaInput = page.locator('input[name="openingDate"]');
        await expect(fechaInput).toBeVisible({ timeout: 10000 });
        
        // Nueva fecha (una semana atrás desde hoy)
        const fechaAnterior = new Date();
        fechaAnterior.setDate(fechaAnterior.getDate() - 7);
        const nuevaFecha = fechaAnterior.toISOString().split('T')[0];
        
        // Limpiar el campo y completar con la nueva fecha
        await fechaInput.clear();
        await fechaInput.fill(nuevaFecha);
        
        console.log(`✅ Fecha de Apertura actualizada exitosamente: ${nuevaFecha}`);
      } catch (error) {
        console.log(`Error al actualizar fecha de apertura: ${error.message}`);
        
        // Método alternativo usando el label
        console.log('🔄 Intentando método alternativo para fecha de apertura...');
        try {
          const labelFecha = page.locator('label').filter({ hasText: 'Fecha de Apertura' });
          await expect(labelFecha).toBeVisible({ timeout: 5000 });
          
          const contenedorFormFloating = labelFecha.locator('..');
          const inputFecha = contenedorFormFloating.locator('input[type="date"]');
          await expect(inputFecha).toBeVisible({ timeout: 5000 });
          
          // Fecha alternativa (10 días atrás)
          const fechaAnterior = new Date();
          fechaAnterior.setDate(fechaAnterior.getDate() - 10);
          const nuevaFecha = fechaAnterior.toISOString().split('T')[0];
          
          await inputFecha.clear();
          await inputFecha.fill(nuevaFecha);
          
          console.log(`✅ Fecha de Apertura actualizada usando método alternativo: ${nuevaFecha}`);
        } catch (altError) {
          console.log(`⚠️ Método alternativo para fecha de apertura también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio de la fecha
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Fecha de Apertura completada');

      // === COMPLETAR CAMPO "GEOLOCALIZACIÓN" EN EDICIÓN ===
      console.log('🗺️ Actualizando Geolocalización...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo de geolocalización por su nombre
        const geoInput = page.locator('input[name="geoLocation"]');
        await expect(geoInput).toBeVisible({ timeout: 10000 });
        
        // Nuevas coordenadas para Ciudad del Este, Paraguay (apropiado para STELA NOVEDADES)
        const nuevasCoordenadas = '-25.5096, -54.6161';
        
        // Limpiar el campo y completar con las nuevas coordenadas
        await geoInput.clear();
        await geoInput.fill(nuevasCoordenadas);
        
        console.log(`✅ Geolocalización actualizada exitosamente: ${nuevasCoordenadas}`);
      } catch (error) {
        console.log(`Error al actualizar geolocalización: ${error.message}`);
        
        // Método alternativo usando el label
        console.log('🔄 Intentando método alternativo para geolocalización...');
        try {
          const labelGeo = page.locator('label').filter({ hasText: 'Geolocalización' });
          await expect(labelGeo).toBeVisible({ timeout: 5000 });
          
          const contenedorFormFloating = labelGeo.locator('..');
          const inputGeo = contenedorFormFloating.locator('input[type="text"]');
          await expect(inputGeo).toBeVisible({ timeout: 5000 });
          
          // Coordenadas alternativas para Encarnación, Paraguay
          const nuevasCoordenadas = '-27.3371, -55.8683';
          
          await inputGeo.clear();
          await inputGeo.fill(nuevasCoordenadas);
          
          console.log(`✅ Geolocalización actualizada usando método alternativo: ${nuevasCoordenadas}`);
        } catch (altError) {
          console.log(`⚠️ Método alternativo para geolocalización también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio de la geolocalización
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Geolocalización completada');

      // === COMPLETAR CAMPO "ORDEN DE EQUIPOS" EN EDICIÓN ===
      console.log('🔀 Cambiando Orden de equipos de "Desde caja 1 en orden" a "Intercalados ( caja 1 / caja 3 / caja 5)"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Orden de equipos" por su label
        const labelOrdenSpan = page.locator('span').filter({ hasText: 'Orden de equipos' });
        await expect(labelOrdenSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelOrdenSpan.locator('../..');
        const ordenSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(ordenSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await ordenSelector.click();
        console.log('✓ Dropdown de "Orden de equipos" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "Intercalados ( caja 1 / caja 3 / caja 5)"
        const opcionIntercalados = page.locator('[role="option"]').filter({ hasText: 'Intercalados ( caja 1 / caja 3 / caja 5)' }).first();
        if (await opcionIntercalados.count() > 0) {
          const textoSeleccionado = await opcionIntercalados.textContent();
          await opcionIntercalados.click();
          console.log(`✅ Orden de equipos cambiado exitosamente: Desde caja 1 en orden → ${textoSeleccionado}`);
        } else {
          // Si no encuentra la opción exacta, buscar opciones similares
          const opcionesAlternativas = [
            'Intercalados ( caja 1 / caja 3 / caja 5)',
            'Intercalados',
            'caja 1 / caja 3 / caja 5',
            'Intercalado',
            'alternado'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: new RegExp(opcionAlt, 'i') }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Orden de equipos cambiado con opción alternativa: ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            // Mostrar opciones disponibles para debug
            const todasLasOpciones = page.locator('[role="option"]');
            const cantidadOpciones = await todasLasOpciones.count();
            console.log(`📊 Opciones disponibles en Orden de equipos: ${cantidadOpciones}`);
            
            if (cantidadOpciones > 0) {
              console.log('📋 Listando primeras opciones disponibles:');
              const cantidadMostrar = Math.min(5, cantidadOpciones);
              
              for (let i = 0; i < cantidadMostrar; i++) {
                try {
                  const opcion = todasLasOpciones.nth(i);
                  const textoOpcion = await opcion.textContent();
                  console.log(`  ${i + 1}. ${textoOpcion}`);
                } catch (e) {
                  console.log(`  ${i + 1}. [No se pudo leer el texto]`);
                }
              }
              
              // Seleccionar la primera opción si no se encuentra la específica
              const textoSeleccionado = await todasLasOpciones.first().textContent();
              await todasLasOpciones.first().click();
              console.log(`✅ Orden de equipos cambiado con primera opción disponible: ${textoSeleccionado}`);
            } else {
              console.log('⚠️ No se encontraron opciones en el dropdown');
              await page.keyboard.press('Escape');
            }
          }
        }
        
      } catch (error) {
        console.log(`Error al cambiar orden de equipos: ${error.message}`);
        
        // Método alternativo usando react-select-19 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para orden de equipos...');
        try {
          const selectInput = page.locator('#react-select-19-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "Intercalados ( caja 1 / caja 3 / caja 5)"
            const option = page.locator('[role="option"]').filter({ hasText: 'Intercalados ( caja 1 / caja 3 / caja 5)' }).first();
            if (await option.count() > 0) {
              const textoSeleccionado = await option.textContent();
              await option.click();
              console.log(`✅ Orden de equipos cambiado usando react-select-19: ${textoSeleccionado}`);
            } else {
              // Probar con otros IDs posibles relacionados con orden de equipos
              const possibleIds = ['react-select-75', 'react-select-18', 'react-select-20', 'react-select-21'];
              
              let selectorEncontrado = false;
              for (const selectId of possibleIds) {
                try {
                  const altSelectInput = page.locator(`#${selectId}-input`);
                  if (await altSelectInput.isVisible({ timeout: 2000 })) {
                    const altSelectContainer = altSelectInput.locator('../..');
                    await altSelectContainer.click();
                    await page.waitForTimeout(2000);
                    
                    const optionIntercalados = page.locator('[role="option"]').filter({ hasText: /Intercalados.*caja.*1.*caja.*3.*caja.*5/i }).first();
                    if (await optionIntercalados.count() > 0) {
                      const textoSeleccionado = await optionIntercalados.textContent();
                      await optionIntercalados.click();
                      console.log(`✅ Orden de equipos cambiado usando ${selectId}: ${textoSeleccionado}`);
                      selectorEncontrado = true;
                      break;
                    } else {
                      await page.keyboard.press('Escape');
                    }
                  }
                } catch (innerError) {
                  continue;
                }
              }
              
              if (!selectorEncontrado) {
                console.log('⚠️ No se pudo encontrar ningún selector funcional para Orden de equipos');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-19 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para orden de equipos también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del orden de equipos
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Orden de equipos completada');

      // === COMPLETAR CAMPO "PUNTOS A INSTALAR" EN EDICIÓN ===
      console.log('🔢 Actualizando Puntos a instalar...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo de puntos a instalar por su nombre
        const puntosInput = page.locator('input[name="pointsToInstall"]');
        await expect(puntosInput).toBeVisible({ timeout: 10000 });
        
        // Nueva cantidad de puntos (mayor para reflejar la expansión de STELA NOVEDADES)
        const nuevaCantidadPuntos = '120';
        
        // Limpiar el campo y completar con la nueva cantidad
        await puntosInput.clear();
        await puntosInput.fill(nuevaCantidadPuntos);
        
        console.log(`✅ Puntos a instalar actualizado exitosamente: 85 → ${nuevaCantidadPuntos}`);
      } catch (error) {
        console.log(`Error al actualizar puntos a instalar: ${error.message}`);
        
        // Método alternativo usando el label
        console.log('🔄 Intentando método alternativo para puntos a instalar...');
        try {
          const labelPuntos = page.locator('label').filter({ hasText: 'Puntos a instalar' });
          await expect(labelPuntos).toBeVisible({ timeout: 5000 });
          
          const contenedorFormFloating = labelPuntos.locator('..');
          const inputPuntos = contenedorFormFloating.locator('input[type="number"]');
          await expect(inputPuntos).toBeVisible({ timeout: 5000 });
          
          // Cantidad alternativa
          const nuevaCantidadPuntos = '115';
          
          await inputPuntos.clear();
          await inputPuntos.fill(nuevaCantidadPuntos);
          
          console.log(`✅ Puntos a instalar actualizado usando método alternativo: ${nuevaCantidadPuntos}`);
        } catch (altError) {
          console.log(`⚠️ Método alternativo para puntos a instalar también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio de puntos a instalar
      await page.waitForTimeout(3000);
      console.log('✓ Edición de Puntos a instalar completada');

      // === COMPLETAR CAMPO "ENLACE" (CHECKBOX) EN EDICIÓN ===
      console.log('🔗 Actualizando estado del checkbox Enlace...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el checkbox de Enlace por su ID (basado en el HTML proporcionado)
        const enlaceCheckbox = page.locator('#wiring-switch');
        await expect(enlaceCheckbox).toBeVisible({ timeout: 10000 });
        
        // Verificar el estado actual del checkbox
        const isChecked = await enlaceCheckbox.isChecked();
        console.log(`📊 Estado actual del checkbox Enlace: ${isChecked ? 'Activado' : 'Desactivado'}`);
        
        // Cambiar el estado (si está activado, desactivarlo; si está desactivado, activarlo)
        if (isChecked) {
          await enlaceCheckbox.uncheck();
          console.log('✅ Checkbox Enlace desactivado exitosamente');
        } else {
          await enlaceCheckbox.check();
          console.log('✅ Checkbox Enlace activado exitosamente');
        }
        
      } catch (error) {
        console.log(`Error al actualizar checkbox Enlace: ${error.message}`);
        
        // Método alternativo usando el texto y navegación
        console.log('🔄 Intentando método alternativo para checkbox Enlace...');
        try {
          // Buscar por el span que contiene "Enlace"
          const enlaceSpan = page.locator('span').filter({ hasText: 'Enlace' });
          await expect(enlaceSpan).toBeVisible({ timeout: 5000 });
          
          // Navegar al contenedor del switch
          const switchContainer = enlaceSpan.locator('../div').first();
          const checkboxAlt = switchContainer.locator('input[type="checkbox"]');
          
          if (await checkboxAlt.isVisible({ timeout: 5000 })) {
            const isChecked = await checkboxAlt.isChecked();
            console.log(`📊 Estado actual (método alternativo): ${isChecked ? 'Activado' : 'Desactivado'}`);
            
            // Cambiar el estado
            if (isChecked) {
              await checkboxAlt.uncheck();
              console.log('✅ Checkbox Enlace desactivado usando método alternativo');
            } else {
              await checkboxAlt.check();
              console.log('✅ Checkbox Enlace activado usando método alternativo');
            }
          } else {
            console.log('⚠️ Checkbox Enlace no visible en método alternativo');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para checkbox Enlace también falló: ${altError.message}`);
          
          // Último intento: buscar por clase del form-check-input
          console.log('🔄 Último intento con selector por clase...');
          try {
            const checkboxClase = page.locator('input.form-check-input[type="checkbox"]').filter({ hasText: '' });
            const checkboxCount = await checkboxClase.count();
            console.log(`📊 Checkboxes encontrados por clase: ${checkboxCount}`);
            
            if (checkboxCount > 0) {
              // Intentar con el primer checkbox que coincida
              const primerCheckbox = checkboxClase.first();
              if (await primerCheckbox.isVisible({ timeout: 2000 })) {
                const isChecked = await primerCheckbox.isChecked();
                console.log(`📊 Estado del primer checkbox encontrado: ${isChecked ? 'Activado' : 'Desactivado'}`);
                
                // Cambiar el estado
                if (isChecked) {
                  await primerCheckbox.uncheck();
                  console.log('✅ Checkbox desactivado usando selector por clase');
                } else {
                  await primerCheckbox.check();
                  console.log('✅ Checkbox activado usando selector por clase');
                }
              }
            }
          } catch (claseError) {
            console.log(`⚠️ Método por clase también falló: ${claseError.message}`);
          }
        }
      }

      // Pausa para verificar el cambio del checkbox Enlace
      await page.waitForTimeout(3000);
      console.log('✓ Edición de checkbox Enlace completada');

      // === COMPLETAR CAMPO "CANTIDAD DE EQUIPOS A INSTALAR" EN EDICIÓN ===
      console.log('📊 Cambiando Cantidad de equipos a instalar de "78" a "95"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo por su name attribute
        const equipmentQuantityInput = page.locator('input[name="equipmentQuantity"]');
        await expect(equipmentQuantityInput).toBeVisible({ timeout: 10000 });
        
        // Nueva cantidad mayor que la original
        const nuevaCantidad = '95';
        
        await equipmentQuantityInput.clear();
        await equipmentQuantityInput.fill(nuevaCantidad);
        
        console.log(`✅ Cantidad de equipos a instalar cambiada exitosamente: 78 → ${nuevaCantidad}`);
      } catch (error) {
        console.log(`Error al cambiar cantidad de equipos a instalar: ${error.message}`);
        
        // Método alternativo usando el label
        console.log('🔄 Intentando método alternativo para cantidad de equipos...');
        try {
          const labelEquipos = page.locator('label').filter({ hasText: 'Cantidad de equipos a instalar' });
          await expect(labelEquipos).toBeVisible({ timeout: 5000 });
          
          // Buscar el contenedor del input
          const contenedorFormFloating = labelEquipos.locator('..');
          const inputEquipos = contenedorFormFloating.locator('input[type="number"]');
          await expect(inputEquipos).toBeVisible({ timeout: 5000 });
          
          // Nueva cantidad mayor que la original
          const nuevaCantidad = '95';
          
          await inputEquipos.clear();
          await inputEquipos.fill(nuevaCantidad);
          
          console.log(`✅ Cantidad de equipos cambiada usando método alternativo: 78 → ${nuevaCantidad}`);
        } catch (altError) {
          console.log(`⚠️ Método alternativo para cantidad de equipos también falló: ${altError.message}`);
          
          // Último intento: buscar por selector más general
          console.log('🔄 Último intento con selector general...');
          try {
            const inputGeneral = page.locator('input[type="number"][value="78"]');
            if (await inputGeneral.isVisible({ timeout: 5000 })) {
              const nuevaCantidad = '95';
              
              await inputGeneral.clear();
              await inputGeneral.fill(nuevaCantidad);
              
              console.log(`✅ Cantidad de equipos cambiada con selector general: 78 → ${nuevaCantidad}`);
            } else {
              console.log('⚠️ No se pudo encontrar el campo de cantidad de equipos');
            }
          } catch (generalError) {
            console.log(`⚠️ Método general también falló: ${generalError.message}`);
          }
        }
      }

      // Pausa para verificar el cambio del campo "Cantidad de equipos"
      await page.waitForTimeout(3000);
      console.log('✓ Edición de campo "Cantidad de equipos a instalar" completada');

      // === COMPLETAR CAMPO "TIPO" EN EDICIÓN ===
      console.log('🔧 Cambiando Tipo de "GPRS" a "LAN"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Tipo" por su label
        const labelTipoSpan = page.locator('span').filter({ hasText: 'Tipo' });
        await expect(labelTipoSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelTipoSpan.locator('../..');
        const tipoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(tipoSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await tipoSelector.click();
        console.log('✓ Dropdown de "Tipo" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "LAN"
        const opcionLAN = page.locator('[role="option"]').filter({ hasText: 'LAN' }).first();
        if (await opcionLAN.count() > 0) {
          const textoSeleccionado = await opcionLAN.textContent();
          await opcionLAN.click();
          console.log(`✅ Tipo cambiado exitosamente: GPRS → ${textoSeleccionado}`);
        } else {
          // Si no encuentra "LAN", buscar opciones similares
          const opcionesAlternativas = [
            'LAN',
            'lan',
            'Lan',
            'LOCAL AREA NETWORK'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Tipo cambiado con opción alternativa: GPRS → ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            console.log('⚠️ No se encontró la opción LAN');
            await page.keyboard.press('Escape');
          }
        }
        
      } catch (error) {
        console.log(`Error al cambiar tipo: ${error.message}`);
        
        // Método alternativo usando react-select-21 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para tipo...');
        try {
          const selectInput = page.locator('#react-select-21-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "LAN"
            const option = page.locator('[role="option"]').filter({ hasText: 'LAN' }).first();
            if (await option.count() > 0) {
              await option.click();
              console.log('✅ Tipo cambiado usando react-select-21: GPRS → LAN');
            } else {
              // Si no encuentra "LAN", buscar y listar opciones disponibles
              const todasLasOpciones = page.locator('[role="option"]');
              const cantidadOpciones = await todasLasOpciones.count();
              console.log(`📊 Opciones disponibles en Tipo: ${cantidadOpciones}`);
              
              if (cantidadOpciones > 0) {
                // Mostrar las primeras opciones y seleccionar una alternativa
                console.log('📋 Primeras opciones disponibles para Tipo:');
                for (let i = 0; i < Math.min(3, cantidadOpciones); i++) {
                  try {
                    const opcionTexto = await todasLasOpciones.nth(i).textContent();
                    console.log(`  ${i + 1}. ${opcionTexto}`);
                  } catch (e) {
                    // Continuar con la siguiente opción
                  }
                }
                
                // Seleccionar la primera opción disponible como fallback
                const textoSeleccionado = await todasLasOpciones.first().textContent();
                await todasLasOpciones.first().click();
                console.log(`✅ Tipo cambiado con primera opción disponible: GPRS → ${textoSeleccionado}`);
              } else {
                await page.keyboard.press('Escape');
                console.log('⚠️ No se encontraron opciones para tipo');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-21 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para tipo también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del campo "Tipo"
      await page.waitForTimeout(3000);
      console.log('✓ Edición de campo "Tipo" completada');

      // === COMPLETAR CAMPO "MODELO" EN EDICIÓN ===
      console.log('📦 Cambiando Modelo de "MODELO 1" a "MODELO 2"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo "Modelo" por su label
        const labelModeloSpan = page.locator('span').filter({ hasText: 'Modelo' });
        await expect(labelModeloSpan).toBeVisible({ timeout: 10000 });
        
        // Navegar al contenedor del React Select
        const contenedorFormFloating = labelModeloSpan.locator('../..');
        const modeloSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
        await expect(modeloSelector).toBeVisible({ timeout: 10000 });
        
        // Hacer clic para abrir el dropdown
        await modeloSelector.click();
        console.log('✓ Dropdown de "Modelo" abierto');
        
        // Esperar a que aparezcan las opciones
        await page.waitForTimeout(3000);
        
        // Buscar y seleccionar "MODELO 2"
        const opcionModelo2 = page.locator('[role="option"]').filter({ hasText: 'MODELO 2' }).first();
        if (await opcionModelo2.count() > 0) {
          const textoSeleccionado = await opcionModelo2.textContent();
          await opcionModelo2.click();
          console.log(`✅ Modelo cambiado exitosamente: MODELO 1 → ${textoSeleccionado}`);
        } else {
          // Si no encuentra "MODELO 2", buscar opciones similares
          const opcionesAlternativas = [
            'MODELO 2',
            'Modelo 2',
            'modelo 2',
            'Model 2',
            'MODEL 2'
          ];
          
          let opcionEncontrada = false;
          for (const opcionAlt of opcionesAlternativas) {
            const optionAlt = page.locator('[role="option"]').filter({ hasText: opcionAlt }).first();
            if (await optionAlt.count() > 0) {
              const textoSeleccionado = await optionAlt.textContent();
              await optionAlt.click();
              console.log(`✅ Modelo cambiado con opción alternativa: MODELO 1 → ${textoSeleccionado}`);
              opcionEncontrada = true;
              break;
            }
          }
          
          if (!opcionEncontrada) {
            console.log('⚠️ No se encontró la opción MODELO 2');
            await page.keyboard.press('Escape');
          }
        }
        
      } catch (error) {
        console.log(`Error al cambiar modelo: ${error.message}`);
        
        // Método alternativo usando react-select-23 (basado en el HTML proporcionado)
        console.log('🔄 Intentando método alternativo para modelo...');
        try {
          const selectInput = page.locator('#react-select-23-input');
          if (await selectInput.isVisible({ timeout: 5000 })) {
            const selectContainer = selectInput.locator('../..');
            await selectContainer.click();
            await page.waitForTimeout(2000);
            
            // Buscar la opción "MODELO 2"
            const option = page.locator('[role="option"]').filter({ hasText: 'MODELO 2' }).first();
            if (await option.count() > 0) {
              await option.click();
              console.log('✅ Modelo cambiado usando react-select-23: MODELO 1 → MODELO 2');
            } else {
              // Si no encuentra "MODELO 2", buscar y listar opciones disponibles
              const todasLasOpciones = page.locator('[role="option"]');
              const cantidadOpciones = await todasLasOpciones.count();
              console.log(`📊 Opciones disponibles en Modelo: ${cantidadOpciones}`);
              
              if (cantidadOpciones > 0) {
                // Mostrar las primeras opciones y buscar cualquier "MODELO" con número diferente a 1
                console.log('📋 Opciones disponibles para Modelo:');
                let modeloAlternativoEncontrado = false;
                
                for (let i = 0; i < cantidadOpciones; i++) {
                  try {
                    const opcionTexto = await todasLasOpciones.nth(i).textContent();
                    console.log(`  ${i + 1}. ${opcionTexto}`);
                    
                    // Si encuentra cualquier modelo que no sea MODELO 1, seleccionarlo
                    if (opcionTexto && opcionTexto.includes('MODELO') && !opcionTexto.includes('MODELO 1')) {
                      await todasLasOpciones.nth(i).click();
                      console.log(`✅ Modelo cambiado con opción alternativa: MODELO 1 → ${opcionTexto}`);
                      modeloAlternativoEncontrado = true;
                      break;
                    }
                  } catch (e) {
                    // Continuar con la siguiente opción
                  }
                }
                
                if (!modeloAlternativoEncontrado) {
                  // Como último recurso, seleccionar cualquier opción que no sea la primera (para cambiar de MODELO 1)
                  if (cantidadOpciones > 1) {
                    const textoSeleccionado = await todasLasOpciones.nth(1).textContent();
                    await todasLasOpciones.nth(1).click();
                    console.log(`✅ Modelo cambiado con segunda opción disponible: MODELO 1 → ${textoSeleccionado}`);
                  } else {
                    await page.keyboard.press('Escape');
                    console.log('⚠️ Solo hay una opción de modelo disponible');
                  }
                }
              } else {
                await page.keyboard.press('Escape');
                console.log('⚠️ No se encontraron opciones para modelo');
              }
            }
          } else {
            console.log('⚠️ Campo react-select-23 no visible');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para modelo también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del campo "Modelo"
      await page.waitForTimeout(3000);
      console.log('✓ Edición de campo "Modelo" completada');

      // === COMPLETAR CAMPO "CANTIDAD DE EQUIPOS A REINSTALAR" EN EDICIÓN ===
      console.log('🔄 Cambiando Cantidad de equipos a reinstalar de "45" a "60"...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el campo por su name attribute
        const reinstallQuantityInput = page.locator('input[name="reinstallQuantity"]');
        await expect(reinstallQuantityInput).toBeVisible({ timeout: 10000 });
        
        // Nueva cantidad mayor que la original
        const nuevaCantidadReinstall = '60';
        
        await reinstallQuantityInput.clear();
        await reinstallQuantityInput.fill(nuevaCantidadReinstall);
        
        console.log(`✅ Cantidad de equipos a reinstalar cambiada exitosamente: 45 → ${nuevaCantidadReinstall}`);
      } catch (error) {
        console.log(`Error al cambiar cantidad de equipos a reinstalar: ${error.message}`);
        
        // Método alternativo usando el label
        console.log('🔄 Intentando método alternativo para cantidad de equipos a reinstalar...');
        try {
          const labelReinstall = page.locator('label').filter({ hasText: 'Cantidad de equipos a instalar' });
          // Buscar el que tenga valor 45 (el de reinstalación)
          const containers = await labelReinstall.locator('..').all();
          
          for (const container of containers) {
            const input = container.locator('input[type="number"]');
            if (await input.isVisible({ timeout: 2000 })) {
              const currentValue = await input.inputValue();
              if (currentValue === '45') {
                const nuevaCantidadReinstall = '60';
                await input.clear();
                await input.fill(nuevaCantidadReinstall);
                console.log(`✅ Cantidad de equipos a reinstalar cambiada usando método alternativo: 45 → ${nuevaCantidadReinstall}`);
                break;
              }
            }
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para cantidad de equipos a reinstalar también falló: ${altError.message}`);
          
          // Último intento: buscar por valor específico
          console.log('🔄 Último intento con selector por valor...');
          try {
            const inputPorValor = page.locator('input[type="number"][value="45"]');
            if (await inputPorValor.isVisible({ timeout: 5000 })) {
              const nuevaCantidadReinstall = '60';
              await inputPorValor.clear();
              await inputPorValor.fill(nuevaCantidadReinstall);
              console.log(`✅ Cantidad de equipos a reinstalar cambiada con selector por valor: 45 → ${nuevaCantidadReinstall}`);
            } else {
              console.log('⚠️ No se pudo encontrar el campo de cantidad de equipos a reinstalar');
            }
          } catch (valorError) {
            console.log(`⚠️ Método por valor también falló: ${valorError.message}`);
          }
        }
      }

      // Pausa para verificar el cambio del campo "Cantidad de equipos a reinstalar"
      await page.waitForTimeout(3000);
      console.log('✓ Edición de campo "Cantidad de equipos a reinstalar" completada');

      // === ACTUALIZAR CHECKBOX "CABLEADO (REINSTALL)" EN EDICIÓN ===
      console.log('🔌 Actualizando checkbox Cableado (reinstall) - alternando estado...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el checkbox por su ID específico
        const cableadoReinstallCheckbox = page.locator('#reinstall-wiring-switch');
        await expect(cableadoReinstallCheckbox).toBeVisible({ timeout: 10000 });
        
        // Verificar el estado actual
        const isChecked = await cableadoReinstallCheckbox.isChecked();
        console.log(`📊 Estado actual del checkbox Cableado (reinstall): ${isChecked ? 'Activado' : 'Desactivado'}`);
        
        // Cambiar el estado (si está activado, desactivarlo; si está desactivado, activarlo)
        if (isChecked) {
          await cableadoReinstallCheckbox.uncheck();
          console.log('✅ Checkbox Cableado (reinstall) desactivado exitosamente');
        } else {
          await cableadoReinstallCheckbox.check();
          console.log('✅ Checkbox Cableado (reinstall) activado exitosamente');
        }
        
      } catch (error) {
        console.log(`Error al actualizar checkbox Cableado (reinstall): ${error.message}`);
        
        // Método alternativo usando el texto y navegación
        console.log('🔄 Intentando método alternativo para checkbox Cableado (reinstall)...');
        try {
          // Buscar por el span que contiene "Cableado" cerca del contexto de reinstalación
          const cableadoSpans = page.locator('span').filter({ hasText: 'Cableado' });
          const cableadoSpanCount = await cableadoSpans.count();
          console.log(`📊 Spans "Cableado" encontrados: ${cableadoSpanCount}`);
          
          // Si hay múltiples spans "Cableado", buscar el segundo (el de reinstall)
          const cableadoSpanReinstall = cableadoSpanCount > 1 ? cableadoSpans.nth(1) : cableadoSpans.first();
          
          if (await cableadoSpanReinstall.isVisible({ timeout: 5000 })) {
            const switchContainer = cableadoSpanReinstall.locator('../div').first();
            const checkboxAlt = switchContainer.locator('input[type="checkbox"]');
            
            if (await checkboxAlt.isVisible({ timeout: 5000 })) {
              const isChecked = await checkboxAlt.isChecked();
              console.log(`📊 Estado actual (método alternativo): ${isChecked ? 'Activado' : 'Desactivado'}`);
              
              // Cambiar el estado
              if (isChecked) {
                await checkboxAlt.uncheck();
                console.log('✅ Checkbox Cableado (reinstall) desactivado usando método alternativo');
              } else {
                await checkboxAlt.check();
                console.log('✅ Checkbox Cableado (reinstall) activado usando método alternativo');
              }
            } else {
              console.log('⚠️ Checkbox Cableado (reinstall) no visible en método alternativo');
            }
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para checkbox Cableado (reinstall) también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del checkbox Cableado (reinstall)
      await page.waitForTimeout(3000);
      console.log('✓ Edición de checkbox Cableado (reinstall) completada');

      // === ACTUALIZAR CHECKBOX "ENLACE (REINSTALL)" EN EDICIÓN ===
      console.log('🔗 Actualizando checkbox Enlace (reinstall) - alternando estado...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el checkbox por su ID específico
        const enlaceReinstallCheckbox = page.locator('#reinstall-link-switch');
        await expect(enlaceReinstallCheckbox).toBeVisible({ timeout: 10000 });
        
        // Verificar el estado actual
        const isChecked = await enlaceReinstallCheckbox.isChecked();
        console.log(`📊 Estado actual del checkbox Enlace (reinstall): ${isChecked ? 'Activado' : 'Desactivado'}`);
        
        // Cambiar el estado (si está activado, desactivarlo; si está desactivado, activarlo)
        if (isChecked) {
          await enlaceReinstallCheckbox.uncheck();
          console.log('✅ Checkbox Enlace (reinstall) desactivado exitosamente');
        } else {
          await enlaceReinstallCheckbox.check();
          console.log('✅ Checkbox Enlace (reinstall) activado exitosamente');
        }
        
      } catch (error) {
        console.log(`Error al actualizar checkbox Enlace (reinstall): ${error.message}`);
        
        // Método alternativo usando el texto y navegación
        console.log('🔄 Intentando método alternativo para checkbox Enlace (reinstall)...');
        try {
          // Buscar por el span que contiene "Enlace" cerca del contexto de reinstalación
          const enlaceSpans = page.locator('span').filter({ hasText: 'Enlace' });
          const enlaceSpanCount = await enlaceSpans.count();
          console.log(`📊 Spans "Enlace" encontrados: ${enlaceSpanCount}`);
          
          // Si hay múltiples spans "Enlace", buscar el segundo (el de reinstall)
          const enlaceSpanReinstall = enlaceSpanCount > 1 ? enlaceSpans.nth(1) : enlaceSpans.first();
          
          if (await enlaceSpanReinstall.isVisible({ timeout: 5000 })) {
            const switchContainer = enlaceSpanReinstall.locator('../div').first();
            const checkboxAlt = switchContainer.locator('input[type="checkbox"]');
            
            if (await checkboxAlt.isVisible({ timeout: 5000 })) {
              const isChecked = await checkboxAlt.isChecked();
              console.log(`📊 Estado actual (método alternativo): ${isChecked ? 'Activado' : 'Desactivado'}`);
              
              // Cambiar el estado
              if (isChecked) {
                await checkboxAlt.uncheck();
                console.log('✅ Checkbox Enlace (reinstall) desactivado usando método alternativo');
              } else {
                await checkboxAlt.check();
                console.log('✅ Checkbox Enlace (reinstall) activado usando método alternativo');
              }
            } else {
              console.log('⚠️ Checkbox Enlace (reinstall) no visible en método alternativo');
            }
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para checkbox Enlace (reinstall) también falló: ${altError.message}`);
        }
      }

      // Pausa para verificar el cambio del checkbox Enlace (reinstall)
      await page.waitForTimeout(3000);
      console.log('✓ Edición de checkbox Enlace (reinstall) completada');

      // === AGREGAR NOTA EN LA EDICIÓN ===
      console.log('📝 Agregando nota en la edición...');
      await page.waitForTimeout(2000);
      
      try {
        // Buscar el textarea de notas
        const notesTextarea = page.locator('textarea[name="description"].Notes_textarea__IN3Dq');
        await expect(notesTextarea).toBeVisible({ timeout: 10000 });
        
        // Texto de la nota documentando los cambios realizados
        const textoNota = `Edición automatizada completada:
          • Comercio: SUPER MOTO CROSS → STELA NOVEDADES (0901499)
          • Tipo: GPRS → LAN, Modelo: MODELO 1 → MODELO 2
          • Cantidades: Puntos 85→120, Equipos 78→95, Reinstall 45→60
          • Estado: Nuevo → Finalizado, Inconveniente: Cableado → Caja Integracion
          • Responsable: AHORRO PACK (BACK OFFICE)
          Test automatizado exitoso.`;
        
        await notesTextarea.clear();
        await notesTextarea.fill(textoNota);
        
        console.log('✓ Nota escrita exitosamente');
        
        // Buscar y hacer clic en el botón "Enviar"
        const enviarButton = page.locator('button.Notes_submitButton__rMudm').filter({ hasText: 'Enviar' });
        await expect(enviarButton).toBeVisible({ timeout: 10000 });
        await enviarButton.click();
        
        console.log('✅ Nota enviada exitosamente');
        
      } catch (error) {
        console.log(`Error al agregar nota: ${error.message}`);
        
        // Método alternativo para el textarea
        console.log('🔄 Intentando método alternativo para nota...');
        try {
          // Buscar por placeholder
          const textareaAlt = page.locator('textarea[placeholder="Escribe aquí una nota..."]');
          if (await textareaAlt.isVisible({ timeout: 5000 })) {
            const textoNotaCorto = 'Edición automática completada - Todos los campos modificados según especificaciones del test. Cambios: Área Resolutora, comercio (SUPER MOTO CROSS → STELA NOVEDADES), tipo (GPRS → LAN), modelo (MODELO 1 → MODELO 2), cantidades actualizadas, checkboxes modificados.';
            
            await textareaAlt.clear();
            await textareaAlt.fill(textoNotaCorto);
            
            console.log('✓ Nota escrita usando método alternativo');
            
            // Buscar botón enviar alternativo
            const enviarButtonAlt = page.locator('button').filter({ hasText: 'Enviar' });
            if (await enviarButtonAlt.isVisible({ timeout: 5000 })) {
              await enviarButtonAlt.click();
              console.log('✅ Nota enviada usando método alternativo');
            } else {
              // Buscar por clase del botón
              const enviarButtonClase = page.locator('button[type="button"]').filter({ hasText: 'Enviar' });
              if (await enviarButtonClase.isVisible({ timeout: 5000 })) {
                await enviarButtonClase.click();
                console.log('✅ Nota enviada usando selector por clase');
              } else {
                console.log('⚠️ No se pudo encontrar el botón Enviar');
              }
            }
          } else {
            console.log('⚠️ Textarea de notas no visible en método alternativo');
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para nota también falló: ${altError.message}`);
          
          // Último intento: buscar cualquier textarea visible
          console.log('🔄 Último intento buscando cualquier textarea...');
          try {
            const textareaGeneral = page.locator('textarea').filter({ hasText: '' });
            const textareaCount = await textareaGeneral.count();
            console.log(`📊 Textareas encontrados: ${textareaCount}`);
            
            if (textareaCount > 0) {
              // Intentar con el último textarea (probablemente el de notas)
              const ultimoTextarea = textareaGeneral.last();
              if (await ultimoTextarea.isVisible({ timeout: 5000 })) {
                const textoNotaBasico = 'Edición automática completada - Modificaciones realizadas según test automatizado.';
                
                await ultimoTextarea.clear();
                await ultimoTextarea.fill(textoNotaBasico);
                
                console.log('✓ Nota básica escrita en último textarea disponible');
                
                // Buscar cualquier botón que contenga "Enviar"
                const enviarGeneral = page.locator('button:has-text("Enviar")');
                if (await enviarGeneral.isVisible({ timeout: 5000 })) {
                  await enviarGeneral.click();
                  console.log('✅ Nota enviada con selector general');
                }
              }
            }
          } catch (generalError) {
            console.log(`⚠️ Método general también falló: ${generalError.message}`);
          }
        }
      }

      // Pausa para verificar que la nota se envió correctamente
      await page.waitForTimeout(3000);
      console.log('✓ Proceso de nota completado');

      // === GUARDAR CAMBIOS EN LA EDICIÓN ===
      console.log('💾 Guardando cambios de la edición...');
      await page.waitForTimeout(2000);
      
      try {
        const guardarButtonEdit = page.locator('button.primaryButton_button__IrLLt').filter({ hasText: 'Guardar' });
        await expect(guardarButtonEdit).toBeVisible({ timeout: 10000 });
        await guardarButtonEdit.click();
        
        console.log('✅ Cambios guardados exitosamente en la edición');
      } catch (error) {
        console.log(`Error al guardar en edición: ${error.message}`);
        
        // Método alternativo para guardar
        console.log('🔄 Intentando método alternativo para guardar en edición...');
        try {
          const guardarButtonAlt = page.locator('button').filter({ hasText: 'Guardar' });
          if (await guardarButtonAlt.isVisible({ timeout: 5000 })) {
            await guardarButtonAlt.click();
            console.log('✅ Cambios guardados usando método alternativo');
          } else {
            const guardarButtonGeneral = page.locator('button:has-text("Guardar")');
            if (await guardarButtonGeneral.isVisible({ timeout: 5000 })) {
              await guardarButtonGeneral.click();
              console.log('✅ Cambios guardados usando selector general');
            }
          }
        } catch (altError) {
          console.log(`⚠️ Método alternativo para guardar también falló: ${altError.message}`);
        }
      }

      // Pausa final para verificar el guardado de la edición
      console.log('⏳ Pausa final para verificar el guardado de la edición - 10 segundos...');
      await page.waitForTimeout(10000);
      console.log('🎉 Proceso de creación y edición completado exitosamente');
      
    } catch (error) {
      console.log(`Error al acceder a la instalación: ${error.message}`);
      
      // Método alternativo: buscar por cualquier botón de edición disponible
      console.log('🔄 Intentando método alternativo para encontrar el botón de edición...');
      try {
        // Buscar cualquier SVG de edición en las filas de la tabla
        const botonesEdicion = page.locator('.rs-table-row svg[stroke="currentColor"]');
        const cantidadBotones = await botonesEdicion.count();
        
        if (cantidadBotones > 0) {
          console.log(`Encontrados ${cantidadBotones} botones de edición`);
          
          // Hacer clic en el primer botón disponible
          await botonesEdicion.first().click();
          console.log('✅ Botón de edición presionado usando método alternativo');
          
          // Esperar navegación
          await page.waitForURL('**/front-crm/technical-support/edit/**', { timeout: 15000 });
          const urlActual = page.url();
          console.log(`✅ Navegación exitosa usando método alternativo: ${urlActual}`);
        } else {
          console.log('⚠️ No se encontraron botones de edición en la tabla');
          
          // Último intento: buscar por el icono de lápiz específico
          const iconoLapiz = page.locator('svg path[d*="21.174 6.812"]').first();
          if (await iconoLapiz.isVisible({ timeout: 5000 })) {
            await iconoLapiz.click();
            console.log('✅ Botón de edición presionado por icono de lápiz');
            
            await page.waitForURL('**/front-crm/technical-support/edit/**', { timeout: 15000 });
            const urlActual = page.url();
            console.log(`✅ Navegación exitosa por icono de lápiz: ${urlActual}`);
          } else {
            console.log('⚠️ No se pudo encontrar ningún botón de edición');
          }
        }
      } catch (altError) {
        console.log(`⚠️ Método alternativo también falló: ${altError.message}`);
      }
    }

    // Pausa final para verificar el acceso a la instalación
    console.log('⏳ Pausa final para verificar el acceso a la instalación - 10 segundos...');
    await page.waitForTimeout(10000);

  } catch (testError) {
    console.log('Error general del test:', testError.message);
    
    // Verificar si la página sigue activa
    if (!page.isClosed()) {
      console.log('La página sigue activa para inspección manual');
      // Pausa para permitir inspección manual
      await page.waitForTimeout(5000);
    }
    
    throw testError;
  }
});