# 📹 **EJEMPLO COMPLETO: Flujo de Grabación y Mapeo Automático**

## 🎬 **1. PROCESO DE EJECUCIÓN DEL TEST**

### **Comando de Ejecución**
```bash
# Ejecutar con debug y grabación activada
$env:DEBUG="true"; npx playwright test tests/CRM-Continental/mi-flujo-continental.spec.ts --headed --reporter=html
```

### **Salida en Consola (Logs del Test)**
```console
PS C:\Users\lucas.zaracho\Curso de Playwright> $env:DEBUG="true"; npx playwright test tests/CRM-Continental/mi-flujo-continental.spec.ts --headed --reporter=html

Running 2 tests using 2 workers

🚀 Iniciando flujo completo de Continental CRM
🔐 Fase 1: Autenticación
✅ Login exitoso
📝 Fase 2: Creación de caso
👥 Seleccionando tipo de persona...
✅ Persona Jurídica seleccionada
🏢 Seleccionando empresa...
✅ Empresa seleccionada
📊 Configurando clasificación...
✅ Clasificación configurada
📋 Completando información del caso...
🔧 Configurando área de resolución...
✅ Seleccionado: PAGO A PROVEEDORES
✅ Seleccionado: PLD
✅ Información del caso completada
💾 Guardando caso...
✅ Caso guardado
✏️ Fase 3: Editando caso recién creado
🔍 Buscando botón de editar...
✅ Tabla encontrada
📍 Íconos de editar encontrados: 1
🎯 Intentando hacer clic en PRIMER ícono de editar...
✅ Click realizado en el primer botón de editar
🔄 Modificando clasificación del caso...
✅ Caso modificado
💡 Agregando solución al caso...
✅ Solución agregada
📝 Fase 4: Gestión de notas
✅ Notas creadas
✏️ Editando última nota...
✅ Nota editada
🏁 Finalizando flujo...
🎉 FLUJO COMPLETADO EXITOSAMENTE
✅ Resumen:
   - Caso creado con información completa
   - Caso editado y clasificación modificada
   - Solución agregada
   - Dos notas creadas
   - Última nota editada
```

## 📁 **2. ARCHIVOS GENERADOS AUTOMÁTICAMENTE**

### **Estructura de Carpetas Debug**
```
debug/
├── mi-flujo-continental-✅-Con-8519e-itar-caso-y-gestionar-notas-CRM-Continental/
│   ├── 📹 video.webm              # Video completo de la ejecución
│   ├── 📸 test-failed-1.png       # Screenshot al fallar
│   ├── 📋 trace.zip               # Trace completo (DOM, red, consola)
│   └── 📄 error-context.md        # Contexto del error
├── CRM-Continental-mi-flujo-c-d064b-itar-caso-y-gestionar-notas-General/
│   ├── 📹 video.webm
│   ├── 📸 test-failed-1.png
│   └── 📋 trace.zip
└── .last-run.json                 # Información de última ejecución
```

### **Detalles de cada Archivo**

#### 🎥 **video.webm**
- **Contenido**: Grabación completa de la ejecución del test
- **Formato**: WebM (optimizado para navegadores)
- **Calidad**: 1280x720px (HD)
- **Duración**: Tiempo real de ejecución del test
- **Uso**: Revisar visualmente qué pasó durante el test

#### 📸 **test-failed-1.png** 
- **Contenido**: Captura de pantalla del momento exacto del fallo
- **Formato**: PNG (alta calidad)
- **Tipo**: Página completa (fullPage: true)
- **Timestamp**: Incluido en el nombre del archivo
- **Uso**: Diagnóstico rápido de errores visuales

#### 📋 **trace.zip**
- **Contenido**: Trace completo de la ejecución
- **Incluye**: 
  - Timeline de acciones
  - Estado del DOM
  - Tráfico de red
  - Logs de consola
  - Screenshots paso a paso
  - Información de elementos
- **Uso**: Análisis profundo de errores

#### 📄 **error-context.md**
- **Contenido**: Contexto detallado del error
- **Información**:
  - Stack trace completo
  - Línea exacta del error
  - Parámetros de la acción fallida
  - Estado de los localizadores

## 🔍 **3. ANÁLISIS DEL TRACE**

### **Comando para Abrir Trace**
```bash
npx playwright show-trace debug\mi-flujo-continental-✅-Con-8519e-itar-caso-y-gestionar-notas-CRM-Continental\trace.zip
```

### **Información Disponible en el Trace**
- ✅ **Timeline Visual**: Cada acción marcada cronológicamente
- ✅ **Screenshots Automáticos**: Captura antes/después de cada acción
- ✅ **Inspección de DOM**: Estado completo en cada momento
- ✅ **Network Logs**: Todas las peticiones HTTP/AJAX
- ✅ **Console Logs**: Logs y errores de JavaScript
- ✅ **Source Code**: Código del test con líneas ejecutadas
- ✅ **Call Stack**: Stack de llamadas cuando ocurre error

## 📊 **4. REPORTE HTML INTERACTIVO**

### **Comando para Abrir Reporte**
```bash
npx playwright show-report
```

