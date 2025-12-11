const { test, expect } = require('@playwright/test');
require('dotenv').config();

test.describe('Emisión de Cupones - Quiniela Tradicional - La Rionegrina UAT', () => {
  
  test.beforeEach(async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
      test.skip();
      console.log('⚠️ Test saltado: Credenciales no configuradas');
      return;
    }

    // Navegar a la plataforma
    await page.goto('/plataforma/');
    
    console.log('🔐 Iniciando sesión...');
    
    // Hacer login
    await page.locator('#nroDocu').first().fill(username);
    await page.locator('#clave').first().fill(password);
    await page.click('button:has-text("INGRESAR")');
    
    // Esperar navegación a /home
    await page.waitForURL(/.*\/home/, { timeout: 10000 });
    
    console.log('✅ Login exitoso - En pantalla de juegos');
  });

  test('1. Debería estar en la pantalla de juegos (/home)', async ({ page }) => {
    // Verificar que estamos en /plataforma/home
    await expect(page).toHaveURL(/.*\/plataforma\/home/);
    
    const currentUrl = page.url();
    console.log('📍 URL actual:', currentUrl);
    
    // Tomar screenshot de la interfaz de juegos
    await page.screenshot({ path: 'test-results/01-pantalla-juegos.png', fullPage: true });
    
    console.log('✅ Verificación exitosa - Pantalla de juegos');
  });

  test('2. Debería completar el flujo completo de Quiniela Tradicional', async ({ page }) => {
    // Paso 1: Verificar que estamos en /home
    await expect(page).toHaveURL(/.*\/plataforma\/home/);
    console.log('✅ Paso 1: En pantalla de juegos');
    await page.screenshot({ path: 'test-results/quiniela-01-home.png', fullPage: true });

    // Paso 2: Click en botón Quiniela Tradicional
    console.log('🖱️ Paso 2: Buscando botón Quiniela Tradicional...');
    // HTML: <div class="sc-jHcXXw lkkECO">Quiniela tradicional</div> dentro de un row
    const quinielaButton = page.locator('div.sc-jHcXXw:has-text("Quiniela tradicional"), div.row:has-text("Quiniela tradicional")').first();
    await quinielaButton.waitFor({ state: 'visible', timeout: 5000 });
    await quinielaButton.click();
    console.log('✅ Click en Quiniela Tradicional ejecutado');

    // Paso 3: Verificar navegación a /juego/Quinielatradicional
    await page.waitForURL(/.*\/juego\/Quinielatradicional/i, { timeout: 10000 });
    console.log('✅ Paso 3: Navegación a pantalla de sorteos exitosa');
    
    // ⭐ CLAVE: Esperar a que el iframe cargue completamente
    console.log('⏳ Esperando carga del iframe #zonaJuego...');
    await page.waitForSelector('iframe#zonaJuego', { state: 'attached', timeout: 10000 });
    await page.waitForTimeout(3000); // Dar tiempo adicional para que cargue el contenido interno
    
    await page.screenshot({ path: 'test-results/quiniela-02-sorteos.png', fullPage: true });

    // 🔍 DIAGNÓSTICO DE IFRAMES (útil para debugging)
    console.log('🔍 Diagnóstico de iframes:');
    const frames = page.frames();
    console.log(`📦 Total de iframes encontrados: ${frames.length}`);
    
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const url = frame.url();
      console.log(`  🔹 Iframe ${i}: ${url}`);
      
      // Verificar si contiene "tombola" (el iframe que buscamos)
      if (url.includes('tombola')) {
        console.log(`  ✅ Iframe de tombola encontrado en posición ${i}`);
      }
    }

    // Paso 4: Click en sorteo Nocturna DENTRO DEL IFRAME
    console.log('🖱️ Paso 4: Seleccionando sorteo Nocturna dentro del iframe...');
    
    // ⭐ CLAVE: Usar frameLocator para acceder al iframe
    const iframe = page.frameLocator('iframe#zonaJuego');
    
    // Buscar el h6 con clase fontDescEve que contiene "Nocturna"
    const nocturnaH6 = iframe.locator('h6.fontDescEve:has-text("Nocturna")').first();
    await nocturnaH6.waitFor({ state: 'visible', timeout: 5000 });
    await nocturnaH6.click();
    console.log('✅ Sorteo Nocturna seleccionado');
    
    // Esperar que se abra la pantalla de carga de datos
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/quiniela-03-carga-datos.png', fullPage: true });

    // ⭐ IMPORTANTE: Los pasos 5-11 también están dentro del iframe
    console.log('📍 Todos los siguientes pasos se ejecutan dentro del iframe #zonaJuego');

    // Paso 5: Completar campo Número con número aleatorio 0-99 (DENTRO DEL IFRAME)
    const numeroAleatorio = Math.floor(Math.random() * 100);
    console.log('🎲 Paso 5: Número aleatorio generado:', numeroAleatorio);
    
    // Buscar el input asociado al label "Numero" dentro del iframe
    const campoNumero = iframe.locator('label.bet-label:has-text("Numero")').locator('..').locator('input').first();
    await campoNumero.waitFor({ state: 'visible', timeout: 5000 });
    await campoNumero.fill(numeroAleatorio.toString());
    console.log('✅ Campo Número completado:', numeroAleatorio);

    // Paso 6: Completar campo Alcance con 10 (DENTRO DEL IFRAME)
    console.log('📝 Paso 6: Completando campo Alcance...');
    const campoAlcance = iframe.locator('label.bet-label:has-text("Alcance")').locator('..').locator('input').first();
    await campoAlcance.waitFor({ state: 'visible', timeout: 5000 });
    await campoAlcance.fill('10');
    console.log('✅ Campo Alcance completado: 10');

    // Paso 7: Completar campo Importe con 200 (DENTRO DEL IFRAME)
    console.log('💰 Paso 7: Completando campo Importe...');
    const campoImporte = iframe.locator('label.bet-label:has-text("Importe")').locator('..').locator('input').first();
    await campoImporte.waitFor({ state: 'visible', timeout: 5000 });
    await campoImporte.fill('200');
    console.log('✅ Campo Importe completado: 200');

    await page.screenshot({ path: 'test-results/quiniela-04-datos-completados.png', fullPage: true });

    // Paso 8: Click en botón + (DENTRO DEL IFRAME)
    console.log('🖱️ Paso 8: Click en botón +...');
    // HTML: <button id="btn-addJugada" class="btn boton-sm change">...</button>
    const botonMas = iframe.locator('button#btn-addJugada').first();
    await botonMas.waitFor({ state: 'visible', timeout: 5000 });
    await botonMas.click();
    console.log('✅ Click en botón + ejecutado');
    
    await page.waitForTimeout(1000);

    // Paso 9: Click en botón Siguiente (DENTRO DEL IFRAME)
    console.log('🖱️ Paso 9: Click en botón Siguiente...');
    const botonSiguiente = iframe.locator('button#botonDerecha:has-text("Siguiente"), button.botonDerecha:has-text("Siguiente")').first();
    await botonSiguiente.waitFor({ state: 'visible', timeout: 5000 });
    await botonSiguiente.click();
    console.log('✅ Click en Siguiente ejecutado');
    
    // Esperar pantalla de selección de extracto
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/quiniela-05-seleccion-extracto.png', fullPage: true });
    console.log('✅ Pantalla de selección de extracto abierta');

    // Paso 10: Click en botón Rio Negro (DENTRO DEL IFRAME)
    console.log('🖱️ Paso 10: Seleccionando extracto Rio Negro...');
    const botonRioNegro = iframe.locator('label#btnExtracto:has-text("Rio Negro"), label.extractoButton:has-text("Rio Negro")').first();
    await botonRioNegro.waitFor({ state: 'visible', timeout: 5000 });
    await botonRioNegro.click();
    console.log('✅ Extracto Rio Negro seleccionado');
    
    await page.waitForTimeout(1000);

    // Paso 11: Click en botón Jugar (DENTRO DEL IFRAME)
    console.log('🖱️ Paso 11: Click en botón Jugar...');
    const botonJugar = iframe.locator('button#botonDerecha:has-text("Jugar"), button.botonDerecha:has-text("Jugar")').first();
    await botonJugar.waitFor({ state: 'visible', timeout: 5000 });
    await botonJugar.click();
    console.log('✅ Click en Jugar ejecutado');
    
    // Esperar que aparezca el popup del cupón
    await page.waitForTimeout(3000);

    // Paso 12: Validar popup del cupón y tomar captura
    console.log('📋 Paso 12: Validando popup del cupón...');
    
    // ⭐ Buscar el popup del cupón usando selectores específicos del HTML real
    // El popup tiene id="download" y clase "cuponFinal"
    const cuponPopup = iframe.locator('div#download.cuponFinal').first();
    
    // Verificar que el popup es visible
    await cuponPopup.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Popup del cupón visible');
    
    // Buscar el mensaje "¡CUPON GENERADO!" específicamente
    const mensajeExito = iframe.locator('div.text-success:has-text("¡CUPON GENERADO!")').first();
    await mensajeExito.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✅ Mensaje "¡CUPON GENERADO!" confirmado');
    
    // Tomar screenshot del cupón
    await page.screenshot({ path: 'test-results/quiniela-06-cupon-generado.png', fullPage: true });
    
    // Validaciones del cupón
    const cuponText = await cuponPopup.textContent();
    console.log('📄 Contenido del cupón capturado');
    
    // Validar que contiene información relevante
    expect(cuponText).toBeTruthy();
    expect(cuponText).toContain('CUPON GENERADO');
    console.log('✅ Cupón contiene información válida');
    
    // Buscar elementos específicos del cupón
    const tieneFecha = cuponText.includes('202') || cuponText.includes('/') || cuponText.includes('-');
    const tieneImporte = cuponText.includes('200') || cuponText.includes('$');
    const tieneNumero = cuponText.includes(numeroAleatorio.toString());
    
    console.log('🔍 Validaciones del cupón:');
    console.log('  - Contiene mensaje de éxito: ✅');
    console.log('  - Contiene fecha:', tieneFecha ? '✅' : '⚠️');
    console.log('  - Contiene importe:', tieneImporte ? '✅' : '⚠️');
    console.log('  - Contiene número jugado:', tieneNumero ? '✅' : '⚠️');
    
    console.log('🎉 ¡Test de Quiniela Tradicional completado exitosamente!');
  });

  test('3. Debería validar elementos de la pantalla de juegos', async ({ page }) => {
    // Verificar que estamos en /home
    await expect(page).toHaveURL(/.*\/plataforma\/home/);
    
    // Verificar que existe el elemento "Quiniela tradicional"
    // HTML: <div class="sc-jHcXXw lkkECO">Quiniela tradicional</div>
    const quinielaElement = page.locator('div.sc-jHcXXw:has-text("Quiniela tradicional")').first();
    await quinielaElement.waitFor({ state: 'visible', timeout: 5000 });
    
    const isVisible = await quinielaElement.isVisible();
    expect(isVisible).toBeTruthy();
    console.log('✅ Elemento "Quiniela tradicional" está visible');
    
    // Tomar screenshot
    await page.screenshot({ path: 'test-results/validacion-elementos-home.png', fullPage: true });
  });
});
