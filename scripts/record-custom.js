#!/usr/bin/env node

/**
 * 🎬 SCRIPT PERSONALIZADO DE GRABACIÓN
 * 
 * Facilita la creación de tests personalizados con codegen
 * 
 * Uso:
 * node scripts/record-custom.js <nombre-del-test> <url>
 * 
 * Ejemplo:
 * node scripts/record-custom.js login-flow http://localhost:3000
 * 
 * Resultado: tests/login-flow.spec.ts
 */

const { spawn } = require('child_process');
const path = require('path');

const [,, testName, url] = process.argv;

if (!testName || !url) {
  console.log('❌ Error: Faltan parámetros');
  console.log('');
  console.log('📝 Uso:');
  console.log('  node scripts/record-custom.js <nombre-del-test> <url>');
  console.log('');
  console.log('🎯 Ejemplos:');
  console.log('  node scripts/record-custom.js login-flow http://localhost:3000');
  console.log('  node scripts/record-custom.js crud-usuarios http://localhost:3000/users');
  console.log('  node scripts/record-custom.js checkout-proceso https://mi-tienda.com');
  process.exit(1);
}

const outputPath = `tests/${testName}.spec.ts`;

console.log('🎬 Iniciando grabación de test personalizado...');
console.log(`📝 Nombre: ${testName}`);
console.log(`🌐 URL: ${url}`);
console.log(`📁 Archivo de salida: ${outputPath}`);
console.log('');
console.log('💡 Instrucciones:');
console.log('1. Realiza las acciones que quieres automatizar');
console.log('2. Usa "Pick Locator" para seleccionar elementos');
console.log('3. Usa "Assert" para agregar verificaciones');
console.log('4. Cierra la ventana cuando termines');
console.log('');

const args = [
  'codegen',
  '--target=playwright-test',
  `--output=${outputPath}`,
  '--test-id-attribute=data-testid',
  url
];

const child = spawn('npx', ['playwright', ...args], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('');
    console.log('✅ Test grabado exitosamente!');
    console.log(`📁 Archivo creado: ${outputPath}`);
    console.log('');
    console.log('🎯 Próximos pasos:');
    console.log(`1. Revisar y editar: code ${outputPath}`);
    console.log(`2. Ejecutar test: npx playwright test ${outputPath}`);
    console.log(`3. Ver con interfaz: npx playwright test ${outputPath} --headed`);
    console.log(`4. Modo debug: npx playwright test ${outputPath} --debug`);
  } else {
    console.log('❌ Error durante la grabación');
  }
});

child.on('error', (err) => {
  console.error('❌ Error al ejecutar codegen:', err.message);
  console.log('');
  console.log('💡 Asegúrate de tener Playwright instalado:');
  console.log('  npm i -D @playwright/test');
  console.log('  npx playwright install --with-deps');
});