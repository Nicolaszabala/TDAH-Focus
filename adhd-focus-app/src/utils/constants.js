/**
 * Constants for TDAH Focus App
 * Centralizes all constant values used across the application
 */

// Task Types
export const TASK_TYPES = {
  OBLIGATORY: 'obligatory',
  OPTIONAL: 'optional',
};

// Task Colors (WCAG AA compliant - 4.5:1 contrast ratio)
export const TASK_COLORS = {
  OBLIGATORY: '#E74C3C', // Red alert for obligatory tasks
  OPTIONAL: '#3498DB',   // Blue neutral for optional tasks
};

// Timer States
export const TIMER_STATES = {
  IDLE: 'idle',
  WORKING: 'working',
  BREAK: 'break',
  PAUSED: 'paused',
};

// Timer Durations (in seconds)
export const TIMER_DURATIONS = {
  WORK: 25 * 60,      // 25 minutes (fixed)
  SHORT_BREAK: 5 * 60,  // 5 minutes
  LONG_BREAK: 10 * 60,  // 10 minutes
};

// Filter Types
export const TASK_FILTERS = {
  ALL: 'all',
  OBLIGATORY: 'obligatory',
  OPTIONAL: 'optional',
};

// AsyncStorage Keys
export const STORAGE_KEYS = {
  TASKS: '@adhd_app:tasks',
  POMODORO_HISTORY: '@adhd_app:pomodoro_history',
  SETTINGS: '@adhd_app:settings',
  TUTORIAL_COMPLETED: '@adhd_app:tutorial_completed',
};

// Focus Mode Messages
export const FOCUS_MESSAGES = [
  'Concéntrate en lo importante',
  'Un paso a la vez',
  'Tienes esto bajo control',
  'Enfócate en el presente',
  'Progreso, no perfección',
  'Cada minuto cuenta',
  'Elimina las distracciones',
  'Tú puedes hacerlo',
];

// Sound Types
export const SOUND_TYPES = {
  PINK: 'pink',
  BROWN: 'brown',
  NATURE: 'nature',
};

// UI Constants
export const UI = {
  MAX_ACTIONS_PER_SCREEN: 3,  // RNF01: Maximum 3 main actions visible
  MIN_FONT_SIZE: 16,           // RNF02: Minimum 16pt font
  MIN_TOUCH_TARGET: 44,        // RNF07: Minimum 44x44pt touch area
  FEEDBACK_DELAY: 200,         // RNF04: Maximum 200ms feedback delay
  ANIMATION_DURATION: 300,     // RNF10: Maximum 300ms animations
};

// Contrast Ratios (WCAG 2.1 Level AA)
export const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,   // RNF03: 4.5:1 for normal text
  LARGE_TEXT: 3.0,    // RNF03: 3:1 for large text
};

// Performance Thresholds
export const PERFORMANCE = {
  MAX_LOAD_TIME: 3000,        // RNF09: Maximum 3 seconds initial load
  MAX_STORAGE_OPERATION: 500,  // RNF11: Maximum 500ms for AsyncStorage ops
  TIMER_PRECISION: 1000,       // RNF12: ±1 second precision
  AUTO_SAVE_INTERVAL: 60000,   // RNF17: Auto-save every 60 seconds
};

// Notification Messages
export const NOTIFICATIONS = {
  WORK_COMPLETE: {
    title: '¡Tiempo de descanso!',
    body: 'Has completado 25 minutos de trabajo enfocado. Toma un descanso.',
  },
  BREAK_COMPLETE: {
    title: '¡Listo para trabajar!',
    body: 'Tu descanso ha terminado. ¿Comenzamos otra sesión?',
  },
};

// Assistant Patterns
export const ASSISTANT_PATTERNS = {
  PARALYSIS: /no sé (por dónde|qué) empezar|bloqueado|paralizado|no puedo empezar/i,
  FOCUS_LOSS: /distraído|perdí (el )?foco|no puedo concentrar|me distraigo/i,
  INDECISION: /qué (hago|tarea)|cuál (priorizo|primero)|no sé qué hacer/i,
  MOTIVATION: /sin ganas|desmotivado|no puedo seguir|agotado/i,
};

// Default Settings
export const DEFAULT_SETTINGS = {
  breakDuration: TIMER_DURATIONS.SHORT_BREAK,
  soundVolume: 0.5,
  notificationsEnabled: true,
  tutorialCompleted: false,
};

// Tutorial Steps
export const TUTORIAL_STEPS = [
  {
    id: 1,
    title: '¡Bienvenido a TDAH Focus!',
    description: 'Esta app tiene 5 herramientas diseñadas para ayudarte a gestionar tareas y mantener el foco.',
    icon: 'hand-right',
    position: 'center',
  },
  {
    id: 2,
    title: '📋 Gestión de Tareas',
    description: 'Crea y organiza tus tareas. Las OBLIGATORIAS (rojas) son prioritarias, las OPCIONALES (azules) son flexibles.',
    icon: 'list',
    position: 'center',
  },
  {
    id: 3,
    title: '⏱️ Técnica Pomodoro',
    description: '25 minutos de trabajo concentrado + pausas de 5-10 minutos. Ideal para mantener el foco sin agotarte.',
    icon: 'timer',
    position: 'center',
  },
  {
    id: 4,
    title: '🎵 Ambientes Sonoros',
    description: 'Ruido rosa y marrón basados en evidencia científica para mejorar la concentración.',
    icon: 'musical-notes',
    position: 'center',
  },
  {
    id: 5,
    title: '💬 Asistente TDAH',
    description: 'Consulta cuando te sientas bloqueado, distraído o sin saber qué hacer. Está entrenado para ayudarte.',
    icon: 'chatbubbles',
    position: 'center',
  },
  {
    id: 6,
    title: '✨ Modo Concentración',
    description: 'Activa una pantalla minimalista que elimina distracciones cuando necesites foco máximo.',
    icon: 'eye-off',
    position: 'center',
  },
  {
    id: 7,
    title: '¡Listo para comenzar!',
    description: 'Explora cada sección usando las pestañas de abajo. Recuerda: progreso, no perfección. ¡Tú puedes!',
    icon: 'checkmark-circle',
    position: 'center',
  },
];
