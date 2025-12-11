# Configuración Multi-Plataforma con 2 Workers

## 📋 Descripción

Esta configuración permite ejecutar tests de Playwright en **2 plataformas diferentes simultáneamente** usando **2 workers**, lo que permite paralelizar la ejecución y reducir el tiempo total de testing.

---

## 🏗️ Arquitectura

```
GitHub Actions Matrix Strategy
├─ Job 1: plataforma-rionegrina (Worker 1)
│   ├─ Base URL: https://uat-rn-lotline.tecnoaccion.com.ar
│   ├─ Credenciales: TEST_USERNAME_RIONEGRINA / TEST_PASSWORD_RIONEGRINA
│   └─ Tests: *rionegrina*.spec.js
│
└─ Job 2: plataforma-secundaria (Worker 2)
    ├─ Base URL: https://url-segunda-plataforma.com
    ├─ Credenciales: TEST_USERNAME_SECUNDARIA / TEST_PASSWORD_SECUNDARIA
    └─ Tests: *secundaria*.spec.js

Ambos jobs se ejecutan EN PARALELO
```

---

## ⚙️ Configuración Local

### 1. Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Completa con las credenciales reales:

```env
# Plataforma 1: La Rionegrina
TEST_USERNAME_RIONEGRINA=usuario_real_1
TEST_PASSWORD_RIONEGRINA=password_real_1
BASE_URL_RIONEGRINA=https://uat-rn-lotline.tecnoaccion.com.ar

# Plataforma 2: Segunda Plataforma
TEST_USERNAME_SECUNDARIA=usuario_real_2
TEST_PASSWORD_SECUNDARIA=password_real_2
BASE_URL_SECUNDARIA=https://url-real-plataforma-2.com
```

### 2. Estructura de Tests

Organiza tus tests según la plataforma:

```
tests/
├── login.rionegrina.spec.js      # Tests de La Rionegrina
├── cupones.rionegrina.spec.js
├── login.secundaria.spec.js      # Tests de Plataforma 2
└── juegos.secundaria.spec.js
```

**Importante**: El nombre del archivo debe incluir el identificador de la plataforma para que `testMatch` los reconozca.

---

## 🚀 Ejecución Local

### Ejecutar todas las plataformas en paralelo:

```bash
npm test
```

### Ejecutar solo una plataforma específica:

```bash
# Solo La Rionegrina
npx playwright test --project=plataforma-rionegrina

# Solo Plataforma Secundaria
npx playwright test --project=plataforma-secundaria
```

### Ejecutar con UI mode:

```bash
npx playwright test --ui
```

### Ejecutar tests específicos:

```bash
# Test específico en plataforma específica
npx playwright test cupones.rionegrina.spec.js --project=plataforma-rionegrina
```

---

## 🤖 Configuración en GitHub Actions

### 1. Configurar Secrets

Ve a: **Repositorio → Settings → Secrets and variables → Actions**

Agrega los siguientes secrets:

#### Plataforma 1: La Rionegrina
- `TEST_USERNAME_RIONEGRINA`
- `TEST_PASSWORD_RIONEGRINA`

#### Plataforma 2: Secundaria
- `TEST_USERNAME_SECUNDARIA`
- `TEST_PASSWORD_SECUNDARIA`

### 2. Triggers Configurados

Los tests se ejecutan automáticamente:
- ✅ Push a rama `main`
- ✅ Pull Requests
- ✅ Cada 6 horas (cron)
- ✅ Manualmente desde Actions tab

### 3. Workflow Matrix

El workflow usa **matrix strategy** para ejecutar 2 jobs en paralelo:

```yaml
strategy:
  matrix:
    platform: [plataforma-rionegrina, plataforma-secundaria]
```

Cada job:
- Se ejecuta en su propio runner
- Usa sus propias credenciales
- Genera sus propios artifacts
- No bloquea al otro si falla (`fail-fast: false`)

---

## 📊 Reportes y Artifacts

Después de cada ejecución, se generan artifacts separados:

```
Artifacts generados:
├─ playwright-report-plataforma-rionegrina/
│   └─ index.html
├─ playwright-report-plataforma-secundaria/
│   └─ index.html
├─ test-results-plataforma-rionegrina/
│   ├─ screenshots/
│   ├─ videos/
│   └─ junit.xml
└─ test-results-plataforma-secundaria/
    ├─ screenshots/
    ├─ videos/
    └─ junit.xml
```

### Descargar Artifacts

1. Ve a la pestaña **Actions**
2. Click en el workflow ejecutado
3. Scroll down hasta **Artifacts**
4. Descarga el que necesites

---

## 🔧 Playwright Config Explicado

### Workers

```javascript
workers: process.env.CI ? 2 : 2,
```

- En CI: 2 workers (paralelización máxima)
- En local: 2 workers (ajustar según tu máquina)

### Parallel Execution

```javascript
fullyParallel: true,
```

Permite que los tests dentro de cada proyecto también se ejecuten en paralelo.

### Projects

```javascript
projects: [
  {
    name: 'plataforma-rionegrina',
    use: { 
      baseURL: process.env.BASE_URL_RIONEGRINA,
    },
    testMatch: /.*rionegrina.*\.spec\.js/,
  },
  {
    name: 'plataforma-secundaria',
    use: { 
      baseURL: process.env.BASE_URL_SECUNDARIA,
    },
    testMatch: /.*secundaria.*\.spec\.js/,
  },
]
```

