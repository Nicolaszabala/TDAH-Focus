const { getOptimizedKnowledge } = require('../knowledge/adhd-knowledge-base-optimized');

/**
 * Build OPTIMIZED prompt for small LLM models
 * Target: <3000 characters total
 *
 * Changes from original:
 * 1. Simplified structure
 * 2. Pattern-specific knowledge injection
 * 3. Clearer Spanish instruction
 * 4. Reduced verbose guidelines
 */
function buildOptimizedPrompt(userMessage, context = {}) {
  const { tasks = [], pomodoroSessions = 0 } = context;

  // Build compact context
  const obligatory = tasks.filter(t => t.isMandatory && !t.completed).length;
  const optional = tasks.filter(t => !t.isMandatory && !t.completed).length;
  const completed = tasks.filter(t => t.completed && isToday(t.completedAt)).length;

  let contextLine = '';
  if (obligatory + optional === 0) {
    contextLine = 'Sin tareas pendientes.';
  } else {
    const parts = [];
    if (obligatory > 0) parts.push(`${obligatory} obligatoria(s)`);
    if (optional > 0) parts.push(`${optional} opcional(es)`);
    contextLine = `Tareas pendientes: ${parts.join(', ')}.`;
  }

  if (completed > 0) contextLine += ` Completó ${completed} hoy.`;
  if (pomodoroSessions > 0) contextLine += ` ${pomodoroSessions} Pomodoro(s) hoy.`;

  // Get optimized knowledge (pattern-specific)
  const knowledge = getOptimizedKnowledge(userMessage);

  // Simplified, direct prompt
  const prompt = `Eres asistente TDAH adulto. Responde en ESPAÑOL siempre.

${knowledge}

CONTEXTO: ${contextLine}

INSTRUCCIONES:
1. Responde 120-180 palabras
2. Tono empático pero profesional
3. Estructura:
   - Validación (1 línea)
   - Explicación breve por qué pasa (TDAH)
   - 2-3 estrategias concretas
   - Menciona herramienta app (Pomodoro/Modo Concentración/Ambientes Sonoros)
4. Usa emojis estratégicos: 📌 🎯 💡 ⏱️
5. NUNCA diagnostiques ni reemplaces terapia
6. Lenguaje coaching: "podrías...", "funciona..."

CONSULTA: "${userMessage}"

RESPUESTA (español, 120-180 palabras):`;

  return prompt;
}

/**
 * Check if timestamp is from today
 */
function isToday(timestamp) {
  if (!timestamp) return false;
  try {
    const today = new Date().toDateString();
    const date = new Date(timestamp).toDateString();
    return today === date;
  } catch {
    return false;
  }
}

/**
 * Validate context
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

module.exports = {
  buildOptimizedPrompt,
  validateContext,
  isToday,
};
