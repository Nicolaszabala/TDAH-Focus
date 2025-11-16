# 🧪 Testing Scripts

Scripts automatizados para facilitar el testing del prototipo TDAH Focus App.

## 📋 Scripts Disponibles

### 1. `test-setup.js` - Configuración de Testing

Genera datasets de prueba y configura el entorno de testing.

#### Uso:

```bash
# Generar dataset de demo (para video)
node scripts/test-setup.js dataset-demo

# Generar dataset completo (15 tareas con notas)
node scripts/test-setup.js dataset-full

# Generar dataset de casos extremos (100+ tareas)
node scripts/test-setup.js dataset-edge

# Habilitar timer rápido (10seg trabajo, 5seg pausa)
node scripts/test-setup.js timer-fast

# Restaurar timer normal (25min trabajo, 5min pausa)
node scripts/test-setup.js timer-normal

# Ver instrucciones para limpiar datos
node scripts/test-setup.js clear

# Ver ayuda
node scripts/test-setup.js help
```

#### Datasets Generados:

**dataset-demo**:
- 8 tareas pendientes (5 obligatorias, 3 opcionales)
- 2 tareas completadas
- 3 sesiones Pomodoro (2 ayer, 1 hoy)
- Ideal para grabación de video demo

**dataset-full**:
- 15 tareas totales
- Incluye tarea con nota
- 3 sesiones Pomodoro
- Testing completo de funcionalidad

**dataset-edge**:
- 100 tareas (50 obligatorias, 50 opcionales)
- 20 tareas completadas
- Testing de rendimiento con dataset grande

### 2. `test-verify.js` - Verificación Automatizada

Verifica automáticamente requerimientos no funcionales y calidad de código.

#### Uso:

```bash
node scripts/test-verify.js
```

#### Tests Automatizados:

✅ **Estructura de archivos**: Verifica que todos los archivos requeridos existan
✅ **RNF02 - Fuente mínima 16pt**: Detecta texto <16pt no exento
✅ **RNF03 - Contraste WCAG**: Calcula ratio de contraste (≥4.5:1)
✅ **RNF07 - Touch targets**: Detecta botones <44pt sin hitSlop
✅ **RNF15/23 - Sin red**: Detecta llamadas HTTP no autorizadas
✅ **RNF24 - Sin PII**: Detecta recolección de datos personales

#### Salida Ejemplo:

```
🧪 TDAH Focus App - Automated Test Verification

═══════════════════════════════════════════════════════════

📁 File Structure Verification
   ✅ PASS All 26 required files exist

🧩 Component Count
   ℹ️  INFO Total JavaScript files: 26
   ✅ PASS Component count meets minimum (24+)

📏 RNF02: Minimum Font Size (≥16pt)
   ✅ PASS All text sizes ≥16pt (or exempted)

🎨 RNF03: WCAG Contrast Ratio (≥4.5:1)
   ✅ PASS Obligatoria badge: 4.78:1
   ✅ PASS Primary text: 15.40:1

... (más tests)

═══════════════════════════════════════════════════════════

📊 TEST SUMMARY

   Total:    7 tests
   Passed:   7
   Failed:   0
   Warnings: 0

   Pass Rate: 100.0%

   ✅ ALL AUTOMATED TESTS PASSED!
```

## 🔄 Workflow de Testing Completo

### 1. Preparación (5 minutos)

```bash
# Limpiar instalación previa
cd adhd-focus-app
npm install
npx expo start -c

# Habilitar timer rápido para testing
node scripts/test-setup.js timer-fast

# Generar dataset de prueba
node scripts/test-setup.js dataset-full
```

### 2. Importar Datos (2 minutos)

1. Abrir app en emulador (presionar 'a')
2. Abrir Dev Menu (Cmd+D / Ctrl+D)
3. Tap "Debug JS Remotely" (abre Chrome)
4. En Console, pegar código del archivo `test-data-full.json`
5. Reload app (Cmd+R / Ctrl+R)

### 3. Ejecutar Tests Automatizados (1 minuto)

```bash
node scripts/test-verify.js
```

### 4. Ejecutar Tests Manuales (4-8 horas)

Ver **MANUAL_TESTS.md** para checklist completo.

### 5. Preparación para Demo (10 minutos)

```bash
# Limpiar datos
# (Dev Menu > Debug > Clear AsyncStorage)

# Cargar dataset de demo
node scripts/test-setup.js dataset-demo

# Verificar timer rápido activo
# (debe estar en 10seg desde paso 1)
```

### 6. Restaurar Configuración Normal

```bash
# Después de testing/demo
node scripts/test-setup.js timer-normal

# Reiniciar Expo
npx expo start -c
```

## 🐛 Troubleshooting

### Timer rápido no funciona
**Problema**: Timer sigue mostrando 25:00
**Solución**:
1. Verificar que `constants.js` tiene `WORK_DURATION: 10`
2. Reiniciar Expo: `npx expo start -c`
3. Reload app (Cmd+R / Ctrl+R)

### Datos no se importan
**Problema**: AsyncStorage vacío después de pegar código
**Solución**:
1. Verificar que Chrome DevTools está conectado
2. Verificar que no hay errores en Console
3. Intentar método alternativo: copiar datos manualmente desde JSON

### test-verify.js da errores
**Problema**: Script no encuentra archivos
**Solución**:
1. Ejecutar desde raíz del proyecto: `node scripts/test-verify.js`
2. Verificar que estás en `adhd-focus-app/` directory

## 📊 Métricas de Éxito

**Verificación Automatizada**:
- ✅ 100% tests passed (7/7)
- ⚠️  0 warnings

**Testing Manual** (ver MANUAL_TESTS.md):
- ✅ 35 tests críticos ejecutados
- ✅ 0 bugs críticos
- ✅ ≤3 bugs altos

## 📁 Archivos Generados

Los scripts generan archivos en `scripts/`:
- `test-data-demo.json` - Dataset de demo
- `test-data-full.json` - Dataset completo
- `test-data-edge.json` - Dataset de casos extremos

**NO commitear estos archivos** (agregar a `.gitignore`)

## 🔧 Extensión Futura

Para agregar nuevos tests automatizados:

1. Editar `test-verify.js`
2. Agregar función `testNuevoRequerimiento()`
3. Llamar función en main
4. Actualizar este README

---

**Última actualización**: 15 de noviembre de 2025
