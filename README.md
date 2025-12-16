# 🎭 Playwright - Curso Completo con Grabación de Video y Codegen

## 🚀 Configuración Rápida

### 1. Instalación de dependencias
```bash
npm i -D @playwright/test
npx playwright install --with-deps
```

### 2. Ejecutar tests
```bash
npm test                    # Ejecutar todos los tests
npm run show-report         # Ver reporte HTML con videos
```

### 3. Grabar código automáticamente
```bash
npm run record              # Grabar test en mi-flujo.spec.ts
npm run record:ff           # Grabar con Firefox
npm run record:testid       # Grabar usando data-testid
```

---

## 🎥 Grabación de Video y Evidencias

### 📹 Videos Automáticos
- **Ubicación**: `test-results/[nombre-test]/video.webm`
- **Configuración actual**: Solo se graba al fallar (`'retain-on-failure'`)
- **Para grabar siempre**: Cambiar `video: 'on'` en `playwright.config.ts`

### 📸 Screenshots
- **Automáticos**: Al fallar tests
- **Manuales**: `await page.screenshot({ path: 'captura.png' })`
- **Ubicación**: `test-results/[nombre-test]/test-failed-*.png`

### 🔍 Traces (Timeline completo)
- **Qué incluye**: DOM, red, consola, almacenamiento, acciones
- **Ubicación**: `test-results/[nombre-test]/trace.zip`
- **Ver trace**: Abrir en el reporte HTML o `npx playwright show-trace trace.zip`

---

## 🎯 Codegen - Generación Automática de Código

### Comandos Disponibles

```bash
# 📝 Básico - Graba en tests/mi-flujo.spec.ts
npm run record http://localhost:3000

# 🦊 Con Firefox
npm run record:ff http://localhost:3000

# 🎯 Con data-testid (recomendado)
npm run record:testid http://localhost:3000

# 🔧 Personalizado (reemplaza <nombre> y <url>)
npx playwright codegen --target=playwright-test --output tests/<nombre>.spec.ts --test-id-attribute=data-testid <url>
```

### 🛠️ Herramientas del Codegen

1. **Pick Locator** 🎯: Hacer clic en elementos para obtener selectores
2. **Record** ⏺️: Grabar acciones automáticamente
3. **Assert** ✅: Generar verificaciones de texto/visibilidad
4. **Source** 📝: Ver y editar código generado

---

## 📁 Estructura del Proyecto

```
Curso de Playwright/
├── 📋 tests/
│   ├── 🏢 CRM-Bepsa/          # Tests específicos de Bepsa
│   ├── 🏢 CRM-Continental/    # Tests específicos de Continental
│   ├── 📄 ejemplo-login.spec.ts    # Test ejemplo con mejores prácticas
│   ├── 🔧 helpers/           # Utilidades reutilizables
│   │   └── test-utils.ts
│   └── 📱 pages/             # Page Object Model
│       └── LoginPage.ts
├── 📊 reports/               # Reportes JSON/JUnit
├── 🎬 test-results/          # Videos, traces, screenshots
├── 📋 playwright-report/     # Reporte HTML interactivo
├── ⚙️ playwright.config.ts   # Configuración principal
└── 📦 package.json          # Scripts y dependencias
```

---

## 🎮 Scripts npm Disponibles

| Script | Descripción |
|--------|-------------|
| `npm test` | Ejecutar todos los tests con reporte HTML |
| `npm run test:headed` | Ejecutar con interfaz gráfica visible |
| `npm run test:debug` | Modo debug interactivo |
| `npm run show-report` | Abrir reporte HTML con videos |
| `npm run record` | Grabar código para mi-flujo.spec.ts |
| `npm run record:ff` | Grabar con Firefox |
| `npm run record:testid` | Grabar usando data-testid |
| `npm run install-browsers` | Instalar navegadores de Playwright |

---

## 🎯 Mejores Prácticas para Selectores

### ✅ Recomendados (en orden de preferencia)

