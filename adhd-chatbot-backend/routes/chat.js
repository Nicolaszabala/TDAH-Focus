const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/llmService');
const { buildPrompt, validateContext } = require('../services/promptBuilder');
const { cache, generateCacheKey } = require('../utils/cache');
const { limiter } = require('../middleware/rateLimit');

// Apply rate limiting to all chat routes
router.use(limiter);

/**
 * POST /api/chat
 *
 * Request body:
 * {
 *   message: string,        // User's message (required)
 *   context: {              // App context (optional)
 *     tasks: Array,
 *     pomodoroSessions: number,
 *     hasPendingTasks: boolean
 *   }
 * }
 *
 * Response:
 * {
 *   response: string,       // Generated response
 *   cached: boolean,        // Whether response was from cache
 *   processingTime: number  // Time in milliseconds
 * }
 */
router.post('/', async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, context } = req.body;

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'El campo "message" es requerido y debe ser un texto válido.',
      });
    }

    // Trim and validate message length
    const userMessage = message.trim();
    if (userMessage.length > 500) {
      return res.status(400).json({
        error: 'Message too long',
        message: 'El mensaje es demasiado largo. Por favor, usa máximo 500 caracteres.',
      });
    }

    // Validate and sanitize context
    const validatedContext = validateContext(context);

    // Generate cache key
    const cacheKey = generateCacheKey(userMessage, validatedContext);

    // Check cache first
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      console.log('✅ Cache hit');
      return res.json({
        response: cachedResponse,
        cached: true,
        processingTime: Date.now() - startTime,
      });
    }

    console.log('❌ Cache miss - calling LLM');

    // Build prompt with context
    const prompt = buildPrompt(userMessage, validatedContext);

    // Generate response using LLM
    const llmResponse = await generateResponse(prompt);

    // Cache the response (1 hour TTL)
    const cacheTTL = parseInt(process.env.CACHE_TTL_SECONDS) || 3600;
    cache.set(cacheKey, llmResponse, cacheTTL);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Response generated in ${processingTime}ms`);

    res.json({
      response: llmResponse,
      cached: false,
      processingTime,
    });

  } catch (error) {
    console.error('❌ Chat endpoint error:', error.message);

    // Check if it's an LLM error (use fallback)
    if (error.message.includes('Failed to generate response')) {
      const fallbackResponse = getFallbackResponse(req.body.message);

      return res.json({
        response: fallbackResponse,
        cached: false,
        fallback: true,
        processingTime: Date.now() - startTime,
      });
    }

    // Other errors
    res.status(500).json({
      error: 'Internal server error',
      message: 'Ocurrió un error al procesar tu consulta. Por favor, intenta de nuevo.',
      fallback: getFallbackResponse(req.body.message),
    });
  }
});

/**
 * GET /api/chat/stats
 *
 * Get cache statistics (for monitoring)
 */
router.get('/stats', (req, res) => {
  const stats = cache.getStats();

  res.json({
    cache: stats,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/chat/clear-cache
 *
 * Clear the cache (admin endpoint - protect in production)
 */
router.post('/clear-cache', (req, res) => {
  // In production, add authentication here
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'This endpoint is disabled in production',
    });
  }

  cache.clear();

  res.json({
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Fallback to pattern-based responses when LLM fails
 * This ensures the app always has some response
 */
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  // App functionality questions
  if (/cómo (funciona|uso|usar|se usa)|qué (es|hace|significa)|para qué (sirve|es)|dónde (está|encuentro|veo)/i.test(msg)) {
    if (/tarea|lista/i.test(msg)) {
      return 'Para crear una tarea: toca el botón rojo con "+" en la esquina inferior derecha. Elige si es OBLIGATORIA (rojo) u OPCIONAL (azul). Las obligatorias son prioridad. 📌';
    }
    if (/pomodoro|temporizador/i.test(msg)) {
      return 'El Pomodoro son 25 minutos de trabajo concentrado. Selecciona una tarea, toca "Iniciar" y trabaja hasta que suene. Luego tomas un descanso de 5 o 10 minutos. ⏱️';
    }
    if (/sonido|ruido/i.test(msg)) {
      return 'En Ambientes Sonoros tienes ruido rosa y marrón. Toca la tarjeta del sonido que quieras y luego "Play". Ayudan a concentrarte bloqueando distracciones. 🎧';
    }
    if (/concentración|modo concentr/i.test(msg)) {
      return 'Modo Concentración bloquea la navegación y silencia notificaciones. Seleccionas UNA tarea y te enfocas solo en eso. Para salir, toca el botón rojo. 🎯';
    }
  }

  // Parálisis ejecutiva
  if (/no sé (por dónde|qué) empezar|bloqueado|paralizado|abrumado/i.test(msg)) {
    return 'Cuando te sientas bloqueado, empieza con la tarea MÁS PEQUEÑA. ¿Qué tal un Pomodoro de solo 5 minutos? No necesitas terminar, solo empezar. 🎯';
  }

  // Pérdida de foco
  if (/distraído|perdí (el )?foco|no puedo concentrar|disperso/i.test(msg)) {
    return 'Es normal distraerse con TDAH. Prueba: 🎯 Modo Concentración para eliminar distracciones, ⏱️ Pomodoro de 25 min, o 🔊 Ruido rosa para enmascarar sonidos. ¿Cuál prefieres?';
  }

  // Indecisión / Priorización
  if (/qué (hago|tarea)|cuál (priorizo|primero)|no sé qué hacer/i.test(msg)) {
    return 'Regla simple: 1️⃣ Tareas obligatorias primero, 2️⃣ Las más cortas primero, 3️⃣ Una a la vez. Las tareas obligatorias están marcadas en rojo en tu lista. 📌';
  }

  // Motivación / Agotamiento
  if (/sin ganas|desmotivado|no puedo seguir|cansado|agotado/i.test(msg)) {
    return 'El agotamiento es real, no es pereza. Prueba: toma un descanso SIN pantallas, 10 min de actividad física, luego un Pomodoro corto. No necesitas energía para empezar, la energía viene DESPUÉS. 💪';
  }

  // Procrastinación
  if (/procrastin|posponiendo|aplazando|después/i.test(msg)) {
    return 'Con TDAH, "después" nunca llega. Regla de 2 minutos: comprométete a solo 2 minutos. Usa el temporizador. Generalmente eso basta para romper la inercia. ⏱️';
  }

  // Default response
  return 'Estoy aquí para ayudarte con TDAH. Puedo orientarte cuando:\n\n• No sabes por dónde empezar\n• Estás distraído\n• No sabes qué hacer primero\n• Estás sin energía\n• Tienes dudas sobre cómo usar la app\n\n¿Qué necesitas ahora?';
}

module.exports = router;
