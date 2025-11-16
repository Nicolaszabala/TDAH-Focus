const { getADHDKnowledge } = require('../knowledge/adhd-knowledge-base');
const { getAppTutorial, getTutorialSection, detectAppQuestion } = require('../knowledge/app-user-tutorial');

/**
 * Build contextualized prompt for ADHD assistant
 *
 * This service constructs prompts that:
 * 1. Provide system instructions for ADHD-specific guidance
 * 2. Include relevant context (task counts, Pomodoro sessions)
 * 3. Inject specialized ADHD knowledge base
 * 4. Guide the LLM to generate detailed, actionable responses
 *
 * @param {string} userMessage - User's message/question
 * @param {Object} context - App context (tasks, pomodoro state, etc.)
 * @returns {string} - Formatted prompt for LLM
 */
function buildPrompt(userMessage, context = {}) {
  const { tasks = [], pomodoroSessions = 0, hasPendingTasks = false } = context;

  // Detect if user is asking about app functionality
  const appQuestionDetection = detectAppQuestion(userMessage);

  // If it's a question about the app, provide tutorial context
  if (appQuestionDetection && appQuestionDetection.isAppQuestion) {
    return buildAppTutorialPrompt(userMessage, appQuestionDetection.screen);
  }

  // Detect if question is completely off-topic (NOT about ADHD, productivity, or the app)
  const offTopicDetection = detectOffTopicQuestion(userMessage);
  if (offTopicDetection) {
    return buildOffTopicResponse(userMessage);
  }

  // Otherwise, build standard ADHD support prompt
  // Extract relevant task statistics (NO sensitive content)
  // Handle both formats: tasks array OR simple counts
  let obligatoryTasks, optionalTasks, completedToday, totalPending;

  if (Array.isArray(tasks) && tasks.length > 0) {
    // Frontend format: array of task objects
    obligatoryTasks = tasks.filter(t => t.isMandatory && !t.completed).length;
    optionalTasks = tasks.filter(t => !t.isMandatory && !t.completed).length;
    completedToday = tasks.filter(t => t.completed && isToday(t.completedAt)).length;
    totalPending = obligatoryTasks + optionalTasks;
  } else {
    // Test format: simple counts (for curl tests)
    obligatoryTasks = context.mandatoryTasks || 0;
    optionalTasks = (context.totalTasks || 0) - (context.mandatoryTasks || 0);
    completedToday = context.completedTasks || 0;
    totalPending = context.totalTasks || 0;
  }

  // Build context summary
  const contextSummary = buildContextSummary({
    obligatoryTasks,
    optionalTasks,
    completedToday,
    pomodoroSessions,
    totalPending,
  });

  // Note: Knowledge base is available for reference but NOT injected directly
  // to avoid the LLM regurgitating it

  // Ultra-simplified prompt for small LLM (Llama 1B)
  // Build context sentence INSIDE the user question for better comprehension
  let contextPrefix = '';
  if (totalPending > 0) {
    contextPrefix = `[El usuario tiene ${obligatoryTasks} tareas obligatorias y ${optionalTasks} opcionales pendientes] `;
  } else {
    contextPrefix = `[El usuario NO tiene tareas pendientes actualmente] `;
  }

  const systemPrompt = `Pregunta del usuario: ${contextPrefix}${userMessage}

Eres asistente TDAH. Responde en español (120-150 palabras).
- Reconoce sus tareas pendientes si las tiene
- Da 2 estrategias prácticas
- Sugiere: Pomodoro (25min), Modo Concentración, o Ruido Rosa
- NO empieces con "Claro" ni "Te explico"
- Empieza directo con validación o consejo

Respuesta:`;

  return systemPrompt;
}

/**
 * Build prompt for app tutorial questions
 * This prompt guides the LLM to respond from USER PERSPECTIVE, not technical implementation
 * @param {string} userMessage - User's question about the app
 * @param {string} screen - Which screen/feature they're asking about
 * @returns {string} - Tutorial prompt
 */
function buildAppTutorialPrompt(userMessage, screen) {
  // Get ONLY relevant tutorial section (NOT the entire tutorial)
  let tutorialContent = '';

  if (screen === 'general') {
    // For general questions, provide concise overview only
    tutorialContent = `La app ADHD Focus tiene 5 funcionalidades principales:
1. **Gestión de Tareas**: Crea tareas obligatorias (rojas) y opcionales (azules)
2. **Temporizador Pomodoro**: Trabaja 25 minutos concentrado, luego descansa 5-10 min
3. **Modo Concentración**: Bloquea distracciones, enfoca en una tarea
4. **Ambientes Sonoros**: Ruido rosa y marrón para mejorar concentración
5. **Asistente TDAH**: Ayuda con parálisis ejecutiva, pérdida de foco, priorización

Navegas con 5 botones en la barra inferior: Inicio, Tareas, Pomodoro, Asistente, Más.`;
  } else {
    // For specific screens, get ONLY that section (already extracted by getTutorialSection)
    const fullSection = getTutorialSection(screen);

    // Further truncate: only keep first 400 characters to save tokens
    tutorialContent = fullSection.substring(0, 600) + '...';
  }

  const systemPrompt = `Eres un asistente para una app de TDAH. El usuario pregunta cómo usarla.

CONTEXTO BREVE:
${tutorialContent}

PREGUNTA:
"${userMessage}"

INSTRUCCIONES:
- Responde en español, tono amigable
- Máximo 120 palabras
- Explica paso a paso QUÉ HACER (no código técnico)
- Menciona qué VE en pantalla (botones, colores)
- NO uses markdown headers ni prefijos como "Respuesta:"
- Habla en segunda persona ("tú tocas", "verás")
- Termina con oración completa

Respuesta directa:`;

  return systemPrompt;
}

