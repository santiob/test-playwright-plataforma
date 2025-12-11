const { defineConfig, devices } = require('@playwright/test');
require('dotenv').config();

module.exports = defineConfig({
  testDir: './tests',
  
  // Timeout por test
  timeout: 60000,
  
  // Timeout para assertions
  expect: {
    timeout: 10000
  },
  
  // ⭐ CAMBIO: Habilitar ejecución paralela
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  
  // ⭐ CAMBIO: 2 workers para ejecutar tests en paralelo
  workers: process.env.CI ? 2 : 2,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  // Configuración común para todos los proyectos
  use: {
    // Captura de evidencias
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Configuración del navegador
    viewport: { width: 1280, height: 720 },
    
    // Timeouts de navegación
    navigationTimeout: 30000,
    actionTimeout: 10000,
    
    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  
  // ⭐ CAMBIO: Definir 2 proyectos para 2 plataformas diferentes
  projects: [
    {
      name: 'plataforma-rionegrina',
      use: { 
        ...devices['Desktop Chrome'],
        // URL para La Rionegrina (Río Negro)
        baseURL: process.env.BASE_URL_RIONEGRINA || 'https://uat-rn-lotline.tecnoaccion.com.ar',
      },
      // Credenciales específicas de esta plataforma
      testMatch: /.*rionegrina.*\.spec\.js/,
    },
    {
      name: 'plataforma-secundaria',
      use: { 
        ...devices['Desktop Chrome'],
        // URL para segunda plataforma
        baseURL: process.env.BASE_URL_SECUNDARIA || 'https://url-segunda-plataforma.com',
      },
      // Tests específicos de esta plataforma (opcional)
      testMatch: /.*secundaria.*\.spec\.js/,
    },
  ],
});
