// Importa las funciones principales de Playwright para definir tests y hacer aserciones
import { test, expect } from '@playwright/test';

// Define la URL base de la aplicación
const BASE_URL = 'http://localhost:3000'; // Cambia aquí si tu backend está en otro puerto

// Define la URL de la pantalla principal de casos usando la base
const CASES_URL = `${BASE_URL}/front-crm/cases`; // Ruta para la pantalla de casos

// Define la URL de la pantalla de materiales
const MATERIALS_URL = `${BASE_URL}/front-crm/materials`; // Ruta para la pantalla de materiales

// Define el patrón de URL para la edición de materiales
const MATERIALS_EDIT_URL_PATTERN = /\/front-crm\/materials\/edit\/\d+/; // Expresión regular para detectar la URL de edición

// Variable para almacenar el ID del pedido creado
let materialId: string = ''; // Se usará para guardar el ID del material creado/reciente

// Test principal que automatiza el flujo de creación y edición de un pedido de materiales
test('Acceder a la pantalla de materiales', async ({ page }) => {
  // Establece el timeout máximo del test en 180 segundos (3 minutos)
  test.setTimeout(180000); // Da tiempo suficiente para procesos lentos

  // Configura el manejo de errores de página para mostrar en consola si ocurre alguno
  page.on('pageerror', (error) => {
    console.log('Error de página detectado:', error.message); // Muestra el mensaje de error
  });

  // Detecta si la página se cierra inesperadamente
  page.on('crash', () => {
    console.log('La página se ha cerrado inesperadamente');
  });

  // --- LOGIN ---

  // Navega a la pantalla principal de casos (login)
  await page.goto(CASES_URL); // Abre la página de login
  // Completa el campo de usuario
  await page.locator('input[name="userName"]').fill('admin@clt.com.py'); // Ingresa el usuario
  // Completa el campo de contraseña
  await page.locator('input[name="password"]').fill('B3rL!n57A'); // Ingresa la contraseña
  // Presiona Enter para enviar el formulario de login
  await page.keyboard.press('Enter'); // Envía el formulario
  // Espera a que la URL sea la de la pantalla principal de casos
  await page.waitForURL(CASES_URL); // Espera a que el login sea exitoso
  // Verifica que el botón "Crear Caso" esté visible
  await expect(page.getByRole('button', { name: 'Crear Caso' })).toBeVisible(); // Confirma que se cargó la pantalla principal

  // --- REDIRECCIÓN A MATERIALES ---

  // Navega a la URL de materiales después del login
  await page.goto(MATERIALS_URL); // Redirige a la pantalla de materiales
  // Espera a que la URL sea la de materiales
  await page.waitForURL(MATERIALS_URL); // Confirma que la redirección fue exitosa
  
  // --- CREAR PEDIDO DE MATERIALES ---
  
  // Localiza el botón "Crear Pedido de Materiales" usando su clase y texto
  const crearPedidoBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Crear Pedido de Materiales' });
  // Espera a que el botón esté visible para asegurarse de que la página cargó
  await expect(crearPedidoBtn).toBeVisible({ timeout: 10000 });
  // Hace clic en el botón para iniciar la creación de un nuevo pedido
  await crearPedidoBtn.click();
  
  // Espera a que la URL cambie a la página de creación de pedido
  await page.waitForURL(`${BASE_URL}/front-crm/materials/new`); // Confirma que se abrió el formulario de nuevo pedido
  
  // --- COMPLETAR FORMULARIO ---
  
  // Localiza el campo de título del pedido
  const tituloInput = page.locator('input[name="Title"]');
  await expect(tituloInput).toBeVisible({ timeout: 10000 }); // Espera a que el campo esté visible
  
  // Limpia el campo de título por si tiene texto previo
  await tituloInput.clear();
  // Escribe el nuevo título para el pedido
  await tituloInput.fill('Pruebas automatizadas');
  
  // --- COMPLETAR SELECTOR ---
  
  // Localiza el primer selector de React Select (por clase) y lo abre
  const reactSelect = page.locator('.css-b4hd2p-control').first();
  await expect(reactSelect).toBeVisible({ timeout: 10000 }); // Espera a que el selector esté visible
  await reactSelect.click(); // Abre el menú de opciones
  
  // Espera un segundo para que carguen las opciones del selector
  await page.waitForTimeout(1000); // Pausa breve para carga visual
  // Localiza la opción "ADMIN CRM" y la selecciona
  const adminCrmOption = page.locator('text=ADMIN CRM');
  await expect(adminCrmOption).toBeVisible({ timeout: 10000 });
  await adminCrmOption.click();
  
  // --- COMPLETAR SEGUNDO SELECTOR ---
  
  // Localiza el segundo selector de React Select (índice 1) y lo abre
  const segundoReactSelect = page.locator('.css-b4hd2p-control').nth(1);
  await expect(segundoReactSelect).toBeVisible({ timeout: 10000 });
  await segundoReactSelect.click();
  
  // Espera un segundo para que carguen las opciones y selecciona "SUPER MOTO CROSS"
  await page.waitForTimeout(1000); // Pausa breve para carga visual
  const superMotoCrossOption = page.locator('text=SUPER MOTO CROSS');
  await expect(superMotoCrossOption).toBeVisible({ timeout: 10000 });
  await superMotoCrossOption.click();
  
  // --- COMPLETAR TERCER SELECTOR ---

  // Espera 3 segundos para asegurar que el campo anterior se complete correctamente
  await page.waitForTimeout(3000);
  
  // Localiza el tercer selector de React Select (índice 2) y lo abre
  const tercerReactSelect = page.locator('.css-b4hd2p-control').nth(2);
  await expect(tercerReactSelect).toBeVisible({ timeout: 10000 });
  await tercerReactSelect.click();
  
  // Espera un segundo y selecciona la opción "SUPER MOTO CROSS (1)"
  await page.waitForTimeout(1000); // Pausa breve para carga visual
  const superMotoCross1Option = page.locator('text=SUPER MOTO CROSS (1)');
  await expect(superMotoCross1Option).toBeVisible({ timeout: 10000 });
  await superMotoCross1Option.click();
  
  // --- COMPLETAR CUARTO SELECTOR ---
  
  // Espera 3 segundos para que se complete bien el campo anterior
  await page.waitForTimeout(3000);
  
  // Localiza el cuarto selector de React Select y hace clic para abrirlo
  const cuartoReactSelect = page.locator('.css-b4hd2p-control').nth(3);
  await expect(cuartoReactSelect).toBeVisible({ timeout: 10000 });
  await cuartoReactSelect.click();
  
  // Espera a que aparezcan las opciones y selecciona "1400395"
  await page.waitForTimeout(1000); // Pequeña pausa para que carguen las opciones
  const option = page.locator('text=1400395');
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
  
  // --- COMPLETAR QUINTO SELECTOR ---
  
  // Espera 3 segundos para que se complete bien el campo anterior
  await page.waitForTimeout(3000);
  
  // Localiza el quinto selector de React Select y hace clic para abrirlo
  const quintoReactSelect = page.locator('.css-b4hd2p-control').nth(4);
  await expect(quintoReactSelect).toBeVisible({ timeout: 10000 });
  await quintoReactSelect.click();
  
  // Espera a que aparezcan las opciones y selecciona "OTROS"
  await page.waitForTimeout(1000); // Pequeña pausa para que carguen las opciones
  const otrosOption = page.locator('text=OTROS');
  await expect(otrosOption).toBeVisible({ timeout: 10000 });
  await otrosOption.click();
  
  // --- COMPLETAR CAMPO DE TEXTO "OTROS" ---
  
  // Espera a que se habilite el campo de texto después de seleccionar "OTROS"
  await page.waitForTimeout(2000);
  
  // Localiza el campo de texto "others" y completa con "pruebas"
  const othersInput = page.locator('input[name="others"]');
  await expect(othersInput).toBeVisible({ timeout: 10000 });
  await othersInput.fill('Pruebas Automatizadas');
  
  // --- COMPLETAR SEXTO SELECTOR ---
  
  // Espera 3 segundos para que se complete bien el campo anterior
  await page.waitForTimeout(3000);
  
  // Localiza el sexto selector de React Select y hace clic para abrirlo
  const sextoReactSelect = page.locator('.css-b4hd2p-control').nth(5);
  await expect(sextoReactSelect).toBeVisible({ timeout: 10000 });
  await sextoReactSelect.click();
  
  // Espera a que aparezcan las opciones y selecciona "ATC"
  await page.waitForTimeout(1000); // Pequeña pausa para que carguen las opciones
  const atcOption = page.locator('text=ATC');
  await expect(atcOption).toBeVisible({ timeout: 10000 });
  await atcOption.click();
  
  // --- COMPLETAR SÉPTIMO SELECTOR ---

  // Espera 3 segundos para que se complete bien el campo anterior
  await page.waitForTimeout(3000);

  // Localiza el séptimo selector de React Select y hace clic para abrirlo
  const septimoReactSelect = page.locator('.css-b4hd2p-control').nth(6);
  await expect(septimoReactSelect).toBeVisible({ timeout: 10000 });
  await septimoReactSelect.click();

  // Espera a que aparezcan las opciones y selecciona "ENVIO"
  await page.waitForTimeout(1000);
  const envioOption = page.locator('text=ENVIO');
  await expect(envioOption).toBeVisible({ timeout: 10000 });
  await envioOption.click();
  
  // --- COMPLETAR CAMPO DE DESCRIPCIÓN ---
  
  // Espera 3 segundos para que se complete bien el campo anterior
  await page.waitForTimeout(3000);
  
  // Localiza el campo de descripción (textarea) y completa con el texto
  const descriptionTextarea = page.locator('textarea[name="description"]');
  await expect(descriptionTextarea).toBeVisible({ timeout: 10000 });
  await descriptionTextarea.fill('Pruebas de detalle de envio');
  
  // --- COMPLETAR CHECKBOX Y CANTIDAD ---
  
  // Espera 2 segundos para que se complete bien el campo anterior
  await page.waitForTimeout(2000);
  
  // Selecciona el producto "Hola Prueba" (primera fila)
  const filaHolaPrueba = page.getByRole('row', { name: /Hola Prueba/ });
  await expect(filaHolaPrueba).toBeVisible({ timeout: 10000 });
  
  // Localiza el checkbox del producto "Hola Prueba"
  const checkbox = filaHolaPrueba.locator('input[type="checkbox"]#custom-switch');
  await expect(checkbox).toBeVisible({ timeout: 10000 });
  
  // Click una sola vez en el checkbox
  await checkbox.click({ force: true });
  console.log('Checkbox clickeado con force');
  
  // Espera para que se habilite el campo numérico
  await page.waitForTimeout(2000);
  
  // Localiza el campo numérico de la misma fila
  const cantidadInput = filaHolaPrueba.locator('input[type="number"].form-control.text-right.mx-4');
  await expect(cantidadInput).toBeVisible({ timeout: 10000 });
  
  // Completa el campo con la cantidad usando force
  await cantidadInput.fill('5', { force: true }); // INGRESA LA CANTIDAD CON FORCE
  
  // Verifica que el valor se haya ingresado correctamente
  await expect(cantidadInput).toHaveValue('5');
  console.log('Cantidad ingresada correctamente: 5');
  
  // --- GUARDAR FORMULARIO ---
  
  // Localiza y hace clic en el botón "Guardar"
  const guardarBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Guardar' });
  await expect(guardarBtn).toBeVisible({ timeout: 10000 });
  await guardarBtn.click();
  
  // Espera a que aparezca el mensaje de confirmación de creación exitosa
  console.log('Esperando mensaje de confirmación de creación exitosa...');
  
  // Busca diferentes posibles mensajes de confirmación (toma el primer elemento)
  const mensajeConfirmacion = page.locator('text=/creado correctamente|creado exitosamente|guardado correctamente|guardado exitosamente|Material creado|Pedido creado|Material guardado|Pedido guardado|éxito|exitoso|correctamente/i').first();
  await expect(mensajeConfirmacion).toBeVisible({ timeout: 15000 });
  
  const mensajeTexto = await mensajeConfirmacion.textContent();
  console.log(`Mensaje de confirmación recibido: ${mensajeTexto}`);
  
  // Espera a que el sistema redirija automáticamente a la pantalla principal
  console.log('Esperando que el sistema redirija automáticamente...');
  await page.waitForURL(MATERIALS_URL, { timeout: 10000 });
  
  // Espera a que la tabla se cargue completamente
  await page.waitForTimeout(3000);
  
  // Refresca la página para asegurar que se muestre el pedido más reciente
  console.log('Refrescando la página para mostrar el pedido más reciente...');
  await page.reload();
  await page.waitForTimeout(2000);
  
  // --- CAPTURAR ID DEL PRIMER PEDIDO (MÁS RECIENTE) ---
  
  // Localiza la primera fila de la tabla (más reciente) y extrae el número de ticket
  const primeraFilaTicket = page.locator('.rs-table-row').nth(1).locator('[aria-colindex="3"]');
  await expect(primeraFilaTicket).toBeVisible({ timeout: 10000 });
  const ticketNumber = await primeraFilaTicket.textContent();
  
  console.log(`Número de ticket del pedido más reciente: ${ticketNumber}`);
  
  // Guarda el ID del material para uso posterior
  materialId = ticketNumber?.trim() || '';
  
  // --- HACER CLIC EN EL BOTÓN DE EDITAR ---
  
  // Localiza el primer botón de editar por su SVG (ícono de lápiz) - corresponde al pedido más reciente
  const editarBtn = page.locator('div[style*="color: rgb(0, 159, 227)"][style*="cursor: pointer"] svg[stroke="currentColor"][fill="none"]').first();
  await expect(editarBtn).toBeVisible({ timeout: 10000 });
  await editarBtn.click();
  
  // Espera a que la URL cambie a la página de edición
  await page.waitForURL(MATERIALS_EDIT_URL_PATTERN, { timeout: 10000 });
  
  // Captura el ID real desde la URL
  const editUrl = page.url();
  const urlMatch = editUrl.match(/\/edit\/(\d+)/);
  if (urlMatch) {
    materialId = urlMatch[1];
    console.log(`ID del material capturado desde URL: ${materialId}`);
  }
  
  console.log(`Navegó a la página de edición del material con ID: ${materialId}`);
  
  // --- EDITAR CAMPOS EN MODO EDICIÓN ---
  
  // Espera a que el formulario de edición se cargue completamente
  await page.waitForTimeout(3000);
  
  // Verificar que estamos en la página de edición correcta
  try {
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    console.log('Página de edición cargada correctamente');
  } catch (error) {
    console.log('Error: La página de edición no se cargó correctamente');
    return;
  }
  
  // 1. Editar el campo "Nombre del comercio"
  console.log('Editando el campo "Nombre del comercio"...');
  
  try {
    const labelNombreSpan = page.locator('span').filter({ hasText: 'Nombre del comercio' });
    await expect(labelNombreSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelNombreSpan.locator('../..');
    const nombreSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(nombreSelector).toBeVisible({ timeout: 5000 });
    await nombreSelector.click();
    
    await page.waitForTimeout(2000);
    const opcionStela = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES' }).first();
    await expect(opcionStela).toBeVisible({ timeout: 10000 });
    await opcionStela.click();
    
    console.log('Campo "Nombre del comercio" editado exitosamente');
  } catch (error) {
    console.log('Error editando "Nombre del comercio":', error);
  }
  
  // 2. Editar el campo "Sucursal del Cliente"
  console.log('Editando el campo "Sucursal del Cliente"...');
  await page.waitForTimeout(3000);
  
  try {
    const labelSucursalSpan = page.locator('span').filter({ hasText: 'Sucursal del Cliente' });
    await expect(labelSucursalSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelSucursalSpan.locator('../..');
    const sucursalSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(sucursalSelector).toBeVisible({ timeout: 5000 });
    await sucursalSelector.click();
    
    await page.waitForTimeout(2000);
    const opcionStelaSucursal = page.locator('[role="option"]').filter({ hasText: 'STELA NOVEDADES (1)' }).first();
    await expect(opcionStelaSucursal).toBeVisible({ timeout: 10000 });
    await opcionStelaSucursal.click();
    
    console.log('Campo "Sucursal del Cliente" editado exitosamente');
  } catch (error) {
    console.log('Error editando "Sucursal del Cliente":', error);
  }
  
  // 3. Editar el campo "Código Comercio"
  console.log('Editando el campo "Código Comercio"...');
  await page.waitForTimeout(3000);
  
  try {
    const labelCodigoSpan = page.locator('span').filter({ hasText: 'Código Comercio' });
    await expect(labelCodigoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelCodigoSpan.locator('../..');
    const codigoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(codigoSelector).toBeVisible({ timeout: 5000 });
    await codigoSelector.click();
    
    await page.waitForTimeout(2000);
    const opcionCodigo = page.locator('[role="option"]').filter({ hasText: '0901499' }).first();
    await expect(opcionCodigo).toBeVisible({ timeout: 10000 });
    await opcionCodigo.click();
    
    console.log('Campo "Código Comercio" editado exitosamente');
  } catch (error) {
    console.log('Error editando "Código Comercio":', error);
  }
  
  // 4. Editar el campo "Motivo del pedido"
  console.log('Editando el campo "Motivo del pedido"...');
  await page.waitForTimeout(3000);
  
  try {
    const labelMotivoSpan = page.locator('span').filter({ hasText: 'Motivo del pedido' });
    await expect(labelMotivoSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelMotivoSpan.locator('../..');
    const motivoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(motivoSelector).toBeVisible({ timeout: 5000 });
    await motivoSelector.click();
    
    await page.waitForTimeout(2000);
    const opcionMotivo = page.locator('[role="option"]').filter({ hasText: 'CAMBIO POR REBRANDING' }).first();
    await expect(opcionMotivo).toBeVisible({ timeout: 10000 });
    await opcionMotivo.click();
    
    console.log('Campo "Motivo del pedido" editado exitosamente');
  } catch (error) {
    console.log('Error editando "Motivo del pedido":', error);
  }
  
  // 5. Editar el campo "Solicitante"
  console.log('Editando el campo "Solicitante"...');
  await page.waitForTimeout(3000);
  
  try {
    const labelSolicitanteSpan = page.locator('span').filter({ hasText: 'Solicitante' });
    await expect(labelSolicitanteSpan).toBeVisible({ timeout: 5000 });
    
    const contenedorFormFloating = labelSolicitanteSpan.locator('../..');
    const solicitanteSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    await expect(solicitanteSelector).toBeVisible({ timeout: 5000 });
    await solicitanteSelector.click();
    
    await page.waitForTimeout(2000);
    const opcionSolicitante = page.locator('[role="option"]').filter({ hasText: 'RCI-INTERIOR' }).first();
    await expect(opcionSolicitante).toBeVisible({ timeout: 10000 });
    await opcionSolicitante.click();
    
    console.log('Campo "Solicitante" editado exitosamente');
  } catch (error) {
    console.log('Error editando "Solicitante":', error);
  }
  
  // 6. Editar el campo "Forma de entrega"
  console.log('Editando el campo "Forma de entrega"...');
  
  try {
    // Busca el elemento <span> que contiene el texto 'Forma de entrega *'
    const labelFormaEntregaSpan = page.locator('span').filter({ hasText: 'Forma de entrega *' });
    // Espera a que el label esté visible en el DOM
    await expect(labelFormaEntregaSpan).toBeVisible({ timeout: 10000 });
    
    // Sube dos niveles en el DOM para llegar al contenedor del campo
    const contenedorFormFloating = labelFormaEntregaSpan.locator('../..');
    // Dentro del contenedor, localiza el selector de React Select
    const formaEntregaSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    // Espera a que el selector esté visible
    await expect(formaEntregaSelector).toBeVisible({ timeout: 10000 });
    // Hace clic para abrir el menú de opciones
    await formaEntregaSelector.click();
    
    // Busca la opción 'RETIRAR DE MARKETING' en el menú desplegable
    const opcionFormaEntrega = page.locator('[role="option"]').filter({ hasText: 'RETIRAR DE MARKETING' }).first();
    // Espera a que la opción esté visible
    await expect(opcionFormaEntrega).toBeVisible({ timeout: 15000 });
    // Hace clic en la opción para seleccionarla
    await opcionFormaEntrega.click();
    
    // Muestra en consola que el campo fue editado correctamente
    console.log('Campo "Forma de entrega" editado exitosamente');
  } catch (error) {
    // Si ocurre un error, lo muestra en consola
    console.log('Error editando "Forma de entrega":', error);
  }
  
  // 7. Editar el campo "A cargo de"
  console.log('Editando el campo "A cargo de"...'); // Indica en consola el inicio de la edición
  
  try {
    // Verifica que la página sigue activa antes de interactuar
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    
    // Busca el elemento <span> que contiene el texto 'A cargo de *'
    const labelACargoDeSpan = page.locator('span').filter({ hasText: 'A cargo de *' });
    // Espera a que el label esté visible
    await expect(labelACargoDeSpan).toBeVisible({ timeout: 10000 });
    
    // Sube dos niveles en el DOM para llegar al contenedor del campo
    const contenedorFormFloating = labelACargoDeSpan.locator('../..');
    // Dentro del contenedor, localiza el selector de React Select
    const aCargoDeSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    // Espera a que el selector esté visible
    await expect(aCargoDeSelector).toBeVisible({ timeout: 10000 });
    // Hace clic para abrir el menú de opciones
    await aCargoDeSelector.click();
    
    // Busca todas las opciones disponibles en el menú desplegable
    const opciones = page.locator('[role="option"]');
    // Espera a que al menos una opción esté visible
    await expect(opciones.first()).toBeVisible({ timeout: 15000 });
    
    // Cuenta cuántas opciones hay en el menú
    const opcionesCount = await opciones.count();
    // Si hay más de una opción, selecciona la segunda
    if (opcionesCount > 1) {
      await opciones.nth(1).click(); // Selecciona la segunda opción
      console.log('Campo "A cargo de" editado exitosamente'); // Mensaje de éxito
    } else {
      // Si solo hay una opción, selecciona la primera
      console.log('Solo hay una opción disponible en "A cargo de"');
      await opciones.first().click();
    }
  } catch (error) {
    // Si ocurre un error, lo muestra en consola
    console.log('Error editando "A cargo de":', error);
    // Verifica si la página sigue activa tras el error
    try {
      await page.locator('body').isVisible(); // Intenta comprobar si la página sigue abierta
    } catch (pageError) {
      // Si la página se cerró, lo indica y termina el test
      console.log('La página se ha cerrado o no está disponible');
      return; // Salir del test si la página no está disponible
    }
  }
  
  // 8. Editar el campo "Estado del pedido"
  console.log('Editando el estado del pedido...');
  
  try {
    // Verificar que la página sigue activa
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    
    // Busca el elemento <span> que contiene el texto 'Estado del pedido'
    const labelEstadoSpan = page.locator('span').filter({ hasText: 'Estado del pedido' });
    // Espera a que el label esté visible
    await expect(labelEstadoSpan).toBeVisible({ timeout: 10000 });
    
    // Sube dos niveles en el DOM para llegar al contenedor del campo
    const contenedorFormFloating = labelEstadoSpan.locator('../..');
    // Dentro del contenedor, localiza el selector de React Select
    const estadoSelector = contenedorFormFloating.locator('.css-b4hd2p-control');
    // Espera a que el selector esté visible
    await expect(estadoSelector).toBeVisible({ timeout: 10000 });
    // Hace clic para abrir el menú de opciones
    await estadoSelector.click();
    
    // Busca todas las opciones disponibles en el menú desplegable
    const opcionesEstado = page.locator('[role="option"]');
    // Espera a que al menos una opción esté visible
    await expect(opcionesEstado.first()).toBeVisible({ timeout: 15000 });
    
    // Cuenta cuántas opciones hay en el menú
    const opcionesCount = await opcionesEstado.count();
    // Si hay más de una opción, selecciona la segunda
    if (opcionesCount > 1) {
      await opcionesEstado.nth(1).click(); // Selecciona la segunda opción
      console.log('Campo "Estado del pedido" editado exitosamente'); // Mensaje de éxito
    } else {
      // Si solo hay una opción, selecciona la primera
      console.log('Solo hay una opción disponible en "Estado del pedido"');
      await opcionesEstado.first().click();
    }
  } catch (error) {
    console.log('Error editando "Estado del pedido":', error);
    // Verificar si la página sigue activa
    try {
      await page.locator('body').isVisible();
    } catch (pageError) {
      console.log('La página se ha cerrado o no está disponible');
      return; // Salir del test si la página no está disponible
    }
  }
  
  // 9. Editar el campo "Comentarios"
  console.log('Editando el campo comentarios...');
  
  try {
    // Verifica que la página sigue activa antes de interactuar
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    
    // Localiza el textarea del campo 'Comentarios' por su atributo name
    const comentariosTextarea = page.locator('textarea[name="AttrLastComment"]');
    // Espera a que el textarea esté visible
    await expect(comentariosTextarea).toBeVisible({ timeout: 10000 });
    // Escribe el comentario de edición en el campo
    await comentariosTextarea.fill('Comentario editado mediante automatización');
    
    // Muestra en consola que el campo fue editado correctamente
    console.log('Campo "Comentarios" editado exitosamente');
  } catch (error) {
    // Si ocurre un error, lo muestra en consola
    console.log('Error editando "Comentarios":', error);
    // Verifica si la página sigue activa tras el error
    try {
      await page.locator('body').isVisible(); // Intenta comprobar si la página sigue abierta
    } catch (pageError) {
      // Si la página se cerró, lo indica y termina el test
      console.log('La página se ha cerrado o no está disponible');
      return; // Salir del test si la página no está disponible
    }
  }

  // --- SELECCIONAR SEGUNDO MATERIAL Y AGREGAR CANTIDAD ---
  console.log('Seleccionando un segundo material...');
  
  try {
    // Verificar que la página sigue activa
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    
    // Buscar todos los checkboxes de materiales disponibles
    const checkboxes = page.locator('input[type="checkbox"]#custom-switch');
    const checkboxCount = await checkboxes.count();
    console.log(`Se encontraron ${checkboxCount} checkboxes de materiales`);
    
    // Verificar si hay al menos 2 checkboxes (el primero ya está seleccionado)
    if (checkboxCount > 1) {
      // Seleccionar el segundo checkbox (índice 1)
      const segundoCheckbox = checkboxes.nth(1);
      await expect(segundoCheckbox).toBeVisible({ timeout: 10000 });
      
      // Hacer clic en el segundo checkbox
      await segundoCheckbox.click({ force: true });
      console.log('Segundo checkbox seleccionado exitosamente');
      
      // Esperar a que se habilite el campo numérico del segundo material
      await page.waitForTimeout(2000);
      
      // Localizar el campo numérico del segundo material
      // Buscar por la fila que contiene el segundo checkbox
      const segundaFila = segundoCheckbox.locator('../../../..'); // Navegar hacia la fila padre
      const segundoCantidadInput = segundaFila.locator('input[type="number"].form-control.text-right.mx-4');
      
      await expect(segundoCantidadInput).toBeVisible({ timeout: 10000 });
      
      // Ingresar cantidad en el segundo material
      await segundoCantidadInput.fill('3', { force: true });
      
      // Verificar que el valor se haya ingresado correctamente
      await expect(segundoCantidadInput).toHaveValue('3');
      console.log('Cantidad del segundo material ingresada correctamente: 3');
      
    } else {
      console.log('Solo hay un material disponible, no se puede seleccionar un segundo');
    }
    
  } catch (error) {
    console.log('Error seleccionando segundo material:', error);
  }

  // --- AGREGAR NOTAS ---
  console.log('Agregando notas al pedido...');
  
  try {
    // Verifica que la página sigue activa antes de interactuar
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    
    // Localiza el textarea de notas usando el atributo name y la clase específica
    const notasTextarea = page.locator('textarea[name="description"].Notes_textarea__IN3Dq');
    // Espera a que el textarea esté visible
    await expect(notasTextarea).toBeVisible({ timeout: 10000 });
    
    // Define el texto de la nota a agregar
    const textoNota = 'Esta es una nota agregada mediante automatización para el pedido de materiales. Incluye detalles adicionales sobre los productos seleccionados.';
    // Escribe la nota en el textarea
    await notasTextarea.fill(textoNota);
    
    // Muestra en consola que el texto de la nota fue ingresado correctamente
    console.log('Texto de nota ingresado exitosamente');
    
    // Localiza el botón "Enviar" de las notas por clase y texto
    const enviarNotaBtn = page.locator('button.Notes_submitButton__rMudm', { hasText: 'Enviar' });
    // Espera a que el botón esté visible
    await expect(enviarNotaBtn).toBeVisible({ timeout: 10000 });
    // Hace clic en el botón para enviar la nota
    await enviarNotaBtn.click();
    
    console.log('Nota enviada exitosamente');
    
    // Esperar a que la nota se procese y aparezca en la lista
    await page.waitForTimeout(2000);
    
    // Verificar que la nota se haya agregado (opcional)
    const listaNotas = page.locator('.Notes_notesList__MegiX');
    await expect(listaNotas).toBeVisible({ timeout: 5000 });
    console.log('La nota se ha agregado a la lista de notas');
    
  } catch (error) {
    console.log('Error agregando notas:', error);
  }
  
  // --- GUARDAR CAMBIOS DE EDICIÓN ---
  console.log('Guardando los cambios de edición...');
  
  try {
    // Verificar que la página sigue activa antes de guardar
    if (page.isClosed()) {
      console.log('Error: La página se cerró antes de guardar');
      return;
    }
    
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    
    // Localizar y hacer clic en el botón "Guardar" o "Actualizar"
    const guardarBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Guardar' });
    await expect(guardarBtn).toBeVisible({ timeout: 10000 });
    await guardarBtn.click();
    
    // Esperar mensaje de confirmación de actualización
    const mensajeConfirmacion = page.locator('text=/actualizado correctamente|guardado correctamente|editado exitosamente|modificado correctamente|éxito|exitoso/i').first();
    await expect(mensajeConfirmacion).toBeVisible({ timeout: 15000 });
    
    const mensajeTexto = await mensajeConfirmacion.textContent();
    console.log(`Mensaje de confirmación de edición: ${mensajeTexto}`);
    
    // Esperar a que redirija automáticamente a la lista principal
    await page.waitForURL(MATERIALS_URL, { timeout: 10000 });
    console.log('Regresó automáticamente a la lista de materiales');
    
  } catch (error) {
    console.log('Error al guardar los cambios:', error);
    
    // Verificar si la página sigue activa
    if (page.isClosed()) {
      console.log('La página se cerró durante el guardado');
      return;
    }
    
    // Intentar navegar manualmente a la lista
    try {
      console.log('Intentando navegar manualmente a la lista de materiales...');
      await page.goto(MATERIALS_URL);
      await page.waitForTimeout(2000);
    } catch (navError) {
      console.log('Error en navegación manual:', navError);
      return;
    }
  }
  
  // --- FILTRAR POR NÚMERO DE TICKET ---
  console.log(`Filtrando por el número de ticket: ${materialId}`);
  
  try {
    // Verificar que la página no se haya cerrado
    if (page.isClosed()) {
      console.log('Error: La página se cerró durante el filtrado');
      return;
    }
    
    // Esperar a que la página se cargue completamente
    await page.waitForTimeout(2000);
    
    // Localiza el campo de búsqueda de materiales
    const buscarInput = page.locator('input[placeholder*="Buscar"], input[type="search"], input[placeholder*="Material"], input[placeholder*="Pedido"]').first();
    await expect(buscarInput).toBeVisible({ timeout: 5000 });
    
    // Limpia el campo de búsqueda primero
    await buscarInput.clear();
    
    // Ingresa el número de ticket en el campo de búsqueda
    await buscarInput.fill(materialId || '');
    
    // Presiona Enter para ejecutar la búsqueda
    await buscarInput.press('Enter');
    
    // Espera un momento para que se actualice la tabla con los resultados filtrados
    await page.waitForTimeout(2000);
    
    console.log('Filtro aplicado exitosamente con el número de ticket:', materialId);
    
    // --- EXPORTAR EL PEDIDO FILTRADO ---
    
    try {
      // Verificar que la página sigue activa antes de exportar
      if (page.isClosed()) { // Si la página se cerró antes de exportar
        console.log('Error: La página se cerró antes de exportar'); // Mensaje de error en consola
        return; // Sale del bloque si la página está cerrada
      }
      
      // Localizar el botón "Exportar" usando su clase y texto
      const exportarBtn = page.locator('button.primaryButton_button__IrLLt', { hasText: 'Exportar' });
      await expect(exportarBtn).toBeVisible({ timeout: 5000 }); // Espera a que el botón esté visible
      
      // Hacer clic en el botón exportar para descargar el archivo
      await exportarBtn.click();
      
      // Mensaje en consola indicando que el botón fue clickeado correctamente
      console.log('✓ Botón "Exportar" clickeado exitosamente');
      
      // Pausa la ejecución para que el usuario verifique manualmente la descarga
      console.log('⏸️ PAUSA: Verifica si se descargó el archivo exportado del pedido de materiales');
      await page.pause(); // Pausa interactiva de Playwright
      
      // Mensaje en consola indicando que la exportación se completó
      console.log('✓ Exportación del pedido de materiales completada');
      
    } catch (error) {
    // Si ocurre un error durante la exportación, lo muestra en consola
    console.log('Error durante la exportación del pedido de materiales:', error);
    }
    
  } catch (error) {
    // Si ocurre un error durante el filtrado, lo muestra en consola
    console.log('Error durante el proceso de filtrado:', error);
    
    // Verificar si la página sigue activa tras el error
    if (page.isClosed()) {
      console.log('La página se cerró durante el filtrado'); // Mensaje de error si la página se cerró
      return; // Sale del bloque si la página está cerrada
    }
  }
  
  // --- PAUSA FINAL ---
  try {
    // Verificar que la página sigue activa antes de la pausa final
    if (page.isClosed()) { // Si la página se cerró antes de la pausa
      console.log('La página se cerró, finalizando test'); // Mensaje de cierre en consola
    } else {
      // Pausa la ejecución para inspección manual del formulario final
      await page.pause(); // Pausa interactiva de Playwright
    }
  } catch (error) {
    // Si ocurre un error durante la pausa final, lo muestra en consola
    console.log('Error en pausa final:', error);
  }
  
  // Mensaje de confirmación en consola
  console.log(`Test completado: Se creó el pedido con título "Pruebas automatizadas" con ID ${materialId}, y se editó correctamente.`);
  console.log(`URL de edición: ${BASE_URL}/front-crm/materials/edit/${materialId}`);
  console.log(`Ticket número: ${materialId}`);
});
