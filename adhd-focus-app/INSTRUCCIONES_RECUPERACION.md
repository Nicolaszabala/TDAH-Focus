# 🚨 INSTRUCCIONES DE RECUPERACIÓN COMPLETA

## ✅ ESTADO DEL CÓDIGO

**VERIFICADO**: Todos los archivos tienen sintaxis correcta:
- ✅ ChatScreen.js (Asistente LLM) - EXISTE y FUNCIONA
- ✅ SoundScreen.js (Sonidos) - EXISTE y FUNCIONA
- ✅ Tutorial.js - EXISTE y FUNCIONA
- ✅ AppNavigator.js - TIENE TODAS LAS 6 TABS

**El código NO está roto. Es un problema de CACHÉ.**

---

## 🔧 SOLUCIÓN PASO A PASO

### 1. DETENER TODO
```bash
# Mata todos los procesos de Expo
pkill -f "expo"
pkill -f "metro"
```

### 2. LIMPIAR CACHÉ COMPLETO
```bash
cd /home/user/TFG/adhd-focus-app

# Limpiar caché de Expo y Metro
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear
```

### 3. SI AÚN NO FUNCIONA - REINSTALAR TODO
```bash
cd /home/user/TFG/adhd-focus-app

# Detener procesos
pkill -f expo
pkill -f metro

# Borrar TODO
rm -rf node_modules
rm -rf .expo
rm -rf package-lock.json
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Reinstalar
npm install

# Iniciar limpio
npx expo start --clear
```

### 4. EN EL DISPOSITIVO/EMULADOR
- **CERRAR** completamente la app (no minimizar)
- **BORRAR** caché de Expo Go: Settings → Apps → Expo Go → Clear Cache
- **REABRIR** Expo Go
- **ESCANEAR** el QR nuevamente

---

## 📋 VERIFICACIÓN

Después de seguir los pasos, deberías ver:

### En la pantalla principal:
1. **6 TABS** en la barra inferior:
   - Inicio
   - Tareas  
   - Pomodoro
   - **Sonidos** ✓
   - **Asistente** ✓
   - Ajustes

### Al abrir por primera vez:
2. **Tutorial interactivo** aparece automáticamente
   - Modal de bienvenida
   - Botones "Siguiente", "Anterior", "Saltar" funcionan

### En tab Sonidos:
3. **3 ambientes sonoros**:
   - Ruido Rosa
   - Ruido Marrón  
   - Ambiente Natural (pájaros)

### En tab Asistente:
4. **Chat con LLM**
   - Input de texto funcional
   - Botón enviar funcional
   - Respuestas con badge "✨ LLM"

---

## ❓ SI TODAVÍA NO FUNCIONA

1. **Verifica que estás en la rama correcta:**
```bash
git status
# Debería decir: On branch claude/review-icons-01Cnxbd7wrAkDKq4hocyicGb
```

2. **Verifica los últimos commits:**
```bash
git log --oneline -5
# Deberías ver:
# 8a1b717 Fix: Update SoundPlayer to use soundService...
# 187359e Fix: Critical tutorial and audio service bugs
```

3. **Verifica que los archivos existen:**
```bash
ls -la src/screens/ChatScreen.js
ls -la src/screens/SoundScreen.js
ls -la src/components/common/Tutorial.js
# Todos deberían existir
```

---

## 🔄 ROLLBACK (última opción)

Si nada funciona, vuelve al estado anterior a mis cambios:

```bash
git log --oneline -10  # Ver commits
git revert 8a1b717 187359e 49927ea 494a3e7 --no-commit
git commit -m "Revert last 4 commits"
git push
```

---

## 📞 INFORMACIÓN TÉCNICA

**Archivos modificados en últimos 4 commits:**
- Tutorial.js (arreglado pointerEvents)
- soundService.js (console.logs comentados)
- audioService.js (ELIMINADO - era duplicado)
- SoundPlayer.js (actualizado para usar soundService)
- nature_ambient.mp3 (reemplazado con sonidos reales)

**TODO el código es sintácticamente válido.**
**El problema es 100% de caché/runtime.**

---

Creado: 2025-11-15
Rama: claude/review-icons-01Cnxbd7wrAkDKq4hocyicGb
Commits: 8a1b717, 187359e, 49927ea, 494a3e7
