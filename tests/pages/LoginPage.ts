import { Page, Locator, expect } from '@playwright/test';

/**
 * 🎯 PAGE OBJECT MODEL - LOGIN PAGE
 * 
 * Este patrón encapsula elementos y acciones de una página específica,
 * facilitando mantenimiento y reutilización en múltiples tests.
 * 
 * 💡 BENEFICIOS:
 * - Centralizar selectores en un solo lugar
 * - Reutilizar lógica entre tests
 * - Facilitar mantenimiento ante cambios en UI
 * - Mejorar legibilidad de tests
 * 
 * 🔧 USO:
 * ```typescript
 * const loginPage = new LoginPage(page);
 * await loginPage.goto();
 * await loginPage.login('usuario', 'password');
 * await loginPage.expectLoginSuccess();
 * ```
 */
export class LoginPage {
  readonly page: Page;
  
  // 🎯 SELECTORES - Locators modernos de Playwright
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly successIndicator: Locator;
  
  // 🌐 URLs y configuración
  private readonly baseUrl = '<URL_BASE>';
  private readonly loginPath = '/login';

  constructor(page: Page) {
    this.page = page;
    
    // 💡 SELECTORES MODERNOS: Preferir getByRole, getByTestId, getByText
    
    // Campos de entrada - usar getByRole para accesibilidad
    this.usernameInput = page.getByRole('textbox', { name: /usuario|email|user/i });
    this.passwordInput = page.getByRole('textbox', { name: /contraseña|password/i });
    
    // Botones - getByRole es más semántico
    this.loginButton = page.getByRole('button', { name: /entrar|login|sign in/i });
    
    // Mensajes y estados - combinar estrategias según disponibilidad
    this.errorMessage = page.getByText(/error|incorrecto|inválido|credenciales/i);
    this.successIndicator = page.getByText(/bienvenido|welcome|dashboard|panel/i);
    
    // 🔧 ALTERNATIVAS con data-testid (recomendado para elementos únicos):
    // this.usernameInput = page.getByTestId('username-input');
    // this.passwordInput = page.getByTestId('password-input');
    // this.loginButton = page.getByTestId('login-button');
    // this.errorMessage = page.getByTestId('error-message');
    
    // 🔧 ALTERNATIVAS con CSS selector (última opción):
    // this.usernameInput = page.locator('#username');
    // this.passwordInput = page.locator('#password');
    // this.loginButton = page.locator('button[type="submit"]');
  }

  /**
   * 🌐 Navegar a la página de login
   */
  async goto(): Promise<void> {
    await this.page.goto(`${this.baseUrl}${this.loginPath}`);
    
    // ✅ Verificar que llegamos a la página correcta
    await expect(this.page).toHaveTitle(/login|sign in|iniciar sesión/i);
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * 🔑 Realizar login completo
   * @param username - Nombre de usuario o email
   * @param password - Contraseña
   */
  async login(username: string, password: string): Promise<void> {
    console.log(`🔑 Iniciando sesión como: ${username}`);
    
    // Completar campos
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    // Enviar formulario
    await this.loginButton.click();
    
    // Esperar que se procese el login
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 🔑 Login solo con username (para tests de validación)
   */
  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  /**
   * 🔑 Login solo con password (para tests de validación)
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * 🚀 Hacer clic en botón de login sin completar campos
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * ✅ Verificar login exitoso
   */
  async expectLoginSuccess(): Promise<void> {
    // Verificar URL de redirección
    await expect(this.page).toHaveURL(/dashboard|home|inicio|main/);
    
    // Verificar indicador visual de sesión activa
    await expect(this.successIndicator).toBeVisible();
    
    console.log('✅ Login exitoso verificado');
  }

  /**
   * ❌ Verificar login fallido
   */
  async expectLoginFailure(): Promise<void> {
    // Verificar que permanecemos en login
    await expect(this.page).toHaveURL(new RegExp(this.loginPath));
    
    // Verificar mensaje de error
    await expect(this.errorMessage).toBeVisible();
    
    console.log('❌ Error de login verificado');
  }

  /**
   * 📝 Verificar validaciones de campos requeridos
   */
  async expectRequiredFieldValidation(): Promise<void> {
    // Verificar atributos HTML5
    await expect(this.usernameInput).toHaveAttribute('required');
    await expect(this.passwordInput).toHaveAttribute('required');
    
    // 💡 Si hay validaciones custom, agregar aquí:
    // await expect(this.page.getByText(/campo requerido/i)).toBeVisible();
    
    console.log('📝 Validaciones de campos verificadas');
  }

  /**
   * 🔍 Obtener texto del mensaje de error actual
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * 🎯 Verificar que la página está lista para interacción
   */
  async waitForPageReady(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
  }

  /**
   * 🧹 Limpiar formulario
   */
  async clearForm(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }
}

/**
 * 🎯 EJEMPLO DE USO EN TESTS:
 * 
 * ```typescript
 * import { test, expect } from '@playwright/test';
 * import { LoginPage } from './pages/LoginPage';
 * 
 * test('Login exitoso', async ({ page }) => {
 *   const loginPage = new LoginPage(page);
 *   
 *   await loginPage.goto();
 *   await loginPage.login('usuario_valido', 'password_correcto');
 *   await loginPage.expectLoginSuccess();
 * });
 * 
 * test('Login fallido', async ({ page }) => {
 *   const loginPage = new LoginPage(page);
 *   
 *   await loginPage.goto();
 *   await loginPage.login('usuario_invalido', 'password_incorrecto');
 *   await loginPage.expectLoginFailure();
 * });
 * ```
 * 
 * 🔧 EXTENSIONES SUGERIDAS:
 * 
 * 1. 🏠 HomePage.ts - Para la página principal post-login
 * 2. 📝 FormPage.ts - Para formularios complejos
 * 3. 🧭 BasePage.ts - Clase base con funcionalidad común
 * 4. 🗂️ PageFactory.ts - Factory pattern para crear páginas
 * 
 * 💡 MEJORES PRÁCTICAS:
 * 
 * - Usar getByRole cuando sea posible (accesibilidad)
 * - getByTestId para elementos únicos y complejos
 * - Encapsular esperas en métodos del POM
 * - Incluir validaciones en métodos de acción
 * - Mantener selectores DRY (Don't Repeat Yourself)
 */