Cada proyecto:
- Tiene su propia `baseURL`
- Filtra tests por patrón de nombre
- Puede tener configuración específica

---

## 📈 Ventajas de esta Configuración

### ✅ Paralelización Eficiente
- 2 plataformas se prueban simultáneamente
- Tiempo total = máx(tiempo_plataforma_1, tiempo_plataforma_2)
- En lugar de tiempo_plataforma_1 + tiempo_plataforma_2

### ✅ Aislamiento
- Credenciales separadas por plataforma
- Reportes independientes
- Un fallo no afecta al otro

### ✅ Escalabilidad
- Fácil agregar más plataformas
- Solo agregar entry en matrix
- Sin cambios en tests

### ✅ Debugging Facilitado
- Artifacts separados por plataforma
- Logs específicos por proyecto
- Fácil identificar problemas

---

## 🎯 Ejemplos de Uso

### Caso 1: Mismo test en 2 ambientes

Si quieres ejecutar los mismos tests en ambas plataformas, NO uses `testMatch`:

```javascript
projects: [
  {
    name: 'plataforma-rionegrina',
    use: { 
      baseURL: 'https://uat-rn-lotline.tecnoaccion.com.ar',
    },
    // Sin testMatch - ejecuta TODOS los tests
  },
  {
    name: 'plataforma-secundaria',
    use: { 
      baseURL: 'https://url-segunda-plataforma.com',
    },
    // Sin testMatch - ejecuta TODOS los tests
  },
]
```

### Caso 2: Tests específicos por plataforma

Usa `testMatch` para separar tests:

```javascript
// En playwright.config.js (como está configurado ahora)
testMatch: /.*rionegrina.*\.spec\.js/,
```

Entonces estructura tus archivos:
- `tests/login.rionegrina.spec.js`
- `tests/login.secundaria.spec.js`

### Caso 3: Plataforma + Navegador Matrix

Expandir para probar en Chrome y Firefox:

```yaml
strategy:
  matrix:
    platform: [plataforma-rionegrina, plataforma-secundaria]
    browser: [chromium, firefox]
```

Esto crearía **4 jobs** en paralelo (2 plataformas × 2 navegadores).

---

## 📝 Modificar URLs de Plataformas

### Opción 1: Variables de Entorno (.env)

```env
BASE_URL_RIONEGRINA=https://nueva-url-rionegrina.com
BASE_URL_SECUNDARIA=https://nueva-url-secundaria.com
```

### Opción 2: Playwright Config

Edita `playwright.config.js`:

```javascript
{
  name: 'plataforma-rionegrina',
  use: { 
    baseURL: 'https://nueva-url.com',  // ← Cambiar aquí
  },
}
```

### Opción 3: GitHub Actions Workflow

Edita `.github/workflows/playwright.yml`:

```yaml
- platform: plataforma-rionegrina
  base_url: https://nueva-url.com  # ← Cambiar aquí
```

---

## 🐛 Troubleshooting

### Error: Tests no se ejecutan en paralelo

**Causa**: `fullyParallel: false` o `workers: 1`

**Solución**: Verifica `playwright.config.js`:
```javascript
fullyParallel: true,
workers: 2,
```

### Error: No encuentra las credenciales

**Causa**: Secrets no configurados o nombres incorrectos

**Solución**: Verifica en GitHub:
- Settings → Secrets → Actions
- Nombres exactos: `TEST_USERNAME_RIONEGRINA`, etc.

### Error: Matrix job falla y detiene los demás

**Causa**: `fail-fast: true` (default)

**Solución**: En workflow, asegúrate de:
```yaml
strategy:
  fail-fast: false  # ← Importante
```

### Tests toman demasiado tiempo

**Posibles causas y soluciones**:

1. **Workers insuficientes**: Aumenta en `playwright.config.js`
   ```javascript
   workers: 4,
   ```

2. **Tests no optimizados**: Revisa timeouts y waits innecesarios

3. **Recursos de CI limitados**: Considera upgrade de plan GitHub

---

## 📚 Referencias

- [Playwright Projects](https://playwright.dev/docs/test-projects)
- [GitHub Actions Matrix](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Playwright Parallelization](https://playwright.dev/docs/test-parallel)

---

## 🎉 Resultado Esperado

Con esta configuración:

1. **Push a main** → Triggers workflow
2. **2 jobs se crean** (uno por plataforma)
3. **Se ejecutan EN PARALELO** 
4. **Cada job**:
   - Instala dependencias
   - Ejecuta tests de su plataforma
   - Genera reportes
   - Sube artifacts
5. **Resultados disponibles** en ~3-5 minutos (vs ~6-10 minutos secuencial)

```
Timeline:
0:00 ─────────────────────────────────► 5:00 min
│                                         │
├─ plataforma-rionegrina ─────────────► ✅
└─ plataforma-secundaria ─────────────► ✅

En lugar de:
0:00 ───► 5:00 ───► 10:00 min
│         │         │
├─ plat1 ─► plat2 ─► ✅
```

---

*Documentación actualizada: Diciembre 2025*
