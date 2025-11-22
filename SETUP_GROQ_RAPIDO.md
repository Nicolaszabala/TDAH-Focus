# 🚀 Setup Groq API - Solución Rápida para Recursos Limitados

## 🎯 ¿Por qué Groq?

Tu servidor tiene recursos limitados:
- **RAM:** 5.8GB (insuficiente para modelos grandes)
- **CPU:** 1 vCPU (muy lento para inferencia local)

**Groq es PERFECTO para tu caso:**
- ✅ **GRATIS** (6000 tokens/min)
- ✅ **ULTRA RÁPIDO** (<1 segundo vs 10-30 seg local)
- ✅ **Modelo potente** (Llama 3.1 8B vs tu actual 1B)
- ✅ **Sin usar tus recursos** (0GB RAM)
- ✅ **Setup en 5 minutos**

---

## 📋 Paso a Paso (5 minutos)

### 1. Obtén tu API Key de Groq (GRATIS)

1. Ve a: https://console.groq.com/keys
2. Crea una cuenta (gratis, sin tarjeta de crédito)
3. Click en "Create API Key"
4. Copia la clave (empieza con `gsk_...`)

### 2. Instala el SDK de Groq

```bash
cd adhd-chatbot-backend
npm install groq-sdk
```

### 3. Agrega tu API Key al `.env`

```bash
# Edita .env
nano .env

# Agrega esta línea:
GROQ_API_KEY=gsk_TU_CLAVE_AQUI

# Guarda y cierra (Ctrl+X, Y, Enter)
```

### 4. Actualiza el servicio LLM

**Opción A: Reemplazar completamente (Recomendado)**

```bash
# Backup del archivo actual
cp services/llmService.js services/llmService-huggingface-backup.js

# Reemplazar con Groq
cp services/llmService-groq.js services/llmService.js
```

**Opción B: Dual con fallback (Más robusto)**

Edita `routes/chat.js`:

```javascript
// Al inicio del archivo (después de otros requires)
const llmServiceGroq = require('../services/llmService-groq');
const llmServiceHF = require('../services/llmService'); // Fallback

// En la función que genera respuestas (alrededor de línea 77)
try {
  // Intenta Groq primero
  const result = await llmServiceGroq.generateResponse(prompt);

  return res.json({
    response: result.response,
    model: result.model,
    tokensUsed: result.tokensUsed,
    responseTime: result.responseTime,
    provider: 'groq'
  });

} catch (error) {
  console.error('Groq failed, falling back to HuggingFace:', error.message);

  // Fallback a HuggingFace
  const hfResult = await llmServiceHF.generateResponse(prompt);

  return res.json({
    response: hfResult,
    model: 'huggingface-fallback',
    provider: 'huggingface'
  });
}
```

### 5. Reinicia tu servidor

```bash
# Si usas PM2
pm2 restart all

# Si usas npm/node directamente
npm start

# Verifica que esté corriendo
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿qué es el TDAH?"}'
```

---

## ✅ Verificación

### Test 1: Health Check

```bash
# Prueba la API
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explica el TDAH en 50 palabras",
    "context": {}
  }'
```

Deberías ver respuesta en **<2 segundos** (vs 10-30 seg con modelo local).

### Test 2: Límites de Tokens

```bash
# Prueba con mensaje largo
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Dame una guía completa y detallada sobre cómo manejar el TDAH en adultos, incluyendo estrategias de organización, concentración, y manejo de tareas",
    "context": {}
  }'
```

Ahora obtendrás **respuestas más largas** (1500 tokens vs 450).

---

## 📊 Comparación Antes/Después

| Aspecto | Antes (HF Router) | Después (Groq) | Mejora |
|---------|-------------------|----------------|--------|
| **Modelo** | Llama 1B | Llama 3.1 8B | 8x más potente |
| **Tiempo respuesta** | 2-5 seg | <1 seg | 5x más rápido |
| **Max tokens salida** | 450 | 1500+ | 3.3x más |
| **Calidad** | Básica | Excelente | ↑↑↑ |
| **Uso RAM servidor** | 0 | 0 | Igual |
| **Costo** | $0 | $0 | Igual |
| **Rate limit** | 20 req/min | 6000 tokens/min* | 300x más |

*Suficiente para ~60-100 respuestas/min

---

## 🔧 Configuración Avanzada

### Aumentar límites de tokens

En `llmService-groq.js`, línea 34:

```javascript
// Aumenta según necesites
maxTokens = 2000,  // Era 1500
```

### Cambiar modelo

Groq ofrece varios modelos gratuitos:

```javascript
// llmService-groq.js, línea 37
model = 'llama-3.1-8b-instant'        // Rápido (recomendado)
model = 'llama-3.1-70b-versatile'     // Más potente pero más lento
model = 'mixtral-8x7b-32768'          // Contexto gigante (32K)
```

### Ajustar temperatura

```javascript
// Línea 35-36
temperature = 0.72,  // 0 = determinista, 1 = creativo
topP = 0.92,         // Top-p sampling
```

