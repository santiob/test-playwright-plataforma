# Tests Automatizados - La Rionegrina Online (UAT)

Tests automatizados con Playwright para verificar el funcionamiento de los juegos online y la emisión de cupones en el ambiente UAT de **La Rionegrina Online (Río Negro)**.

## 🚀 Características

- ✅ Tests de login y autenticación
- ✅ Verificación de juegos disponibles
- ✅ Validación de emisión de cupones
- ✅ Captura automática de evidencias (screenshots/videos)
- ✅ Reportes HTML detallados
- ✅ Ejecución automática con GitHub Actions

## 🌐 Ambiente

**UAT URL**: https://uat-rn-lotline.tecnoaccion.com.ar/plataforma/

## 📋 Requisitos

- Node.js 18 o superior
- npm o yarn

## 🔧 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/santiob/test-playwright-plataforma.git
cd test-playwright-plataforma

# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install chromium
```

## ⚙️ Configuración

1. Copiar el archivo de ejemplo de variables de entorno:
```bash
cp .env.example .env
```

2. Editar `.env` y completar con las credenciales de UAT:
```env
TEST_USERNAME=tu_usuario_uat
TEST_PASSWORD=tu_password_uat
```

⚠️ **IMPORTANTE**: Solo usar credenciales del ambiente UAT.

## 🧪 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con interfaz visible (headed mode)
npm run test:headed

# Ejecutar en modo debug
npm run test:debug

# Ejecutar solo tests de login
npm run test:login

# Ejecutar solo tests de cupones
npm run test:cupones

# Ver reporte HTML
npm run test:report
```

## 📁 Estructura del Proyecto

```
.
├── tests/                  # Tests de Playwright
│   ├── login.spec.js      # Tests de autenticación
│   └── cupones.spec.js    # Tests de emisión de cupones
├── .github/
│   └── workflows/
│       └── playwright.yml # CI/CD con GitHub Actions
├── playwright.config.js    # Configuración de Playwright
├── package.json
├── .env.example           # Template de variables de entorno
└── README.md
```

## 🤖 GitHub Actions

Los tests se ejecutan automáticamente:
- ✅ En cada push a la rama `main`
- ✅ En cada Pull Request
- ✅ Manualmente desde la pestaña "Actions"

Puedes ver los resultados en la pestaña **"Actions"** del repositorio.

## 📊 Reportes

Después de ejecutar los tests:
- Los reportes HTML se generan en `playwright-report/`
- Las capturas de pantalla en `test-results/`
- Los videos de tests fallidos también en `test-results/`

## 🔐 Secrets en GitHub

Para que los tests se ejecuten en GitHub Actions, debes configurar los siguientes secrets:

1. Ve a: **Repositorio → Settings → Secrets and variables → Actions**
2. Agrega estos secrets:
   - `TEST_USERNAME`: Usuario de prueba UAT
   - `TEST_PASSWORD`: Contraseña de prueba UAT

## 📝 Agregar Nuevos Tests

1. Crea un archivo en `tests/` con extensión `.spec.js`
2. Importa Playwright test:
```javascript
const { test, expect } = require('@playwright/test');

test('Mi nuevo test', async ({ page }) => {
  // Tu código aquí
});
```
3. Ejecuta los tests para verificar que funcionen

## 🐛 Troubleshooting

**Error: No puedo instalar navegadores**
```bash
npx playwright install --with-deps chromium
```

**Los tests fallan localmente pero no en CI**
- Verifica las variables de entorno en `.env`
- Revisa los timeouts en `playwright.config.js`

**Error de timeout en login**
- Verifica que las credenciales sean correctas
- Aumenta el timeout en la configuración

## 📞 Soporte

Para reportar problemas o sugerencias, abre un issue en este repositorio.

## 📄 Licencia

MIT
