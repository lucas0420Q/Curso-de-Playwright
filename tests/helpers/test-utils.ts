import { Page } from '@playwright/test';

/**
 * 🛠️ UTILIDADES PARA TESTS DE PLAYWRIGHT
 * 
 * Funciones helper reutilizables para facilitar la escritura de tests
 * y reducir código duplicado.
 */

/**
 * 🎬 Tomar screenshot con nombre personalizado
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  await page.screenshot({ 
    path: `debug/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * 🐛 Tomar screenshot de debug (solo en modo debug)
 */
export async function debugScreenshot(page: Page, stepName: string): Promise<void> {
  if (process.env.DEBUG === 'true') {
    await takeScreenshot(page, `debug-${stepName}`);
  }
}

/**
 * 📹 Iniciar grabación de video personalizada
 */
export async function startDebugVideo(page: Page): Promise<void> {
  // El video se graba automáticamente según la configuración de Playwright
  // Esta función es para compatibilidad futura
  console.log('🎥 Video debug iniciado automáticamente por Playwright');
}

/**
 * 🔍 Capturar información de debug completa
 */
export async function captureDebugInfo(page: Page, testName: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Screenshot
  await page.screenshot({ 
    path: `debug/screenshots/${testName}-full-${timestamp}.png`,
    fullPage: true 
  });
  
  // Información de la página
  const url = page.url();
  const title = await page.title();
  
  console.log(`📊 Debug Info - ${testName}:`);
  console.log(`   URL: ${url}`);
  console.log(`   Title: ${title}`);
  console.log(`   Timestamp: ${timestamp}`);
}

/**
 * ⏱️ Esperar con timeout personalizado
 */
export async function waitForTimeout(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 🔄 Recargar página y esperar estabilidad
 */
export async function reloadAndWait(page: Page): Promise<void> {
  await page.reload({ waitUntil: 'networkidle' });
  await waitForTimeout(1000);
}

/**
 * 🎯 Datos de prueba comunes
 */
export const testData = {
  users: {
    valid: {
      username: '<USUARIO_VALIDO>',
      password: '<PASSWORD_VALIDO>',
      email: 'usuario@ejemplo.com'
    },
    invalid: {
      username: 'usuario_inexistente',
      password: 'password_incorrecto',
      email: 'email_invalido'
    }
  },
  urls: {
    base: '<URL_BASE>',
    login: '<URL_BASE>/login',
    dashboard: '<URL_BASE>/dashboard'
  }
};

/**
 * 🎲 Generar datos aleatorios para tests
 */
export const randomData = {
  string: (length: number = 8): string => {
    return Math.random().toString(36).substring(2, length + 2);
  },
  email: (): string => {
    return `test_${randomData.string(6)}@ejemplo.com`;
  },
  number: (min: number = 1, max: number = 1000): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};