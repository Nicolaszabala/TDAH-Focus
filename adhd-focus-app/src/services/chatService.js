import { ASSISTANT_PATTERNS } from '../utils/constants';

/**
 * Chat Service with LLM Integration
 *
 * This service provides conversational assistant for ADHD support with two modes:
 * 1. LLM Mode: Uses backend API with Hugging Face Flan-T5 for natural responses
 * 2. Offline Mode: Uses local pattern matching with full ADHD knowledge base
 *
 * PRIVACY: Only sends metadata (task counts, session counts) to backend, NOT task content
 */

import {
  getOptimizedKnowledge,
  detectPattern as detectKnowledgePattern,
  getCoreKnowledge,
} from '../knowledge';

// Disable console logs in production
const DEBUG = true; // ACTIVADO PARA DIAGNÓSTICO

// Backend API configuration
// IMPORTANT: Change this to your deployed Render.com URL
// For Expo Go, always use production URL (localhost not accessible from phone/emulator)
// For local development with running backend, set USE_LOCAL_BACKEND = true
const USE_LOCAL_BACKEND = false; // Set to true only if running backend locally on same machine

const API_URL = USE_LOCAL_BACKEND
  ? 'http://localhost:3000/api/chat' // Development (local backend - only for emulator)
  : 'https://tdah-focus.onrender.com/api/chat'; // Production (Render.com)

const API_TIMEOUT = 60000; // 60 seconds (Render Cold Start safe)

// Connection state management
let connectionState = {
  isOnline: true,        // Assume online initially
  lastOnline: null,      // Last time we had successful connection
  lastOffline: null,     // Last time we went offline
  hasShownOfflineMsg: false,  // Track if we've shown offline message
  hasShownOnlineMsg: false,   // Track if we've shown online message
};

/**
 * Get offline notification message
 * @returns {Object} - Offline notification message
 */
function getOfflineNotification() {
  return {
    text: '🔌 **Modo Offline Activado**\n\nNo puedo conectarme al servidor en este momento, pero seguiré ayudándote usando mi conocimiento local sobre TDAH.\n\n✅ Todo sigue funcionando normalmente\n✅ Tus datos están seguros y no se envían a ningún servidor\n✅ Respondo con el mismo conocimiento científico',
    pattern: null,
    source: 'system',
    isSystemMessage: true,
    messageType: 'offline',
  };
}

/**
 * Get online notification message
 * @returns {Object} - Online notification message
 */
function getOnlineNotification() {
  return {
    text: '✨ **Conexión Restaurada**\n\n¡Vuelvo a estar conectado al servidor! Ahora puedo usar respuestas mejoradas con el modelo de lenguaje.\n\nSigueme consultando lo que necesites.',
    pattern: null,
    source: 'system',
    isSystemMessage: true,
    messageType: 'online',
  };
}
export async function processMessage(userMessage, context = {}) {
  if (!userMessage || userMessage.trim().length === 0) {
    return {
      text: 'Por favor escribe algo para que pueda ayudarte.',
      pattern: null,
      source: 'validation',
    };
  }

  // Try LLM API first
  try {
    const llmResponse = await callLLMAPI(userMessage, context);

    // LLM succeeded - check if we were offline before
    if (!connectionState.isOnline && !connectionState.hasShownOnlineMsg) {
      // We just came back online!
      connectionState.isOnline = true;
      connectionState.lastOnline = new Date();
      connectionState.hasShownOnlineMsg = true;
      connectionState.hasShownOfflineMsg = false; // Reset offline flag

      if (DEBUG) console.log('[ChatService] ✅ Connection restored to LLM backend');

      // Return a special response that includes both the online notification and the actual response
      return {
        text: llmResponse.text,
        pattern: llmResponse.pattern,
        source: llmResponse.source,
        processingTime: llmResponse.processingTime,
        connectionRestored: true, // Signal to UI to show restoration message
      };
    }

    // Mark as online if not already
    if (!connectionState.isOnline) {
      connectionState.isOnline = true;
      connectionState.lastOnline = new Date();
      if (DEBUG) console.log('[ChatService] ✅ LLM backend is now online');
    }

    return llmResponse;
  } catch (error) {
    // FORCE LOGGING ERROR EVEN IN PRODUCTION FOR DIAGNOSIS
    console.error('❌ CRITICAL LLM API ERROR:', error);
    console.error('❌ URL:', API_URL);

    // Log error details to console (for debugging), but DON'T show to user
    if (DEBUG) console.log('[ChatService] ⚠️ LLM API failed, using offline mode:', error.message);

    // Check if we just went offline
    if (connectionState.isOnline && !connectionState.hasShownOfflineMsg) {
      // We just went offline!
      connectionState.isOnline = false;
      connectionState.lastOffline = new Date();
      connectionState.hasShownOfflineMsg = true;
      connectionState.hasShownOnlineMsg = false; // Reset online flag

      if (DEBUG) console.log('[ChatService] 🔌 Switched to offline mode');

      // Return a special response that includes both the offline notification and the actual response
      const offlineResponse = processMessageLocal(userMessage, context);
      return {
        text: offlineResponse.text,
        pattern: offlineResponse.pattern,
        source: 'offline',
        connectionLost: true, // Signal to UI to show offline message
      };
    }

    // Already offline, just process normally
    if (!connectionState.isOnline) {
      connectionState.lastOffline = new Date();
    }

    // Fallback to local pattern-based response
    return processMessageLocal(userMessage, context);
  }
}

