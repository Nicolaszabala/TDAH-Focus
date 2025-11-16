# Diagnóstico y Solución: Calidad del LLM Chatbot TDAH

## 📊 Root Cause Analysis

### Problema Reportado
El chatbot está generando respuestas de baja calidad ("diciendo cualquier cosa"), no coherentes, y posiblemente no respetando el idioma español.

### Causas Identificadas

#### 🔴 **CRÍTICO: Prompt Overload (Causa Principal)**

**Evidencia:**
- Prompt original: **9,136 caracteres** (~2,284 tokens)
- Modelo: Llama-3.2-1B-Instruct (modelo pequeño, 1 billón de parámetros)
- Límite de respuesta: 400 tokens

**Problema:**
Modelos pequeños (1B parámetros) se saturan con contextos largos. Cuando el prompt consume >2,000 tokens, el modelo:
- Pierde foco en instrucciones clave
- No puede priorizar qué información es relevante
- Genera respuestas incoherentes al intentar "procesar todo"
- Las instrucciones importantes (como "responde en español") se pierden en el ruido

**Impacto:** **ALTO** - Esta es la causa principal de la mala calidad

---

#### 🟡 **IMPORTANTE: Knowledge Base No Optimizada**

**Evidencia:**
```javascript
// promptBuilder.js (original)
const adhdKnowledge = getADHDKnowledge(); // ~6,000 caracteres
// Se inyecta TODO el conocimiento en CADA consulta
```

**Problema:**
- Se incluye conocimiento completo de TDAH + Scattered Minds en cada request
- 90% de ese conocimiento no es relevante para cada consulta específica
- Desperdicia tokens del contexto con información no utilizada

**Impacto:** **MEDIO** - Contribuye a saturación del modelo

---

#### 🟡 **Estructura de Prompt No Optimizada**

**Evidencia:**
```javascript
// Original: Todo en un solo mensaje "user"
messages: [{ role: 'user', content: HUGE_PROMPT }]
```

**Problema:**
- No se separa system message de user message
- Instrucciones mezcladas con conocimiento y consulta
- Dificulta al modelo distinguir qué es instrucción vs contenido

**Impacto:** **MEDIO** - Afecta seguimiento de instrucciones

---

#### 🟢 **libro1.md No Integrado (No es problema)**

**Evidencia:**
- Archivo libro1.md: 567,544 caracteres (92,005 palabras)
- Contiene libro completo "Scattered Minds"

**Análisis:**
- ✅ Ya tenemos conceptos clave extraídos en `scattered-minds-concepts.js`
- ✅ libro1.md sirve como referencia, NO debe inyectarse en prompts
- ✅ No es un problema, es material de consulta

**Acción:** Ninguna necesaria - archivo correctamente excluido

---

#### 🟢 **Parámetros del Modelo**

**Configuración actual:**
```javascript
max_tokens: 400
temperature: 0.75
top_p: 0.92
frequency_penalty: 0.2
presence_penalty: 0.2
```

**Análisis:**
- Parámetros razonables para el modelo
- Ajuste menor recomendado (ver solución)

**Impacto:** **BAJO** - Optimización secundaria

---

## ✅ Soluciones Implementadas

### 1. **Prompt Optimizado (76-80% reducción)**

#### Archivo: `knowledge/adhd-knowledge-base-optimized.js`

**Estrategia:**
- ✅ Knowledge base compacto (core concepts ~1,200 chars)
- ✅ Inyección selectiva por patrón detectado
- ✅ Detector de patrones (parálisis ejecutiva, foco, procrastinación, etc.)

**Resultados:**
```
Prompt original:  9,136 chars (~2,284 tokens)
Prompt optimizado: 1,801-2,174 chars (~450-544 tokens)
Reducción: 76-80%
```

**Ejemplo: Detección de patrón "Parálisis Ejecutiva"**
```javascript
// Mensaje: "Me siento abrumado y no sé por dónde empezar"
detectPattern(message) // → 'paralisis_ejecutiva'

// Se inyecta SOLO conocimiento relevante:
// - Core TDAH (~1,200 chars)
// - Parálisis ejecutiva específica (~500 chars)
// Total: ~1,700 chars vs 9,136 original
```

---

### 2. **Separación System/User Messages**

#### Archivo: `services/llmService-optimized.js`

**Antes:**
```javascript
messages: [
  { role: 'user', content: "Todo mezclado: instrucciones + conocimiento + consulta" }
]
```

**Después:**
```javascript
messages: [
  {
    role: 'system',
    content: "Eres asistente TDAH. [Conocimiento + Instrucciones]"
  },
  {
    role: 'user',
    content: "CONTEXTO: [contexto]. CONSULTA: [pregunta]"
  }
]
```

**Beneficio:**
- Modelos pequeños siguen mejor instrucciones cuando están en system message
- Separación clara de responsabilidades
- Español forzado desde el principio: "Eres asistente TDAH. SIEMPRE respondes en ESPAÑOL"

---

### 3. **Parámetros Ajustados**