/**
 * Build context summary from user stats
 * @param {Object} stats - User statistics
 * @returns {string} - Formatted context summary
 */
function buildContextSummary(stats) {
  const {
    obligatoryTasks,
    optionalTasks,
    completedToday,
    pomodoroSessions,
    totalPending,
  } = stats;

  const lines = [];

  // Task status
  if (totalPending === 0) {
    lines.push('✅ No tiene tareas pendientes actualmente');
  } else {
    if (obligatoryTasks > 0) {
      lines.push(`📌 ${obligatoryTasks} tarea(s) obligatoria(s) pendiente(s)`);
    }
    if (optionalTasks > 0) {
      lines.push(`💡 ${optionalTasks} tarea(s) opcional(es) pendiente(s)`);
    }
  }

  // Progress today
  if (completedToday > 0) {
    lines.push(`✔️  ${completedToday} tarea(s) completada(s) hoy`);
  }

  if (pomodoroSessions > 0) {
    lines.push(`⏱️  ${pomodoroSessions} sesión(es) Pomodoro completada(s) hoy`);
  }

  // If no activity today
  if (completedToday === 0 && pomodoroSessions === 0) {
    lines.push('📊 Aún no ha registrado actividad hoy');
  }

  return lines.join('\n');
}

/**
 * Check if a timestamp is from today
 * @param {string|Date} timestamp - Timestamp to check
 * @returns {boolean} - True if today
 */
function isToday(timestamp) {
  if (!timestamp) return false;

  try {
    const today = new Date().toDateString();
    const date = new Date(timestamp).toDateString();
    return today === date;
  } catch (error) {
    return false;
  }
}

/**
 * Build a simplified prompt for testing
 * @param {string} message - Test message
 * @returns {string} - Simple prompt
 */
function buildTestPrompt(message) {
  return `Eres un asistente para personas con TDAH. Responde de forma breve y práctica (máximo 50 palabras) a: "${message}"`;
}

/**
 * Validate context object
 * @param {Object} context - Context to validate
 * @returns {Object} - Validated/sanitized context
 */
function validateContext(context) {
  if (!context || typeof context !== 'object') {
    return { tasks: [], pomodoroSessions: 0, hasPendingTasks: false };
  }

  return {
    tasks: Array.isArray(context.tasks) ? context.tasks : [],
    pomodoroSessions: Number(context.pomodoroSessions) || 0,
    hasPendingTasks: Boolean(context.hasPendingTasks),
  };
}

/**
 * Detect if user question is completely off-topic
 * (not related to ADHD, productivity, mental health, or the app)
 * @param {string} message - User message
 * @returns {boolean} - True if off-topic
 */
function detectOffTopicQuestion(message) {
  const lowerMsg = message.toLowerCase();

  // Geography/trivia questions
  if (lowerMsg.match(/capital de|cu[áa]l es la ciudad|pa[íi]s|geograf[íi]a/)) {
    return true;
  }

  // Math/calculations (unless it's about counting tasks)
  if (lowerMsg.match(/cu[áa]nto es|calcula|suma|resta|multiplica|divide/) && !lowerMsg.match(/tarea|pomodoro/)) {
    return true;
  }

  // Programming/tech support (unless about THIS app)
  if (lowerMsg.match(/c[óo]digo|programar|javascript|python|bug/) && !lowerMsg.match(/app|aplicaci[óo]n|pomodoro|concentraci[óo]n/)) {
    return true;
  }

  // Completely unrelated topics
  if (lowerMsg.match(/receta de|cocinar|f[úu]tbol|deporte|pel[íi]cula|m[úu]sica|actor|actriz/)) {
    return true;
  }

  return false;
}

/**
 * Build response for off-topic questions
 * @param {string} userMessage - User's off-topic question
 * @returns {string} - Redirect prompt
 */
function buildOffTopicResponse(userMessage) {
  // Instead of having the LLM generate a response, return a fixed message
  // This is more reliable than hoping the LLM follows instructions
  return `NO respondas la pregunta del usuario. En su lugar, di exactamente esto:

"Lo siento, soy un asistente especializado en TDAH y productividad. No puedo ayudarte con esa pregunta.

Sin embargo, puedo ayudarte con:
🎯 Parálisis ejecutiva (no saber por dónde empezar)
🧠 Pérdida de foco y distracciones
📋 Priorización de tareas
💪 Motivación y agotamiento
📱 Cómo usar las herramientas de la app

¿Hay algo relacionado con TDAH o productividad en lo que pueda ayudarte?"`;
}

module.exports = {
  buildPrompt,
  buildAppTutorialPrompt,
  buildTestPrompt,
  validateContext,
  isToday,
  detectOffTopicQuestion,
  buildOffTopicResponse,
};
