# 🤖 ADHD Chatbot Backend API

Backend API para el asistente conversacional de la aplicación TDAH Focus App. Utiliza modelos LLM opensource de Hugging Face para generar respuestas naturales y contextualizadas.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

- **LLM Real**: Usa Flan-T5-large (780M parámetros) de Google via Hugging Face
- **100% Gratuito**: Funciona en tier gratuito de Hugging Face + Render.com
- **Caché Inteligente**: Reduce llamadas API y mejora latencia
- **Rate Limiting**: Protección contra abuso
- **Fallback Robusto**: Si LLM falla, usa respuestas basadas en patrones
- **Privacidad**: Solo recibe metadata, NO contenido de tareas
- **Respuestas Contextuales**: Considera estado del usuario (tareas, sesiones Pomodoro)

---

## 🏗️ Arquitectura

```
┌─────────────────┐
│  React Native   │
│   ADHD App      │
└────────┬────────┘
         │ HTTPS POST /api/chat
         │ { message, context }
         ▼
┌─────────────────┐
│  Express API    │
│  Node.js        │
├─────────────────┤
│ • Rate Limiter  │
│ • Cache Layer   │
│ • Prompt Builder│
└────────┬────────┘
         │ Hugging Face Inference API
         │ Bearer token auth
         ▼
┌─────────────────┐
│ Hugging Face    │
│ Flan-T5-large   │
│ (Serverless)    │
└─────────────────┘
```

### Componentes

- **server.js**: Servidor Express principal
- **routes/chat.js**: Endpoints de la API de chat
- **services/llmService.js**: Integración con Hugging Face
- **services/promptBuilder.js**: Construcción de prompts contextualizados
- **utils/cache.js**: Sistema de caché en memoria
- **middleware/rateLimit.js**: Limitación de tasa de requests

---

## 🚀 Instalación

### Requisitos Previos