/**
 * Call LLM backend API
 * @param {string} userMessage - User's message
 * @param {Object} context - App context
 * @returns {Promise<Object>} - Response object
 */
async function callLLMAPI(userMessage, context) {
  // Log API URL for debugging
  if (DEBUG) console.log('[ChatService] Calling LLM API:', API_URL);

  // Prepare sanitized context (NO sensitive task content - only metadata)
  const sanitizedContext = {
    tasks: context.tasks?.map(t => ({
      isMandatory: t.isMandatory,
      completed: t.completed,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
      // NOTE: We do NOT send task.title or task.notes for privacy
    })) || [],
    pomodoroSessions: context.pomodoroSessions || 0,
    hasPendingTasks: context.hasPendingTasks || false,
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        context: sanitizedContext,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Log technical errors to console only (NOT shown to user)
      if (DEBUG) console.log(`[ChatService] HTTP Error ${response.status}:`, errorData);

      // Handle specific HTTP errors - throw generic error (details only in logs)
      if (response.status === 503) {
        // Service unavailable - usually backend cold start on Render.com
        if (DEBUG) console.log('[ChatService] Backend is starting up (cold start)');
        throw new Error('Backend unavailable');
      }

      if (response.status === 429) {
        if (DEBUG) console.log('[ChatService] Rate limit exceeded');
        throw new Error('Rate limit exceeded');
      }

      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Handle nested response object (fix for object-in-react-child error)
    let responseText = data.response;
    if (typeof data.response === 'object' && data.response !== null) {
      responseText = data.response.response || JSON.stringify(data.response);
    }

    // Detect pattern for UI badge (optional)
    const pattern = detectPattern(userMessage);

    return {
      text: responseText,
      pattern,
      source: data.cached ? 'cache' : 'llm',
      processingTime: data.processingTime,
    };

  } catch (error) {
    clearTimeout(timeoutId);

    // Log full error for debugging
    if (DEBUG) console.error('[ChatService] LLM API Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Handle specific errors with user-friendly messages
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La consulta está tomando mucho tiempo');
    }

    if (error.message === 'Rate limit exceeded') {
      throw new Error('Has enviado muchas consultas. Espera un momento.');
    }

    if (error.message.includes('Network request failed')) {
      throw new Error('Sin conexión a internet');
    }

    throw error;
  }
}

/**
 * Process message locally using pattern matching (fallback)
 * @param {string} userMessage - User's message
 * @param {Object} context - App context
 * @returns {Object} - Response object
 */
function processMessageLocal(userMessage, context = {}) {
  // Detect pattern in user message
  const pattern = detectPattern(userMessage);

  if (pattern) {
    // Generate contextual response using local logic
    const response = generateLocalResponse(pattern, context);
    return {
      text: response,
      pattern,
      source: 'fallback',
    };
  }

  // No pattern detected, provide general help
  return {
    text: getGeneralHelp(context),
    pattern: null,
    source: 'fallback',
  };
}