```javascript
// Optimized
max_tokens: 350,        // Reducido de 400 (permite completar mejor)
temperature: 0.7,       // Reducido de 0.75 (más enfocado)
top_p: 0.9,             // Reducido de 0.92 (mejor coherencia)
frequency_penalty: 0.3, // Aumentado de 0.2 (reduce repetición)
```

**Razón:**
- Temperatura más baja = respuestas más determinísticas
- top_p más bajo = vocabulario más enfocado
- frequency_penalty mayor = menos repetición de frases

---

### 4. **Prompt Structure Simplificado**

**Antes:** 12 directrices complejas con sub-puntos

**Después:** 7 instrucciones directas y claras

```
INSTRUCCIONES OBLIGATORIAS:
1. Responde en ESPAÑOL (nunca inglés)
2. Extensión: 120-180 palabras
3. Tono: empático pero profesional
4. Estructura OBLIGATORIA: validación + explicación + estrategias + herramienta
5. Usa emojis estratégicos: 📌 🎯 💡 ⏱️
6. Lenguaje de coaching: "podrías probar...", "funciona bien..."
7. NUNCA diagnostiques ni reemplaces terapia
```

**Beneficio:** Modelos pequeños procesan mejor instrucciones simples y directas

---

## 🔄 Cómo Implementar las Soluciones

### Opción 1: Reemplazo Completo (Recomendado)

#### Paso 1: Backup de archivos originales
```bash
cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-chatbot-backend

# Backup
cp services/llmService.js services/llmService.original.js
cp services/promptBuilder.js services/promptBuilder.original.js
cp knowledge/adhd-knowledge-base.js knowledge/adhd-knowledge-base.original.js
```

#### Paso 2: Reemplazar con versiones optimizadas
```bash
# Reemplazar LLM service
mv services/llmService-optimized.js services/llmService.js

# Reemplazar prompt builder
mv services/promptBuilder-optimized.js services/promptBuilder.js

# Agregar knowledge base optimizada (mantener original como backup)
# No reemplazar, solo agregar y cambiar imports
```

#### Paso 3: Actualizar imports en rutas
```javascript
// routes/chat.js
const { generateOptimizedResponse } = require('../services/llmService');

// O simplemente: generateResponse ahora apunta a optimized
const { generateResponse } = require('../services/llmService');
```

#### Paso 4: Reiniciar servidor
```bash
npm start
```

---

### Opción 2: Prueba A/B (Más Seguro)

Mantener ambas versiones y probar:

```javascript
// routes/chat.js
const { generateResponse: generateOld } = require('../services/llmService.original');
const { generateOptimizedResponse: generateNew } = require('../services/llmService');

// Usar optimizada por defecto
const response = await generateNew(message, context);

// Alternar con variable de entorno
const useOptimized = process.env.USE_OPTIMIZED_LLM !== 'false';
const generate = useOptimized ? generateNew : generateOld;
```

---

## 📈 Métricas de Mejora Esperadas

### Calidad de Respuestas

| Métrica | Antes | Después (esperado) |
|---------|-------|---------------------|
| Coherencia | Baja (respuestas aleatorias) | Alta (estructura clara) |
| Adherencia a español | Inconsistente | 95%+ (forzado en system) |
| Relevancia | Baja (información genérica) | Alta (patrón-específica) |
| Estructura | Ausente | Consistente (validación + estrategias) |
| Mención herramientas app | <30% | >80% (obligatorio en prompt) |

### Performance

| Métrica | Antes | Después |
|---------|-------|---------|
| Tokens de prompt | ~2,284 | ~450-544 |
| Tiempo de procesamiento | ~3-5 seg | ~2-3 seg (estimado) |
| Costo por request | Alto | -76% (reducción tokens) |

---

## 🧪 Cómo Probar

### Test 1: Verificar estructura de prompt
```bash
cd /home/nicolas/Trabajo\ Final\ de\ Grado/adhd-chatbot-backend
node test-optimized-prompt.js
```

**Salida esperada:**
```
✅ Dentro del target (<3000 chars)
📉 Reducción: 76-80% vs prompt original
```

### Test 2: Probar con API real (requiere HF API key)
```bash
# Configurar API key
export HUGGING_FACE_API_KEY="tu_key_aqui"

# Ejecutar test
node test-llm-diagnosis.js
```

**Analiza:**
- ✅ Idioma detectado: Español
- ✅ Contiene emojis: Sí
- ✅ Menciona herramientas app: Sí
- ✅ Tono empático: Sí
- ✅ Coherencia: Alta

### Test 3: Prueba en producción (Render)

**Endpoint:** `https://adhd-chatbot-api.onrender.com/api/chat`

```bash
curl -X POST https://adhd-chatbot-api.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Me siento abrumado y no sé por dónde empezar",
    "context": {
      "tasks": [{"isMandatory": true, "completed": false}],
      "pomodoroSessions": 0
    }
  }'
```

**Respuesta esperada (estructura):**
```json
{
  "response": "📌 Es completamente normal sentirse abrumado con TDAH... [validación]

  Esto sucede porque... [explicación neurobiológica breve]

  1. Estrategia 1...
  2. Estrategia 2...

  💡 Puedes usar el Pomodoro de la app... [herramienta específica]"
}
```