```typescript
// 1. 🎯 Por rol (accesibilidad)
page.getByRole('button', { name: 'Login' })
page.getByRole('textbox', { name: 'Email' })

// 2. 🏷️ Por test ID (para elementos únicos)
page.getByTestId('submit-button')
page.getByTestId('user-menu')

// 3. 📝 Por texto visible
page.getByText('Bienvenido')
page.getByLabel('Contraseña')

// 4. 🔗 Por placeholder
page.getByPlaceholder('Ingrese su email')
```

### ❌ Evitar cuando sea posible

```typescript
// CSS selectors frágiles
page.locator('#login-form > div:nth-child(3) > button')

// XPath complejos
page.locator('//div[@class="form"]//button[contains(text(), "Submit")]')
```

---

## 🔧 Configuración Avanzada

### 🎥 Control de Videos

```typescript
// En playwright.config.ts, sección 'use:'

video: 'on',                    // 📹 Grabar siempre
video: 'retain-on-failure',     // 📹 Solo al fallar (por defecto)
video: 'off',                   // 🚫 No grabar
```

### 📸 Control de Screenshots

```typescript
screenshot: 'on',               // 📸 Siempre
screenshot: 'only-on-failure',  // 📸 Solo al fallar (por defecto)
screenshot: 'off',              // 🚫 No capturar
```

### 🔍 Control de Traces

```typescript
trace: 'on',                    // 🔍 Siempre
trace: 'retain-on-failure',     // 🔍 Solo al fallar (por defecto)
trace: 'off',                   // 🚫 No generar
```

---

## 🐛 Debugging y Desarrollo

### 🔍 Modo Debug Interactivo
```bash
npx playwright test --debug ejemplo-login.spec.ts
```

### ⏸️ Pausar ejecución en el código
```typescript
await page.pause(); // Abre inspector de Playwright
```

### 📝 Logs personalizados
```typescript
console.log('🔍 Estado actual:', await page.title());
test.info().attach('screenshot', { body: await page.screenshot() });
```

### 🎯 Selector playground
```bash
npx playwright codegen http://localhost:3000
# Usar "Pick Locator" para obtener selectores óptimos
```

---

## 🌍 CI/CD - Integración Continua

### GitHub Actions ejemplo
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test

- name: Upload report
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

### 💡 Configuración para CI
- Videos: `'retain-on-failure'` o `'off'` (ahorrar espacio)
- Workers: `1` (evitar conflictos)
- Retries: `2` (reintentos automáticos)

---

## 🎭 Proyectos Configurados

### 🏢 CRM-Bepsa
- **Directorio**: `tests/CRM-Bepsa/`
- **Navegador**: Chrome
- **Videos**: Solo al fallar

### 🏢 CRM-Continental  
- **Directorio**: `tests/CRM-Continental/`
- **Navegador**: Chrome  
- **Videos**: Solo al fallar

### 🎯 General (Ejemplos)
- **Archivos**: `ejemplo-*.spec.ts`, `mi-flujo*.spec.ts`
- **Videos**: Siempre activados
- **Propósito**: Aprendizaje y demos

### 🦊 Firefox
- **Archivos**: `*-ff.spec.ts`
- **Navegador**: Firefox
- **Propósito**: Pruebas cross-browser

---

## 📚 Recursos Útiles

- 📖 [Documentación Oficial](https://playwright.dev)
- 🎓 [Best Practices](https://playwright.dev/docs/best-practices)
- 🔧 [Configuración Avanzada](https://playwright.dev/docs/test-configuration)
- 🎯 [Locators Modernos](https://playwright.dev/docs/locators)
- 🎬 [Traces y Debug](https://playwright.dev/docs/trace-viewer)

---

## 🚀 Primeros Pasos

1. **Instalar dependencias**:
   ```bash
   npm i -D @playwright/test
   npx playwright install --with-deps
   ```

2. **Grabar tu primer test**:
   ```bash
   npm run record:testid http://localhost:3000
   ```

3. **Ejecutar y ver resultados**:
   ```bash
   npm test
   npm run show-report
   ```

4. **Explorar el reporte HTML** para ver videos y traces

¡Ya tienes todo configurado para crear tests robustos con Playwright! 🎉