---

## 🚨 Troubleshooting

### Error: "API key de Groq inválida"

```bash
# Verifica que la clave esté en .env
cat .env | grep GROQ_API_KEY

# Debe mostrar:
# GROQ_API_KEY=gsk_...

# Si no está, agrégala:
echo "GROQ_API_KEY=gsk_TU_CLAVE" >> .env

# Reinicia servidor
pm2 restart all
```

### Error: "Límite de rate excedido"

Tier gratuito: 6000 tokens/min

**Soluciones:**
1. Reduce `maxTokens` a 1000
2. Implementa rate limiting en tu backend
3. Actualiza a tier de pago (muy barato: $0.10/M tokens)

### Respuestas lentas

Si tarda >2 segundos, verifica:

```bash
# Test directo a Groq
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'

# Debe responder en <1 segundo
```

### Groq no disponible (fallback a HF)

Si implementaste dual mode y ves:

```
Groq failed, falling back to HuggingFace
```

Es normal si:
- No hay internet
- Groq tiene downtime (raro)
- Se excedió rate limit

Tu app seguirá funcionando con HuggingFace.

---

## 💰 Costos y Límites

### Tier Gratuito (Forever Free)

| Límite | Valor |
|--------|-------|
| **Requests/min** | 30 |
| **Requests/día** | 14,400 |
| **Tokens/min** | 6,000 |
| **Tokens/día** | Ilimitado* |

*Mientras respetes límites por minuto

**Para tu app:** Asumiendo 500 tokens/respuesta:
- **12 respuestas/minuto** = 720/hora = **17,280/día**
- Más que suficiente para una app personal

### Tier de Pago (opcional)

Si creces mucho:
- **$0.10 por millón de tokens** (input)
- **$0.10 por millón de tokens** (output)

Ejemplo: 10,000 respuestas/mes @ 500 tokens = $0.50/mes

Mucho más barato que hostear servidor propio.

---

## 🎓 Recursos Adicionales

### Documentación Groq
- **Docs**: https://console.groq.com/docs
- **API Reference**: https://console.groq.com/docs/api-reference
- **Modelos disponibles**: https://console.groq.com/docs/models

### Monitoreo
- **Dashboard**: https://console.groq.com/dashboard
- Ve uso en tiempo real
- Estadísticas de requests

### Rate Limits
- **Límites actuales**: https://console.groq.com/settings/limits
- **Upgrade**: https://console.groq.com/settings/billing

---

## 🆚 Alternativas a Groq

Si por alguna razón no quieres usar Groq:

### 1. **Together.ai** (similar a Groq)
- $5 crédito gratis
- Llama 3.1 8B: $0.18/M tokens
- Más lento que Groq

### 2. **OpenRouter** (agregador)
- Acceso a múltiples modelos
- Free tier con modelos pequeños
- Llama 3.1 8B: ~$0.20/M tokens

### 3. **Perplexity API** (experimental)
- Free tier limitado
- Modelos propios + Llama

### 4. **Hostear localmente** (requiere upgrade)

Si upgradeas tu Oracle Cloud a instancia Ampere A1 (24GB RAM gratis):

```bash
# Podrías correr Phi-3-Mini localmente
ollama pull phi3:mini
# Respuestas en 5-10 seg con 4 CPUs
```

---

## ✨ Siguiente Paso: RAG (Opcional)

Una vez que Groq funcione, puedes agregar **RAG con libros especializados**:

1. Instala ChromaDB localmente (en tu laptop, no servidor)
2. Procesa libros de TDAH
3. Crea servicio que:
   - Busca contexto en ChromaDB
   - Llama a Groq con contexto enriquecido
4. Despliega servicio RAG en servidor separado

**Ventaja:** Groq + RAG = Respuestas expertas basadas en libros científicos

---

## 📞 Soporte

**Archivo creado:** `adhd-chatbot-backend/services/llmService-groq.js`

**Documentación completa:**
- Este archivo: `SETUP_GROQ_RAPIDO.md`
- Opciones Oracle Cloud: `GUIA_DEPLOYMENT_ORACLE.md`
- RAG: `rag-setup/README.md`

**¿Problemas?**
1. Revisa logs: `pm2 logs` o `npm start`
2. Verifica .env: `cat .env | grep GROQ`
3. Test API key: curl directo a Groq (ver troubleshooting)

---

## 🎉 ¡Listo!

Con Groq implementado tendrás:
- ✅ Modelo 8x más potente
- ✅ Respuestas 5x más rápidas
- ✅ 3x más tokens de salida
- ✅ Sin usar recursos de tu servidor
- ✅ **Gratis**

**Tiempo de setup: 5 minutos**

**Próximos pasos:**
1. Obtén API key de Groq
2. `npm install groq-sdk`
3. Agrega GROQ_API_KEY a .env
4. Actualiza llmService.js
5. Reinicia servidor
6. ¡Prueba!