/**
 * Analyze user message and detect patterns
 * @param {string} message - User's message
 * @returns {string|null} - Detected pattern key or null
 */
function detectPattern(message) {
  if (ASSISTANT_PATTERNS.PARALYSIS.test(message)) {
    return 'PARALYSIS';
  }
  if (ASSISTANT_PATTERNS.FOCUS_LOSS.test(message)) {
    return 'FOCUS_LOSS';
  }
  if (ASSISTANT_PATTERNS.INDECISION.test(message)) {
    return 'INDECISION';
  }
  if (ASSISTANT_PATTERNS.MOTIVATION.test(message)) {
    return 'MOTIVATION';
  }
  return null;
}

/**
 * Generate local response based on detected pattern and context
 * Uses ADHD knowledge base for more comprehensive responses
 * @param {string} pattern - Detected pattern key
 * @param {Object} context - App context (tasks, pomodoro state, etc.)
 * @returns {string} - Response message
 */
function generateLocalResponse(pattern, context = {}) {
  const { tasks = [], pomodoroSessions = 0, hasPendingTasks = false } = context;

  // Map UI patterns to knowledge base patterns
  const patternMap = {
    'PARALYSIS': 'paralisis_ejecutiva',
    'FOCUS_LOSS': 'foco',
    'INDECISION': 'indecision',
    'MOTIVATION': 'desmotivacion',
  };

  const knowledgePattern = patternMap[pattern];

  // Base response from knowledge base
  let baseKnowledge = '';
  if (knowledgePattern) {
    // Get pattern-specific knowledge from knowledge base
    const patternKnowledge = getOptimizedKnowledge(`ayuda con ${knowledgePattern}`);
    baseKnowledge = patternKnowledge;
  }

  // Add contextual information from app state
  let contextualInfo = '';

  switch (pattern) {
    case 'PARALYSIS':
      // Executive dysfunction: Help break down tasks
      if (hasPendingTasks) {
        const obligatoryTasks = tasks.filter(t => t.isMandatory && !t.completed);
        if (obligatoryTasks.length > 0) {
          contextualInfo = `\n\n📋 **TU SITUACIÓN ACTUAL:**\nTienes ${obligatoryTasks.length} tarea(s) obligatoria(s) pendientes.\n\n✅ **ACCIÓN INMEDIATA:**\n1. Elige la más corta o urgente\n2. Divídela en pasos de 5 minutos\n3. Haz un Pomodoro de 25 min en el primer paso`;
        } else {
          contextualInfo = `\n\n📋 **TU SITUACIÓN ACTUAL:**\nTienes tareas pendientes.\n\n✅ **ACCIÓN INMEDIATA:**\nElige UNA tarea (la más pequeña) y comprométete a solo 5 minutos.`;
        }
      } else {
        contextualInfo = `\n\n✨ ¡Bien hecho! No tienes tareas pendientes.\n\nSi algo nuevo te bloquea:\n• Escríbela en Tareas primero\n• Divídela en pasos pequeños\n• Usa Pomodoro para el primer paso`;
      }
      break;

    case 'FOCUS_LOSS':
      // Attention issues: Suggest focus tools
      contextualInfo = `\n\n🛠️ **HERRAMIENTAS DISPONIBLES:**\n🎯 Modo Concentración: Interfaz minimalista\n⏱️ Pomodoro: 25 min de trabajo + pausas\n🔊 Ambientes Sonoros: Ruido rosa/marrón`;
      break;

    case 'INDECISION':
      // Prioritization issues
      if (hasPendingTasks) {
        const obligatory = tasks.filter(t => t.isMandatory && !t.completed).length;
        const optional = tasks.filter(t => !t.isMandatory && !t.completed).length;

        contextualInfo = `\n\n📋 **TU SITUACIÓN ACTUAL:**\n📌 ${obligatory} tarea(s) obligatoria(s)\n💡 ${optional} tarea(s) opcional(es)\n\n✅ **PRIORIZACIÓN:**\n1️⃣ Obligatorias primero\n2️⃣ Las más cortas primero\n3️⃣ Una a la vez`;
      } else {
        contextualInfo = `\n\n✨ No tienes tareas pendientes.\n\nPara nuevas tareas:\n• Márcalas Obligatorias si son urgentes\n• Las obligatorias siempre van primero`;
      }
      break;

    case 'MOTIVATION':
      // Low motivation: Gamification and positive reinforcement
      if (pomodoroSessions > 0) {
        contextualInfo = `\n\n🎉 **TU PROGRESO HOY:**\n¡${pomodoroSessions} sesión(es) Pomodoro completadas!\nEso es progreso real.\n\nSi estás agotado, descansa. No es debilidad.`;
      } else {
        contextualInfo = `\n\n💪 **PRIMER PASO:**\nEmpieza con solo 5 minutos.\nLa energía viene DESPUÉS de empezar.`;
      }
      break;

    default:
      return null;
  }

  // Combine knowledge base with contextual information
  return baseKnowledge + contextualInfo;
}