---

## 🚨 Troubleshooting

### Problema: Respuestas siguen siendo en inglés

**Causa:** Modelo ignora instrucción de idioma

**Solución:**
1. Verificar que `system` message incluya: "SIEMPRE respondes en ESPAÑOL"
2. Aumentar énfasis en user prompt: "Responde en español siguiendo la estructura..."
3. Agregar a stop tokens: palabras en inglés comunes

```javascript
stop: ['\n\n\n', '###', 'Usuario:', 'User:', 'ADHD symptoms', 'You might', 'Here are']
```

---

### Problema: Respuestas muy cortas (<50 palabras)

**Causa:** Modelo termina prematuramente

**Solución:**
1. Aumentar `min_tokens` (si API lo soporta)
2. Modificar prompt: "Responde EXACTAMENTE 120-180 palabras (no menos)"
3. Ajustar `temperature` a 0.75 (más variedad)

---

### Problema: Sigue sin mencionar herramientas de la app

**Causa:** Instrucción no enfatizada suficiente

**Solución:**
```javascript
// En buildUserPrompt()
return `${context}

CONSULTA: "${message}"

OBLIGATORIO: Tu respuesta DEBE mencionar al menos UNA de estas herramientas:
- Temporizador Pomodoro (25 minutos)
- Modo Concentración
- Ambientes Sonoros (ruido rosa/marrón)

Responde en español, 120-180 palabras, siguiendo estructura obligatoria.`;
```

---

### Problema: API key no configurada

**Error:** `WARNING: HUGGING_FACE_API_KEY not properly configured`

**Solución:**

1. Obtener API key: https://huggingface.co/settings/tokens
2. Configurar localmente:
```bash
echo 'HUGGING_FACE_API_KEY=hf_tu_key_real_aqui' >> .env
```

3. Configurar en Render (producción):
   - Dashboard → Environment Variables
   - Agregar: `HUGGING_FACE_API_KEY = hf_...`
   - Redeploy

---

## 📝 Archivos Creados/Modificados

### Nuevos Archivos (Optimizados)
```
adhd-chatbot-backend/
├── knowledge/
│   └── adhd-knowledge-base-optimized.js  [NUEVO] ⭐
├── services/
│   ├── llmService-optimized.js           [NUEVO] ⭐
│   └── promptBuilder-optimized.js        [NUEVO] ⭐
└── tests/
    ├── test-optimized-prompt.js          [NUEVO]
    ├── test-llm-diagnosis.js             [NUEVO]
    ├── test-prompt-structure.js          [NUEVO]
    └── extract-libro1-concepts.js        [NUEVO]
```

### Archivos Originales (Mantener como backup)
```
adhd-chatbot-backend/
├── knowledge/
│   ├── adhd-knowledge-base.js            [ORIGINAL]
│   ├── scattered-minds-concepts.js       [MANTENER - está bien]
│   └── libro1.md                         [MANTENER - referencia]
├── services/
│   ├── llmService.js                     [ORIGINAL]
│   └── promptBuilder.js                  [ORIGINAL]
```

---

## 🎯 Conclusión: Esperado vs Realidad

### ¿Por qué estaba fallando?

**Analogía:** Es como darle a un estudiante:
- 📚 Un libro de texto completo (9,136 chars)
- 📝 Instrucciones complejas con 12 puntos
- ⏱️ Y pedirle que responda en 2 minutos

**Resultado:** Respuestas apresuradas, incompletas, aleatorias

### ¿Qué hace la solución optimizada?

**Analogía mejorada:** Ahora le damos:
- 📄 Solo la página relevante (~2,000 chars)
- ✅ 7 instrucciones claras y directas
- ⏱️ Tiempo suficiente para procesar

**Resultado esperado:** Respuestas coherentes, estructuradas, en español

---

## 🚀 Próximos Pasos Recomendados

1. **Implementar versión optimizada** (Opción 1 o 2)
2. **Probar con 10-15 consultas reales** de diferentes patrones
3. **Analizar respuestas** con criterios:
   - ✅ Idioma español
   - ✅ Estructura clara (validación + explicación + estrategias + herramienta)
   - ✅ Emojis estratégicos
   - ✅ Coherencia y relevancia
4. **Ajustar parámetros** si necesario (temperature, top_p)
5. **Documentar ejemplos** de buenas respuestas para validación continua

---

## 📞 Soporte

Si después de implementar las optimizaciones persisten problemas:

1. Verificar logs del servidor: `npm start` (buscar errores)
2. Revisar respuesta cruda de API (antes de cleanResponse)
3. Probar con modelo alternativo si disponible (ej: Llama-3.2-3B si hay budget)
4. Considerar MCP (Model Context Protocol) con cuenta HuggingFace del usuario

---

**Autor:** Claude Code (Diagnosis & Optimization)
**Fecha:** 15 de noviembre de 2025
**Versión:** 1.0
