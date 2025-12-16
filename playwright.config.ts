import { defineConfig, devices } from '@playwright/test';

/**
 * CONFIGURACIÓN COMPLETA DE PLAYWRIGHT
 * 
 * 🎥 GRABACIÓN DE VIDEO:
 * - Cambia video: 'retain-on-failure' por 'on' para grabar siempre
 * - Videos se guardan en: test-results/[nombre-test]/video.webm
 * 
 * 📸 EVIDENCIAS:
 * - Screenshots automáticos al fallar: test-results/[nombre-test]/test-failed-*.png
 * - Traces completos (DOM, red, consola): test-results/[nombre-test]/trace.zip
 * 
 * 📋 REPORTES:
 * - HTML report en: playwright-report/index.html
 * - Ejecutar: npm run show-report
 * 
 * 🔧 CODEGEN:
 * - Grabar código: npm run record <URL>
 * - Con Firefox: npm run record:ff <URL>
 * - Con data-testid: npm run record:testid <URL>
 */
export default defineConfig({
  // 🚀 Configuración de ejecución
  testDir: './tests',                    // Directorio de tests
  fullyParallel: true,                   // Ejecutar tests en paralelo
  forbidOnly: !!process.env.CI,         // Evitar .only() en CI
  retries: process.env.CI ? 2 : 1,      // Reintentos: 2 en CI, 1 local
  workers: process.env.CI ? 1 : undefined, // Workers: 1 en CI, auto local
  
  // 📁 Configuración de directorios de output
  outputDir: './debug',                  // Directorio para videos, screenshots y traces
  
  // 📊 Reportes
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }]
  ],
  
  // ⚙️ Configuración global de tests
  use: {
    // 🎥 VIDEO: Cambia a 'on' para grabar siempre, 'retain-on-failure' solo al fallar
    video: 'retain-on-failure',
    
    // 📸 SCREENSHOTS: 'only-on-failure' solo al fallar, 'on' siempre
    screenshot: 'only-on-failure',
    
    // 🔍 TRACE: Timeline completo con DOM, red, consola, almacenamiento
    trace: 'retain-on-failure',          // También disponible: 'on', 'off'
    
    // 🖥️ VIEWPORT: Tamaño de ventana cómodo para videos
    viewport: { width: 1280, height: 720 },
    
    // 🌐 Configuración de navegador
    headless: false,                     // Cambia a true para ejecución sin cabeza
    ignoreHTTPSErrors: true,             // Ignorar errores SSL en desarrollo
    
    // ⏱️ Timeouts
    actionTimeout: 10000,                // 10s para acciones (click, fill, etc.)
    navigationTimeout: 30000,            // 30s para navegación
    
    // 🎯 Estrategia de localización
    testIdAttribute: 'data-testid',      // Atributo para getByTestId()
  },

  // 🖥️ CONFIGURACIÓN DE NAVEGADORES
  projects: [
    {
      name: 'CRM-Bepsa',
      testDir: './tests/CRM-Bepsa',      // Tests específicos de Bepsa
      use: { 
        ...devices['Desktop Chrome'],
        // 🎥 Configuración específica para Bepsa
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
    {
      name: 'CRM-Continental',
      testDir: './tests/CRM-Continental', // Tests específicos de Continental
      use: { 
        ...devices['Desktop Chrome'],
        // 🎥 Configuración específica para Continental
        video: 'retain-on-failure',
        trace: 'retain-on-failure',
      },
    },
    // 🔧 Proyecto para tests generales/ejemplos
    {
      name: 'General',
      testDir: './tests',
      testMatch: ['**/ejemplo-*.spec.ts', '**/mi-flujo*.spec.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        video: 'on', // 🎥 Grabar siempre para ejemplos
        trace: 'on',
      },
    },
    // 🦊 Firefox para comparación cross-browser
    {
      name: 'Firefox',
      testDir: './tests',
      testMatch: ['**/*-ff.spec.ts'],
      use: { 
        ...devices['Desktop Firefox'],
        video: 'retain-on-failure',
      },
    },
  ],

  // 🌐 Servidor web local (opcional)
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