### **Contenido del Reporte HTML**
- 📈 **Dashboard de Resultados**: Resumen de tests pasados/fallidos
- 🎯 **Detalles por Test**: Información específica de cada test
- 📹 **Videos Embebidos**: Reproducción directa en el navegador
- 📸 **Screenshots Interactivos**: Galería de capturas
- 🔍 **Traces Integrados**: Análisis directo desde el reporte
- 📊 **Métricas de Rendimiento**: Tiempos de ejecución
- 🏷️ **Filtros Avanzados**: Por proyecto, estado, duración

## 🎬 **5. EJEMPLO DE CODEGEN (GRABACIÓN DE MAPEO)**

### **Comando de Grabación**
```bash
# Grabación básica
npm run record:continental

# Equivale a:
playwright codegen --test-id-attribute=data-testid --target=playwright-test --output tests/CRM-Continental/mi-flujo-continental.spec.ts http://localhost:3000/cases
```

### **Proceso de Grabación**
1. **Abrir Browser**: Se abre Chromium con inspector
2. **Navegación Manual**: Usuario realiza acciones manualmente
3. **Código Generado**: Playwright genera código automáticamente
4. **Selectores Inteligentes**: Usa data-testid, roles, texto
5. **Assertions**: Genera verificaciones automáticas

### **Código Generado Ejemplo**
```typescript
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@clt.com.py');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button', { name: 'Crear Caso' }).click();
  await page.getByRole('button', { name: 'Persona Jurídica' }).click();
  await page.locator('#companyId').selectOption('1');
  await expect(page.locator('#subject')).toBeVisible();
});
```

## 📱 **6. DIFERENTES TIPOS DE SALIDA**

### **Modo Headed (Visual)**
```bash
npx playwright test --headed
```
- ✅ **Ventana Visible**: Se ve la ejecución en tiempo real
- ✅ **Debugging Visual**: Perfecto para desarrollo
- ✅ **Velocidad Real**: Ejecución a velocidad normal

### **Modo Headless (Servidor)**
```bash
npx playwright test
```
- ✅ **Sin Interfaz**: Más rápido para CI/CD
- ✅ **Recursos Mínimos**: Menos uso de memoria
- ✅ **Background**: No interfiere con otras tareas

### **Modo Debug Interactivo**
```bash
npx playwright test --debug
```
- ✅ **Pausa Automática**: Se detiene en cada paso
- ✅ **Inspector Visual**: Herramientas de debugging
- ✅ **Ejecución Manual**: Control paso a paso

## 🔧 **7. CONFIGURACIÓN DE GRABACIÓN**

### **Configuración en playwright.config.ts**
```typescript
export default defineConfig({
  use: {
    // 🎥 Configuración de video
    video: 'retain-on-failure',          // Solo graba al fallar
    // video: 'on',                      // Graba siempre
    
    // 📸 Configuración de screenshots  
    screenshot: 'only-on-failure',       // Solo captura al fallar
    // screenshot: 'on',                 // Captura siempre
    
    // 🔍 Configuración de trace
    trace: 'retain-on-failure',          // Solo trace al fallar
    // trace: 'on',                      // Trace siempre
    
    // 📁 Carpeta de salida
    outputDir: './debug',                // Carpeta organizada
  },
});
```

### **Configuración por Proyecto**
```typescript
projects: [
  {
    name: 'CRM-Continental',
    use: { 
      video: 'retain-on-failure',        // Solo al fallar
      trace: 'retain-on-failure',
    },
  },
  {
    name: 'General',
    use: { 
      video: 'on',                       // Siempre graba
      trace: 'on',                       // Siempre trace
    },
  }
]
```

## 💡 **8. MEJORES PRÁCTICAS**

### **Para Grabación de Video**
✅ **Usar viewport consistente**: `{ width: 1280, height: 720 }`  
✅ **Headless: false**: Para mejor calidad de video  
✅ **Timeouts apropiados**: Evitar videos muy largos  
✅ **Logging detallado**: Para correlacionar con video  

### **Para Mapeo Automático (Codegen)**
✅ **Usar data-testid**: `--test-id-attribute=data-testid`  
✅ **Acciones lentas**: Dar tiempo al codegen para detectar  
✅ **Assertions explícitas**: Usar "Assert" en el inspector  
✅ **URLs específicas**: Comenzar en la página exacta  

### **Para Debugging**
✅ **Screenshots manuales**: En puntos críticos  
✅ **Logs descriptivos**: Console.log detallado  
✅ **Trace completo**: Para análisis post-mortem  
✅ **Carpeta organizada**: Fácil acceso a evidencias  

## 🎯 **RESUMEN DE BENEFICIOS**

### **🎥 Grabación Automática**
- **Video completo** de cada ejecución
- **Screenshots** automáticos en fallos  
- **Evidencia visual** para reportes
- **Debugging** más eficiente

### **🗺️ Mapeo Automático**  
- **Generación de código** sin programar
- **Selectores robustos** automáticamente
- **Assertions** inteligentes
- **Flujos complejos** en minutos

### **🔍 Análisis Profundo**
- **Trace interactivo** con timeline
- **Estado completo** del DOM
- **Network logs** detallados  
- **Debugging** paso a paso

### **📋 Reportes Profesionales**
- **HTML interactivo** con evidencias
- **Videos embebidos** directamente
- **Métricas** de rendimiento
- **Filtros avanzados** por criterios