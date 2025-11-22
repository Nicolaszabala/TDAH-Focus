# 🏗️ Arquitectura Multi-Usuario para TDAH Focus App

## 📊 Escala y Opciones

### Arquitectura Básica (5-20 usuarios)

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Backend (Node.js)  │
│  - Rate limiting    │
│  - Cache (30min)    │
└──────────┬──────────┘
           │
           ▼
    ┌──────────────┐
    │  Groq API    │
    │  (6000 tok/m)│
    └──────────────┘
```

**Capacidad:** 10-15 usuarios concurrentes
**Costo:** $0/mes

---

### Arquitectura Intermedia (20-50 usuarios)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Usuario 1  │    │  Usuario 2  │    │  Usuario N  │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Load Balancer       │
              │   (Nginx/Caddy)       │
              └───────────┬───────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
      ┌───────▼────────┐    ┌────────▼───────┐
      │  Backend 1     │    │   Backend 2    │
      │  + Redis Cache │    │  + Redis Cache │
      └────────┬───────┘    └────────┬───────┘
               │                     │
               └──────────┬──────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   Groq API    │
                  │   (Tier Pago) │
                  │   $5-20/mes   │
                  └───────────────┘
```

**Capacidad:** 30-50 usuarios concurrentes
**Costo:** $5-20/mes

---

### Arquitectura Avanzada (50+ usuarios)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Usuario  │  │ Usuario  │  │ Usuario  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   CDN / CloudFlare  │
         │   (Cache estático)  │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Load Balancer      │
         │  (Auto-scaling)     │
         └──────────┬──────────┘
                    │
       ┌────────────┼────────────┐
       │            │            │
   ┌───▼──┐    ┌───▼──┐    ┌───▼──┐
   │ BE 1 │    │ BE 2 │    │ BE N │
   └───┬──┘    └───┬──┘    └───┬──┘
       │           │            │
       └───────────┼────────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
   ┌───▼─────────┐   ┌─────────▼────┐
   │ Redis Cache │   │ PostgreSQL   │
   │ (Respuestas)│   │ (Usuarios)   │
   └─────────────┘   └──────────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
   ┌───▼──────────┐  ┌─────────▼────────┐
   │  Groq API    │  │ Oracle Cloud LLM │
   │  (Primario)  │  │  (Backup + RAG)  │
   └──────────────┘  └──────────────────┘
```

**Capacidad:** 100+ usuarios concurrentes
**Costo:** $20-100/mes

---

## 🔧 Implementación por Componentes

### 1. Rate Limiting (Ya lo tienes)

Tu `rateLimit.js` actual:

```javascript
// middleware/rateLimit.js (línea 10-12)
windowMs: 1 * 60 * 1000,     // 1 minuto
max: 20,                      // 20 requests/minuto por IP
```

**Para multi-usuario, aumenta:**

```javascript
max: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60,  // 60 req/min
```

### 2. Cache de Respuestas (Ya lo tienes)

Tu `cache.js` funciona bien para multi-usuario.

**Optimización para más usuarios:**

```javascript
// utils/cache.js
// Aumenta TTL para consultas comunes
set(key, value, ttlSeconds = 7200) {  // Era 3600, ahora 2 horas
  const expiry = Date.now() + (ttlSeconds * 1000);
  this.cache.set(key, { value, expiry, createdAt: Date.now() });
}
```

### 3. Cola de Procesamiento (Para escalar)

Si tienes muchos usuarios y respuestas lentas, implementa cola:

**Instala Bull:**

```bash
npm install bull redis
```

**Crea `services/llmQueue.js`:**

```javascript
const Queue = require('bull');
const llmService = require('./llmService-groq');