- Node.js 16+ ([Descargar](https://nodejs.org/))
- npm o yarn
- Cuenta en Hugging Face ([Registrarse gratis](https://huggingface.co/join))

### Pasos de Instalación

#### 1. Clonar el Proyecto

```bash
cd adhd-chatbot-backend
```

#### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- `express`: Framework web
- `cors`: Manejo de CORS
- `dotenv`: Variables de entorno
- `axios`: Cliente HTTP
- `express-rate-limit`: Rate limiting

#### 3. Configurar Variables de Entorno

Crear archivo `.env` desde el template:

```bash
cp .env.example .env
```

Editar `.env` y configurar:

```env
PORT=3000
NODE_ENV=development
HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAX_REQUESTS_PER_MINUTE=20
CACHE_TTL_SECONDS=3600
ALLOWED_ORIGINS=http://localhost:19006
```

#### 4. Obtener API Key de Hugging Face

1. Ir a https://huggingface.co/
2. Registrarse (gratis)
3. Ir a Settings → Access Tokens
4. Click en "New token"
5. Nombre: `adhd-chatbot-api`
6. Role: `read`
7. Copiar el token (empieza con `hf_`)
8. Pegarlo en `.env` como `HUGGING_FACE_API_KEY`

#### 5. Iniciar Servidor en Desarrollo

```bash
npm run dev
```

Deberías ver:

```
==================================================
🚀 ADHD Chatbot API Server
==================================================
Environment: development
Port: 3000
Health check: http://localhost:3000/health
API endpoint: http://localhost:3000/api/chat
==================================================
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Default | Requerido |
|----------|-------------|---------|-----------|
| `PORT` | Puerto del servidor | 3000 | No |
| `NODE_ENV` | Entorno (development/production) | development | No |
| `HUGGING_FACE_API_KEY` | API key de Hugging Face | - | **Sí** |
| `MAX_REQUESTS_PER_MINUTE` | Límite de requests por minuto/IP | 20 | No |
| `CACHE_TTL_SECONDS` | Tiempo de vida del caché (segundos) | 3600 | No |
| `ALLOWED_ORIGINS` | Orígenes permitidos (CORS) | localhost | No |

### Configuración del Modelo LLM

Por defecto usa `google/flan-t5-large`. Para cambiar el modelo, editar `services/llmService.js`:

```javascript
const HF_API_URL = 'https://api-inference.huggingface.co/models/google/flan-t5-large';
```

Modelos alternativos:
- `google/flan-t5-base` (más rápido, menos preciso)
- `google/flan-t5-xl` (más lento, más preciso - requiere tier pago)

---

## 📖 Uso

### Testing Local con cURL

#### Test de Health Check

```bash
curl http://localhost:3000/health
```

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T12:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

#### Test de Chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "No sé por dónde empezar",
    "context": {
      "tasks": [
        {"isMandatory": true, "completed": false},
        {"isMandatory": false, "completed": false}
      ],
      "pomodoroSessions": 2,
      "hasPendingTasks": true
    }
  }'
```

Respuesta:
```json
{
  "response": "Cuando te sientas bloqueado, empieza con la tarea MÁS PEQUEÑA...",
  "cached": false,
  "processingTime": 2543
}
```

### Testing con Postman

1. Crear nueva request POST
2. URL: `http://localhost:3000/api/chat`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "message": "Estoy muy distraído",
  "context": {
    "tasks": [],
    "pomodoroSessions": 0,
    "hasPendingTasks": false
  }
}
```

### Estadísticas del Caché

```bash
curl http://localhost:3000/api/chat/stats
```

Respuesta:
```json
{
  "cache": {
    "size": 15,
    "hits": 42,
    "misses": 28,
    "evictions": 5,
    "hitRate": "60.00%"
  },
  "uptime": 3600,
  "timestamp": "2025-11-15T12:00:00.000Z"
}
```

---

## 🌐 Deployment en Render.com

### Paso 1: Preparar el Repositorio

1. Crear repositorio en GitHub
2. Subir código del backend:

```bash
cd adhd-chatbot-backend
git init
git add .
git commit -m "Initial backend setup"
git remote add origin https://github.com/TU-USUARIO/adhd-chatbot-backend.git
git push -u origin main
```

### Paso 2: Crear Web Service en Render

1. Ir a https://render.com/
2. Registrarse con GitHub (gratis)
3. Dashboard → "New +" → "Web Service"
4. Conectar repositorio `adhd-chatbot-backend`
5. Configurar:

```
Name: adhd-chatbot-api
Environment: Node
Region: Oregon (US West) o el más cercano
Branch: main
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

6. Advanced → Environment Variables:

```
HUGGING_FACE_API_KEY = hf_tu_api_key_aqui
NODE_ENV = production
MAX_REQUESTS_PER_MINUTE = 20
CACHE_TTL_SECONDS = 3600
```

7. Click "Create Web Service"

### Paso 3: Verificar Deployment

Render asignará una URL: `https://adhd-chatbot-api.onrender.com`

Verificar health check:

```bash
curl https://adhd-chatbot-api.onrender.com/health
```

### Paso 4: Configurar Auto-Deploy

Render detecta automáticamente nuevos commits en GitHub y redeploya.

Para deploy manual:
- Dashboard → Tu servicio → "Manual Deploy" → "Deploy latest commit"

### Consideraciones del Tier Gratuito

⚠️ **Limitaciones**:
- **Sleep after inactivity**: El servicio se duerme tras 15 min sin requests
- **Wake-up time**: ~30 segundos al recibir el primer request
- **750 horas/mes**: Suficiente para uso 24/7

💡 **Solución para cold starts**:
Implementar ping service (cron job cada 10 min):
- Usar cron-job.org (gratis)
- URL a pingear: `https://adhd-chatbot-api.onrender.com/health`
- Frecuencia: Cada 10 minutos

---

## 📡 API Reference

### POST /api/chat

Procesa un mensaje del usuario y genera una respuesta usando LLM.

**Request:**

```json
{
  "message": "string (required, max 500 chars)",
  "context": {
    "tasks": [
      {
        "isMandatory": "boolean",
        "completed": "boolean",
        "createdAt": "ISO 8601 string",
        "completedAt": "ISO 8601 string | null"
      }
    ],
    "pomodoroSessions": "number",
    "hasPendingTasks": "boolean"
  }
}
```

**Response (200 OK):**

```json
{
  "response": "string - Generated response",
  "cached": "boolean - True if from cache",
  "processingTime": "number - Milliseconds",
  "fallback": "boolean - True if using pattern-based fallback (optional)"
}
```

**Errors:**

- `400 Bad Request`: Mensaje inválido o demasiado largo
- `429 Too Many Requests`: Rate limit excedido (20 req/min)
- `500 Internal Server Error`: Error del servidor

---

### GET /health

Health check del servidor.

**Response (200 OK):**

```json
{
  "status": "ok",
  "timestamp": "ISO 8601 string",
  "uptime": "number - Seconds",
  "environment": "string - development | production"
}
```

---

### GET /api/chat/stats

Estadísticas del caché (para monitoreo).

**Response (200 OK):**

```json
{
  "cache": {
    "size": "number",
    "hits": "number",
    "misses": "number",
    "evictions": "number",
    "hitRate": "string - Percentage"
  },
  "uptime": "number - Seconds",
  "timestamp": "ISO 8601 string"
}
```

---

## 🐛 Troubleshooting

### Error: "Model is loading"

**Síntoma**: Respuesta "El asistente está iniciando..."

**Causa**: Cold start de Hugging Face (modelo no cargado en memoria)

**Solución**: Esperar 20-30 segundos e intentar de nuevo. El modelo se mantendrá cargado por ~15 minutos.

**Prevención**: Usar cron job para ping cada 10 min.

---

### Error: "Authentication failed"

**Síntoma**: Error 401/403 de Hugging Face API

**Causa**: `HUGGING_FACE_API_KEY` inválida o no configurada

**Solución**:
1. Verificar que `.env` tenga el API key correcto
2. Verificar que el token no haya expirado
3. Crear nuevo token en https://huggingface.co/settings/tokens

---

### Error: "Rate limit exceeded"

**Síntoma**: Error 429

**Causa**:
- Límite del servidor: >20 requests/minuto desde misma IP
- Límite de HF: ~1 request/segundo por modelo

**Solución**:
- Esperar 1 minuto
- Implementar debounce en frontend (no enviar mensajes muy rápido)
- Aumentar `MAX_REQUESTS_PER_MINUTE` en `.env` (solo si controlas tráfico)

---

### Respuestas Lentas (>5 segundos)

**Causa**:
- Cold start de modelo
- Cold start de servidor Render
- Prompt muy largo
- Tráfico alto en HF

**Solución**:
- Implementar ping service para mantener warm
- Usar modelo más pequeño (`flan-t5-base`)
- Optimizar prompt (reducir contexto)

---

### CORS Error en React Native

**Síntoma**: "Access to fetch blocked by CORS policy"

**Causa**: Origen no permitido en `ALLOWED_ORIGINS`

**Solución**:
1. En desarrollo local, CORS está deshabilitado
2. En producción, agregar origen de Expo a `.env`:
```env
ALLOWED_ORIGINS=http://localhost:19006,exp://192.168.1.100:19000
```

---

## 📊 Monitoreo y Logs

### Logs del Servidor

Render muestra logs en tiempo real:
- Dashboard → Tu servicio → "Logs"

Buscar:
- `✅` Success
- `❌` Errors
- `⏳` Model loading
- `⚠️` Warnings

### Métricas Importantes

Monitorear:
- **Cache hit rate**: Objetivo >50%
- **Processing time**: Objetivo <3 segundos
- **Error rate**: Objetivo <5%

Ver estadísticas:
```bash
curl https://adhd-chatbot-api.onrender.com/api/chat/stats
```

---

## 🔒 Seguridad

### Mejores Prácticas Implementadas

✅ **Rate limiting**: Previene abuso
✅ **Input validation**: Valida longitud y tipo de mensaje
✅ **CORS**: Solo orígenes permitidos
✅ **No PII**: No se almacena información personal
✅ **HTTPS**: Comunicación encriptada (Render provee certificado gratuito)

### Seguridad Adicional para Producción

🔐 **Recomendado**:
- Implementar autenticación (API keys por usuario)
- Rate limiting por usuario (no solo IP)
- Logging de requests (sin contenido sensible)
- Alertas de errores (Sentry, Rollbar)

---

## 📈 Escalabilidad

### Capacidad del Tier Gratuito

**Estimación conservadora**:
- 200-300 usuarios/día
- 10 mensajes/usuario/día
- ~2,000-3,000 mensajes/día
- Con caché 50%: ~1,000-1,500 llamadas a LLM/día

**Límites**:
- HF Free: ~30,000 requests/mes
- Render Free: 750 horas/mes (24/7 ok)

### Plan de Upgrade

Si se excede tier gratuito:

**Opción 1: Hugging Face Pro** ($9/mes)
- Inference API sin límites
- Sin cold starts
- Modelos privados

**Opción 2: Render Starter** ($7/mes)
- 512MB RAM garantizada
- No sleep
- Métricas avanzadas

**Opción 3: Self-hosted** (VPS €4.50/mes)
- Ejecutar modelo localmente
- Sin límites de requests
- Más control

---

## 🧪 Testing

### Unit Tests (Opcional)

Estructura para tests:

```javascript
// tests/llmService.test.js
const { generateResponse } = require('../services/llmService');

test('should generate response', async () => {
  const prompt = 'Test prompt';
  const response = await generateResponse(prompt);
  expect(response).toBeDefined();
  expect(response.length).toBeGreaterThan(0);
});
```

Ejecutar:
```bash
npm test
```

### Integration Tests

```bash
# Test completo del flujo
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

---

## 📚 Recursos

- **Hugging Face Docs**: https://huggingface.co/docs/api-inference/
- **Flan-T5 Model**: https://huggingface.co/google/flan-t5-large
- **Render Docs**: https://render.com/docs
- **Express.js**: https://expressjs.com/

---

## 🤝 Contribución

Este es un proyecto académico (TFG). Para sugerencias:

1. Abrir issue describiendo la mejora
2. Fork del repositorio
3. Crear branch: `git checkout -b feature/mejora`
4. Commit: `git commit -m "Add mejora"`
5. Push: `git push origin feature/mejora`
6. Abrir Pull Request

---

## 📄 Licencia

MIT License

Copyright (c) 2025 Nicolás Alejandro Zabala

---

## ✅ Checklist de Deployment

- [ ] Cuenta en Hugging Face creada
- [ ] API key de HF obtenido
- [ ] Código testeado localmente
- [ ] Variables de entorno configuradas
- [ ] Repositorio GitHub creado
- [ ] Servicio en Render creado
- [ ] Environment variables en Render configuradas
- [ ] Deployment exitoso
- [ ] Health check verificado
- [ ] Endpoint `/api/chat` testeado
- [ ] URL anotada para frontend
- [ ] (Opcional) Cron job configurado para ping

---

**Última actualización**: 15 de noviembre de 2025
**Versión**: 1.0.0
**Autor**: Nicolás Alejandro Zabala
