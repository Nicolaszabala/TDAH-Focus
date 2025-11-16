/**
 * Daily Tips for ADHD Focus App
 * Based on ADHD knowledge base and scientific evidence
 * Tips rotate daily based on current date
 */

/**
 * Collection of daily tips based on ADHD strategies and insights
 * Each tip is grounded in:
 * - Neurobiological understanding of ADHD
 * - Evidence-based strategies (Pomodoro, chunking, etc.)
 * - Dr. Gabor Maté's compassionate approach
 * - Practical tools available in the app
 */
const DAILY_TIPS = [
  // Week 1: Fundamentos y auto-compasión
  {
    id: 1,
    text: 'Tu cerebro TDAH no está roto, solo funciona diferente. Necesita estructura externa, y eso está perfectamente bien.',
    category: 'autocompasion',
  },
  {
    id: 2,
    text: 'La variabilidad en tu rendimiento es normal con TDAH. Los días malos no borran tus logros, solo son parte del proceso.',
    category: 'autocompasion',
  },
  {
    id: 3,
    text: 'Divide tareas grandes en pasos pequeños de 5-10 minutos. Cada micro-tarea completada es un éxito real.',
    category: 'estrategia',
  },
  {
    id: 4,
    text: 'El déficit de dopamina hace difícil empezar tareas. Usa la regla de 2 minutos: comprométete solo con iniciar.',
    category: 'paralisis',
  },
  {
    id: 5,
    text: 'Tu sensibilidad emocional es parte de tu neurobiología, no un defecto. Valida tus emociones con compasión.',
    category: 'emocional',
  },
  {
    id: 6,
    text: 'El descanso no es debilidad, es una necesidad neurológica. Las pausas Pomodoro protegen tu energía mental.',
    category: 'autocompasion',
  },
  {
    id: 7,
    text: 'Externaliza decisiones con listas y alarmas. Tu función ejecutiva necesita apoyo, y usar herramientas es inteligente.',
    category: 'estrategia',
  },

  // Week 2: Estrategias prácticas
  {
    id: 8,
    text: 'La técnica Pomodoro de 25 minutos elimina la indecisión sobre "cuánto tiempo dedicar". Bloques fijos ayudan.',
    category: 'pomodoro',
  },
  {
    id: 9,
    text: 'Un ambiente minimalista reduce sobrecarga cognitiva. Usa el Modo Concentración cuando necesites foco máximo.',
    category: 'foco',
  },
  {
    id: 10,
    text: 'El ruido rosa y marrón enmascaran distractores ambientales. La ciencia respalda su efectividad para TDAH.',
    category: 'sonido',
  },
  {
    id: 11,
    text: 'Celebra micro-wins diarios. Tu cerebro necesita recompensas frecuentes para mantener motivación.',
    category: 'motivacion',
  },
  {
    id: 12,
    text: 'La procrastinación TDAH no es pereza, es evitación emocional. Pregúntate: ¿qué emoción estoy evitando?',
    category: 'procrastinacion',
  },
  {
    id: 13,
    text: 'Cuando te sientas abrumado, elige UNA sola cosa. Eliminar decisiones rompe la parálisis ejecutiva.',
    category: 'paralisis',
  },
  {
    id: 14,
    text: 'Las tareas obligatorias (rojas) van primero. Reduce la carga mental externalizando prioridades.',
    category: 'estrategia',
  },

  // Week 3: Foco y concentración
  {
    id: 15,
    text: 'Tu cerebro busca novedad para obtener dopamina. Usa temporizadores para crear urgencia artificial.',
    category: 'foco',
  },
  {
    id: 16,
    text: 'La hipersensibilidad a recompensas diferidas es neurobiológica. Crea micro-recompensas inmediatas tras cada paso.',
    category: 'motivacion',
  },
  {
    id: 17,
    text: 'El estrés empeora TODOS los síntomas TDAH. Prioriza reducir estresores crónicos antes que "hacer más".',
    category: 'autocuidado',
  },
  {
    id: 18,
    text: 'Necesitas compasión hacia ti mismo, no más disciplina. La autocrítica severa no mejora el rendimiento.',
    category: 'autocompasion',
  },
  {
    id: 19,
    text: 'La regla de 2 minutos rompe la inercia: "solo abrir el documento" es suficiente para empezar.',
    category: 'paralisis',
  },
  {
    id: 20,
    text: 'Los ambientes con muchos distractores hacen imposible mantener atención. Simplifica tu espacio visual.',
    category: 'foco',
  },
  {
    id: 21,
    text: 'Reconocer la diferencia entre tareas obligatorias y "deberías" internalizados reduce culpa innecesaria.',
    category: 'emocional',
  },

  // Week 4: Motivación y persistencia
  {
    id: 22,
    text: 'La desmotivación no significa que "no te importa". Tu cerebro necesita estructura diferente para activarse.',
    category: 'motivacion',
  },
  {
    id: 23,
    text: 'Trabajar con Pomodoro no es solo productividad, es práctica de auto-regulación. Cada sesión entrena tu cerebro.',
    category: 'pomodoro',
  },
  {
    id: 24,
    text: 'La indecisión TDAH viene de función ejecutiva débil. Usa criterios simples: ¿Es obligatorio? Haz primero.',
    category: 'estrategia',
  },
  {
    id: 25,
    text: 'Tu reactividad emocional no es debilidad, es sensibilidad neurológica. Permite que las emociones existan.',
    category: 'emocional',
  },
  {
    id: 26,
    text: 'Evitar tareas complejas con múltiples pasos es normal en TDAH. Fragmenta hasta que sea "ridículamente pequeño".',
    category: 'paralisis',
  },
  {
    id: 27,
    text: 'El hiperfoco puede ser un regalo cuando se dirige bien. Usa Pomodoro para evitar agotarte después.',
    category: 'foco',
  },
  {
    id: 28,
    text: 'Necesitar pausas frecuentes no te hace menos capaz. Es cómo tu cerebro mantiene rendimiento sostenible.',
    category: 'autocuidado',
  },

  // Week 5: Herramientas y ajustes
  {
    id: 29,
    text: 'Las alarmas y recordatorios no son "muletas", son herramientas que compensan memoria de trabajo limitada.',
    category: 'estrategia',
  },
  {
    id: 30,
    text: 'Cuando pierdas el foco, no te castigues. Nota que te distrajiste y vuelve gentilmente. Es práctica, no perfección.',
    category: 'foco',
  },
  {
    id: 31,
    text: 'Tu cerebro TDAH está haciendo lo mejor que puede con la biología que tiene. Responde con comprensión, no crítica.',
    category: 'autocompasion',
  },
];

/**
 * Get tip of the day based on current date
 * Uses day of year to ensure same tip shows all day
 * Cycles through tips array automatically
 *
 * @returns {Object} Tip object with id, text, and category
 */
export function getTipOfTheDay() {
  const now = new Date();

  // Calculate day of year (1-365/366)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Use modulo to cycle through tips
  const tipIndex = dayOfYear % DAILY_TIPS.length;

  return DAILY_TIPS[tipIndex];
}

/**
 * Get all tips (useful for testing or displaying tip history)
 * @returns {Array} All available tips
 */
export function getAllTips() {
  return DAILY_TIPS;
}

/**
 * Get tips by category
 * @param {string} category - Category to filter by
 * @returns {Array} Tips matching the category
 */
export function getTipsByCategory(category) {
  return DAILY_TIPS.filter(tip => tip.category === category);
}

/**
 * Get a specific tip by ID
 * @param {number} id - Tip ID
 * @returns {Object|null} Tip object or null if not found
 */
export function getTipById(id) {
  return DAILY_TIPS.find(tip => tip.id === id) || null;
}

export default {
  getTipOfTheDay,
  getAllTips,
  getTipsByCategory,
  getTipById,
};
