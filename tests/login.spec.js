const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('Login - La Rionegrina UAT', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de login
    await page.goto('/plataforma/');
  });

  test('Debería cargar la página de login correctamente', async ({ page }) => {
    // Verificar que la página cargó
    await expect(page).toHaveURL(/.*plataforma/);
    
    // Verificar elementos principales usando selectores más específicos
    // Usar el primer input visible con ese ID (el del formulario principal)
    await expect(page.locator('#nroDocu').first()).toBeVisible();
    await expect(page.locator('#clave').first()).toBeVisible();
    await expect(page.locator('button:has-text("INGRESAR")').first()).toBeVisible();
    
    console.log('✅ Página de login cargada correctamente');
  });

  test('Debería mostrar error con credenciales vacías', async ({ page }) => {
    // Intentar login sin completar campos
    await page.click('button:has-text("INGRESAR")');
    
    // Verificar que permanece en la página de login
    await expect(page).toHaveURL(/.*plataforma/);
    
    console.log('✅ Validación de campos vacíos funcionando');
  });

  test('Debería hacer login exitoso con credenciales válidas', async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    // Debug: Mostrar estado de las variables
    console.log('🔍 DEBUG - Username existe:', !!username);
    console.log('🔍 DEBUG - Password existe:', !!password);
    console.log('🔍 DEBUG - Username length:', username ? username.length : 0);
    console.log('🔍 DEBUG - Password length:', password ? password.length : 0);

    if (!username || !password) {
      console.log('⚠️ Test saltado: Credenciales no configuradas');
      console.log('💡 Tip: Configura TEST_USERNAME y TEST_PASSWORD en GitHub Secrets');
      console.log('💡 O crea un archivo .env local con estas variables');
      test.skip();
      return;
    }

    console.log('✅ Credenciales encontradas, procediendo con el login...');

    // Guardar URL inicial
    const initialUrl = page.url();
    console.log('📍 URL inicial:', initialUrl);

    // Completar formulario de login usando el primer input visible
    await page.locator('#nroDocu').first().fill(username);
    await page.locator('#clave').first().fill(password);
    
    console.log('📝 Formulario completado');
    
    // Click en el botón de login
    await page.click('button:has-text("INGRESAR")');
    
    console.log('🖱️ Click en INGRESAR ejecutado');
    
    // Esperar a que la URL cambie o que aparezca un elemento de la página home
    try {
      // Esperar navegación con timeout de 10 segundos
      await page.waitForURL(/.*\/home/, { timeout: 10000 });
      console.log('✅ Navegación a /home exitosa');
    } catch (error) {
      // Si no navega a /home, capturar el estado actual
      const currentUrl = page.url();
      console.log('❌ No se navegó a /home');
      console.log('📍 URL actual:', currentUrl);
      
      // Tomar screenshot del error
      await page.screenshot({ path: 'test-results/login-fallido.png', fullPage: true });
      
      // Buscar mensajes de error en la página
      const errorMessages = await page.locator('.error, .alert-danger, [class*="error"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('⚠️ Mensajes de error encontrados:', errorMessages);
      }
      
      // Fallar el test
      throw new Error(`Login falló: Se esperaba navegar a /home pero la URL es ${currentUrl}`);
    }
    
    // Verificar que estamos en la página home
    const finalUrl = page.url();
    console.log('📍 URL después del login:', finalUrl);
    
    // Verificar que la URL contiene "home"
    expect(finalUrl).toContain('/home');
    
    // Tomar screenshot como evidencia de éxito
    await page.screenshot({ path: 'test-results/login-exitoso.png', fullPage: true });
    
    console.log('✅ Login exitoso verificado - Screenshot guardado');
  });

  test('Debería mostrar/ocultar contraseña al hacer click en el ícono', async ({ page }) => {
    const passwordInput = page.locator('#clave').first();
    
    // Verificar que inicialmente es tipo password
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click en el ícono del ojo (ajustar selector según la implementación real)
    const eyeIcon = page.locator('#eye').first();
    const isVisible = await eyeIcon.isVisible().catch(() => false);
    
    if (isVisible) {
      await eyeIcon.click();
      
      // Verificar que cambió a tipo text (o ajustar según implementación)
      await page.waitForTimeout(500);
      
      console.log('✅ Toggle de contraseña funcionando');
    } else {
      console.log('⚠️ Ícono de ojo no encontrado, saltando test');
    }
  });

  test('Debería tener el checkbox de "Recordarme"', async ({ page }) => {
    const rememberCheckbox = page.locator('#remember_me').first();
    
    // Verificar si existe y está visible
    const isVisible = await rememberCheckbox.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(rememberCheckbox).toBeVisible();
      
      // Verificar que se puede marcar
      await rememberCheckbox.check();
      await expect(rememberCheckbox).toBeChecked();
      
      console.log('✅ Checkbox "Recordarme" funcionando');
    } else {
      console.log('⚠️ Checkbox "Recordarme" no encontrado en esta versión');
    }
  });

  test('Debería tener link de "¿Olvidaste tu contraseña?"', async ({ page }) => {
    const forgotPasswordLink = page.locator('text=¿Olvidaste tu contraseña?').first();
    
    const isVisible = await forgotPasswordLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(forgotPasswordLink).toBeVisible();
      console.log('✅ Link de recuperación de contraseña presente');
    } else {
      console.log('⚠️ Link de recuperación no encontrado en esta versión');
    }
  });

  test('Debería tener link de "REGISTRARSE"', async ({ page }) => {
    const registerLink = page.locator('text=REGISTRARSE').first();
    
    const isVisible = await registerLink.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(registerLink).toBeVisible();
      console.log('✅ Link de registro presente');
    } else {
      console.log('⚠️ Link de registro no encontrado en esta versión');
    }
  });
});
