/**
 * OPTIMIZED ADHD Knowledge Base
 * Compact, focused knowledge for offline assistant
 * Target: <1500 characters per section
 */

const CORE_ADHD_KNOWLEDGE = `CONOCIMIENTO TDAH ADULTO:

FUNDAMENTOS:
- Déficit dopamina → disfunción ejecutiva (planificación, inhibición, memoria trabajo)
- Hipersensibilidad a recompensas inmediatas vs diferidas
- Variabilidad rendimiento es NORMAL (días buenos/malos)

ESTRATEGIAS EFECTIVAS:
Para Parálisis Ejecutiva:
• Regla 2 minutos: compromiso mínimo rompe inercia
• Chunking: micro-tareas 5-10 min
• Externalizar decisiones (listas, alarmas)

Para Foco:
• Pomodoro 25 min (bloques fijos)
• Ambiente minimalista
• Ruido rosa/marrón

Para Emociones:
• Normalizar: neurodivergencia, NO falla personal
• Celebrar micro-wins
• Descanso es necesidad, no debilidad

EVITAR: "concéntrate más", "más disciplina", sistemas complejos

HERRAMIENTAS APP: Pomodoro, Modo Concentración, Ambientes Sonoros`;

const MATE_CORE_CONCEPTS = `SCATTERED MINDS (Maté):
TDAH = auto-regulación deficiente:
- Emocional: reacciones intensas
- Conductual: impulsividad
- Motivacional: dificultad sostener esfuerzo

Sensibilidad aumentada:
- Rechazo (RSD)
- Validación emocional necesaria
- Estrés empeora TODO

SANACIÓN:
✓ Compasión propia (NO más disciplina)
✓ Reducir estrés crónico
✓ Estructura externa está bien
✓ Validar necesidades emocionales`;

// Pattern-specific knowledge (inject only when detected)
const PATTERN_KNOWLEDGE = {
  paralisis_ejecutiva: `
PARÁLISIS EJECUTIVA:
Fenómeno: cerebro TDAH abrumado por demasiadas opciones/pasos → inmovilización
NO es pereza, es sobrecarga sistema ejecutivo

Solución inmediata:
1. Tarea mínima viable: "solo 2 minutos"
2. Elegir UNA cosa (eliminar decisiones)
3. Externalizar: escribir, timer, alarma

Usa Pomodoro app: 25 min elimina indecisión sobre "cuánto tiempo"`,

  foco: `
PÉRDIDA FOCO:
Cerebro TDAH busca novedad (dopamina)
Entorno con distractores = imposible mantener atención

Estrategias:
1. Modo Concentración app: bloquea distracciones digitales
2. Ruido rosa/marrón: enmascara distractores
3. Pomodoro: límite conocido ayuda cerebro
4. Body doubling virtual: trabajar "acompañado"`,

  procrastinacion: `
PROCRASTINACIÓN TDAH:
Raíz: evitación emocional (ansiedad, perfeccionismo, miedo fracaso)
NO es falta voluntad

Estrategia Maté:
- Pregunta: "¿Qué emoción estoy evitando?"
- Compasión: está bien sentir ansiedad
- Acción mínima: romper inercia
- Celebrar inicio (no solo final)

Herramienta: Pomodoro 25min = compromiso pequeño`,

  desmotivacion: `
DESMOTIVACIÓN:
Normal en TDAH: déficit dopamina dificulta motivación sin recompensa inmediata

Reframe:
- NO es que "no te importa"
- ES que tu cerebro necesita estructura diferente

Estrategias:
1. Micro-recompensas frecuentes
2. Recordar logros HOY (app muestra progreso)
3. Reducir expectativas (realista = auto-compasión)
4. Pausas no son debilidad`,

  indecision: `
INDECISIÓN TDAH:
Función ejecutiva débil + miedo elegir "mal" = parálisis decisión

Matriz simple:
- ¿Es obligatorio? → Haz primero
- ¿Toma <5 min? → Haz ahora
- ¿Puedes delegarlo/eliminarlo? → Hazlo

Usa app: Tareas Obligatorias vs Opcionales = externa la decisión`
};

/**
 * Get core knowledge (always included)
 */
export function getCoreKnowledge() {
  return CORE_ADHD_KNOWLEDGE + '\n\n' + MATE_CORE_CONCEPTS;
}

/**
 * Get pattern-specific knowledge
 * @param {string} pattern - Detected pattern (paralisis_ejecutiva, foco, etc)
 */
export function getPatternKnowledge(pattern) {
  return PATTERN_KNOWLEDGE[pattern] || '';
}

/**
 * Detect pattern from user message
 * @param {string} message - User message
 * @returns {string|null} - Detected pattern
 */
export function detectPattern(message) {
  const lowerMsg = message.toLowerCase();

  // Parálisis ejecutiva
  if (lowerMsg.match(/abrumad|por d[oó]nde empez|no s[eé] qu[eé] hacer|bloqueado|paraliz/)) {
    return 'paralisis_ejecutiva';
  }

  // Pérdida de foco
  if (lowerMsg.match(/concentr|distrae?|distracci|foco|atenci[oó]n|desenfoc/)) {
    return 'foco';
  }

  // Procrastinación
  if (lowerMsg.match(/posterg|procrastin|dej.*para (despu[eé]s|luego|ma[ñn]ana)|evit.*tarea/)) {
    return 'procrastinacion';
  }

  // Desmotivación
  if (lowerMsg.match(/desmotiv|sin energ|agotad|cansad|no tengo ganas|sin [aá]nimo/)) {
    return 'desmotivacion';
  }

  // Indecisión
  if (lowerMsg.match(/decidir|no s[eé] cu[aá]l|indecis|prioriz|qu[eé] hago primero/)) {
    return 'indecision';
  }

  return null;
}

/**
 * Get optimized knowledge for a message
 * @param {string} message - User message
 * @returns {string} - Relevant knowledge
 */
export function getOptimizedKnowledge(message) {
  const pattern = detectPattern(message);
  const core = getCoreKnowledge();
  const patternSpecific = pattern ? getPatternKnowledge(pattern) : '';

  return core + (patternSpecific ? '\n\n' + patternSpecific : '');
}

export default {
  getCoreKnowledge,
  getPatternKnowledge,
  detectPattern,
  getOptimizedKnowledge,
  CORE_ADHD_KNOWLEDGE,
  MATE_CORE_CONCEPTS,
  PATTERN_KNOWLEDGE
};