/**
 * Get general help response when no pattern is detected
 * Uses core ADHD knowledge for educational context
 * @param {Object} context - App context
 * @returns {string} - General help message
 */
function getGeneralHelp(context = {}) {
  const { hasPendingTasks = false } = context;

  // Get core knowledge from knowledge base
  const coreKnowledge = getCoreKnowledge();

  const intro = `Hola! Soy tu asistente especializado en TDAH adulto.\n\n`;

  const capabilities = `🤝 **PUEDO AYUDARTE CON:**\n• "No sé por dónde empezar" → Parálisis ejecutiva\n• "Estoy distraído" → Pérdida de foco\n• "Qué hago primero" → Priorización\n• "Sin ganas de seguir" → Motivación\n\n`;

  const taskInfo = hasPendingTasks
    ? `📋 Veo que tienes tareas pendientes. Puedo ayudarte a priorizar y organizarte.\n\n`
    : `📋 Cuando crees tareas, puedo ayudarte a organizarte y priorizarlas.\n\n`;

  const knowledgePreview = `💡 **RECUERDA:**\n` +
    `• El TDAH es neurodivergencia, no falla personal\n` +
    `• Los días malos son normales (variabilidad en rendimiento)\n` +
    `• Usa herramientas de la app: Pomodoro, Modo Concentración, Ambientes Sonoros\n\n`;

  const action = `¿En qué te ayudo hoy?`;

  return intro + capabilities + taskInfo + knowledgePreview + action;
}

/**
 * Get suggested quick replies based on context
 * @param {Object} context - App context
 * @returns {Array<string>} - Array of suggested messages
 */
export function getSuggestedReplies(context = {}) {
  const { hasPendingTasks = false } = context;

  const suggestions = [
    'No sé por dónde empezar',
    'Estoy muy distraído',
    'Qué tarea hago primero',
  ];

  if (hasPendingTasks) {
    suggestions.push('Ayúdame a priorizar');
  }

  return suggestions;
}

/**
 * Test backend connectivity
 * @returns {Promise<boolean>} - True if backend is reachable
 */
export async function testBackendConnection() {
  try {
    const healthUrl = API_URL.replace('/api/chat', '/health');
    const response = await fetch(healthUrl, {
      method: 'GET',
      timeout: 5000,
    });

    return response.ok;
  } catch (error) {
    if (DEBUG) console.log('Backend not reachable:', error.message);
    return false;
  }
}

/**
 * Get current connection state
 * @returns {Object} - Connection state
 */
export function getConnectionState() {
  return {
    isOnline: connectionState.isOnline,
    lastOnline: connectionState.lastOnline,
    lastOffline: connectionState.lastOffline,
  };
}

/**
 * Reset connection state notifications
 * Call this when user dismisses a connection status message
 */
export function resetConnectionNotifications() {
  connectionState.hasShownOfflineMsg = false;
  connectionState.hasShownOnlineMsg = false;
}

export {
  getOfflineNotification,
  getOnlineNotification,
};

export default {
  processMessage,
  getSuggestedReplies,
  testBackendConnection,
  getConnectionState,
  resetConnectionNotifications,
  getOfflineNotification,
  getOnlineNotification,
};