// Crear cola Redis
const llmQueue = new Queue('llm-requests', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Procesar trabajos
llmQueue.process(async (job) => {
  const { prompt, userId } = job.data;

  const result = await llmService.generateResponse(prompt);

  return {
    userId,
    response: result.response,
    timestamp: Date.now()
  };
});

// Agregar trabajo a cola
async function queueRequest(prompt, userId) {
  const job = await llmQueue.add({
    prompt,
    userId
  }, {
    attempts: 3,           // Reintentos
    backoff: 5000,        // Espera entre reintentos
    removeOnComplete: true // Limpia completados
  });

  return job.id;
}

// Obtener resultado
async function getResult(jobId) {
  const job = await llmQueue.getJob(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();

  if (state === 'completed') {
    return {
      status: 'completed',
      result: job.returnvalue
    };
  }

  if (state === 'failed') {
    return {
      status: 'failed',
      error: job.failedReason
    };
  }

  // Calculando posición en cola
  const waiting = await llmQueue.getWaiting();
  const position = waiting.findIndex(j => j.id === jobId) + 1;

  return {
    status: 'processing',
    position: position,
    estimatedTime: position * 2  // 2 segundos promedio/request
  };
}

module.exports = {
  queueRequest,
  getResult
};
```

**Endpoints nuevos en `routes/chat.js`:**

```javascript
// POST /api/chat/queue - Agregar a cola
router.post('/queue', async (req, res) => {
  const { message } = req.body;
  const userId = req.user?.id || req.ip;

  const jobId = await llmQueue.queueRequest(message, userId);

  res.json({
    jobId,
    status: 'queued',
    message: 'Request en cola, usa /chat/status/{jobId} para ver progreso'
  });
});

// GET /api/chat/status/:jobId - Ver estado
router.get('/status/:jobId', async (req, res) => {
  const result = await llmQueue.getResult(req.params.jobId);

  res.json(result);
});
```

**Frontend polling:**

```javascript
// En tu app React Native
async function sendMessageWithQueue(message) {
  // 1. Encolar request
  const { jobId } = await fetch('/api/chat/queue', {
    method: 'POST',
    body: JSON.stringify({ message })
  }).then(r => r.json());

  // 2. Poll status cada 2 segundos
  const checkStatus = async () => {
    const status = await fetch(`/api/chat/status/${jobId}`)
      .then(r => r.json());

    if (status.status === 'completed') {
      return status.result.response;
    }

    if (status.status === 'failed') {
      throw new Error(status.error);
    }

    // Aún procesando
    console.log(`Posición en cola: ${status.position}`);
    await sleep(2000);
    return checkStatus();
  };

  return checkStatus();
}
```

### 4. Monitoreo de Usuarios Activos

**Crea `middleware/activeUsers.js`:**

```javascript
const activeUsers = new Map();

function trackUser(req, res, next) {
  const userId = req.user?.id || req.ip;

  activeUsers.set(userId, {
    lastSeen: Date.now(),
    requests: (activeUsers.get(userId)?.requests || 0) + 1
  });

  // Limpiar usuarios inactivos (>5 min)
  for (const [id, data] of activeUsers.entries()) {
    if (Date.now() - data.lastSeen > 5 * 60 * 1000) {
      activeUsers.delete(id);
    }
  }

  next();
}

function getActiveUsersCount() {
  return activeUsers.size;
}

module.exports = {
  trackUser,
  getActiveUsersCount,
  activeUsers
};
```

**Endpoint de estadísticas:**

```javascript
// routes/chat.js
const { getActiveUsersCount } = require('../middleware/activeUsers');

router.get('/stats', (req, res) => {
  res.json({
    activeUsers: getActiveUsersCount(),
    cacheStats: cache.getStats(),
    uptime: process.uptime()
  });
});
```

---

## 💰 Costos por Escala

### Escenario 1: 10 usuarios
**Opción:** Groq API (tier gratuito)
- Requests/día: ~1,000
- Costo: **$0/mes**

### Escenario 2: 50 usuarios
**Opción:** Groq API (tier de pago)
- Requests/día: ~5,000
- Tokens/día: ~2.5M
- Costo: **~$10-15/mes**

### Escenario 3: 200 usuarios
**Opción:** Groq + Oracle Cloud + Redis
- Groq: ~$30/mes
- Oracle Cloud: $0 (Free Tier)
- Redis Cloud: $0 (Free Tier 30MB)
- **Total: ~$30/mes**

### Escenario 4: 1000+ usuarios
**Opción:** Infraestructura completa
- Groq API: $100-200/mes
- Oracle Cloud: $50/mes (upgraded)
- Redis Cloud: $10/mes
- CloudFlare: $0 (Free)
- Monitoring (Sentry): $0-25/mes
- **Total: ~$160-285/mes**

---

## 📊 Métricas a Monitorear

### 1. Usuarios Activos

```javascript
// Dashboard simple
app.get('/dashboard', (req, res) => {
  const stats = {
    activeUsers: getActiveUsersCount(),
    requestsPerMinute: calculateRPM(),
    avgResponseTime: getAvgResponseTime(),
    cacheHitRate: cache.getStats().hitRate,
    errorRate: getErrorRate()
  };

  res.json(stats);
});
```

### 2. Alertas

**Instala Sentry (gratis hasta 5K eventos/mes):**

```bash
npm install @sentry/node
```

```javascript
// server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

// Alerta si muchos errores
app.use(Sentry.Handlers.errorHandler());
```

---

## 🎯 Recomendación Final

### Para tu caso (empezando):

**FASE 1: MVP (0-20 usuarios)**
```
Backend actual + Groq API
- Costo: $0
- Setup: 5 minutos
- Capacidad: 15 usuarios concurrentes
```

**FASE 2: Crecimiento (20-100 usuarios)**
```
Backend + Groq API (tier pago) + Redis Cache
- Costo: $10-20/mes
- Setup: 1-2 horas
- Capacidad: 50-100 usuarios
```

**FASE 3: Escala (100+ usuarios)**
```
Load Balancer + Multiple Backends + Groq + Oracle Cloud
- Costo: $50-100/mes
- Setup: 1-2 días
- Capacidad: 200+ usuarios
```

---

## ✅ Checklist Multi-Usuario

### Básico (Implementa YA)
- [x] Rate limiting (ya lo tienes)
- [x] Cache (ya lo tienes)
- [ ] Groq API (5 minutos)
- [ ] Monitoreo de usuarios activos

### Intermedio (Si creces)
- [ ] Redis para cache distribuido
- [ ] Cola de procesamiento (Bull)
- [ ] Logging estructurado
- [ ] Métricas (Prometheus/Grafana)

### Avanzado (Si escalas mucho)
- [ ] Load balancer
- [ ] Auto-scaling
- [ ] CDN para estáticos
- [ ] Database para usuarios
- [ ] Autenticación robusta

---

## 🆘 Troubleshooting Multi-Usuario

### Problema: "Respuestas lentas con muchos usuarios"

**Diagnóstico:**
```bash
# Ver usuarios activos
curl http://localhost:3000/api/chat/stats

# Ver rate de requests
pm2 monit
```

**Soluciones:**
1. Aumenta cache TTL
2. Implementa cola (Bull)
3. Upgrade a Groq tier de pago
4. Agrega más instancias backend

### Problema: "Rate limit excedido de Groq"

**Soluciones:**
1. Tier de pago ($5-10/mes)
2. Implementa fallback a Oracle Cloud
3. Cache más agresivo

### Problema: "Usuarios experimentan timeouts"

**Soluciones:**
1. Aumenta timeout en frontend
2. Implementa polling (cola)
3. Muestra loading state mejor

---

## 📚 Recursos

- **Bull Queue:** https://github.com/OptimalBits/bull
- **Redis:** https://redis.io/docs/getting-started/
- **Groq Pricing:** https://console.groq.com/settings/billing
- **Sentry:** https://sentry.io/welcome/

---

## 🚀 Próximo Paso

**Si tienes <20 usuarios:**
→ Solo implementa Groq API (ya estás listo)

**Si planeas 20-100 usuarios:**
→ Implementa Groq + Redis + Monitoring

**Si planeas 100+ usuarios:**
→ Lee esta guía completa e implementa arquitectura avanzada

**Empezar hoy:**
```bash
# 1. Groq API (5 min)
cat SETUP_GROQ_RAPIDO.md

# 2. Monitoreo básico (10 min)
# Implementa trackUser middleware

# 3. Dashboard (opcional)
# Crea endpoint /stats
```

¡Listo para escalar! 📈
