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
  
  // Reintentos en caso de fallo
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  
  // Workers: solo 1 para evitar problemas de concurrencia
  workers: 1,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  
  use: {
    // URL base - Ambiente UAT La Rionegrina
    baseURL: process.env.BASE_URL || 'https://uat-rn-lotline.tecnoaccion.com.ar',
    
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
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
