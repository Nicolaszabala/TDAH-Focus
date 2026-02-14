/**
 * Goal Service
 * Business logic for weekly goals management
 */

/**
 * Calculate week dates based on type
 * @param {string} weekType - 'rolling' or 'fixed'
 * @param {number} weekStartDay - Day of week (0=Sunday, 1=Monday)
 * @returns {Object} { startDate, endDate }
 */
export const calculateWeekDates = (weekType, weekStartDay = 1) => {
  const now = new Date();
  let startDate;
  let endDate;

  if (weekType === 'fixed') {
    // Calculate start of week based on weekStartDay
    const currentDay = now.getDay();
    const daysToStart = (currentDay - weekStartDay + 7) % 7;

    startDate = new Date(now);
    startDate.setDate(now.getDate() - daysToStart);
    startDate.setHours(0, 0, 0, 0);

    // End date is 6 days after start (7 days total)
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else {
    // Rolling: 7 days from today
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Check if a goal is expired
 * @param {Object} goal - Goal object
 * @returns {boolean}
 */
export const isGoalExpired = (goal) => {
  if (!goal || !goal.endDate) return false;
  return new Date() > new Date(goal.endDate);
};

/**
 * Calculate days remaining in goal
 * @param {Object} goal - Goal object
 * @returns {number} Days remaining (0 if expired)
 */
export const getDaysRemaining = (goal) => {
  if (!goal || !goal.endDate) return 0;

  const now = new Date();
  const endDate = new Date(goal.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Calculate hours remaining in goal
 * @param {Object} goal - Goal object
 * @returns {number} Hours remaining (0 if expired)
 */
export const getHoursRemaining = (goal) => {
  if (!goal || !goal.endDate) return 0;

  const now = new Date();
  const endDate = new Date(goal.endDate);
  const diffTime = endDate - now;
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

  return Math.max(0, diffHours);
};

/**
 * Format date range for display
 * @param {string} startDate - ISO date string
 * @param {string} endDate - ISO date string
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('es-ES', options);
  const endStr = end.toLocaleDateString('es-ES', options);

  return `${startStr} - ${endStr}`;
};

/**
 * Check if goal should trigger "near deadline" notification
 * @param {Object} goal - Goal object
 * @returns {boolean}
 */
export const shouldNotifyNearDeadline = (goal) => {
  if (!goal || goal.status !== 'active') return false;

  const daysRemaining = getDaysRemaining(goal);
  const completionRate = goal.progressPercentage || 0;

  // Notify if 2 days left and less than 100% complete
  return daysRemaining <= 2 && completionRate < 100;
};

/**
 * Calculate goal statistics
 * @param {Object} goal - Goal object
 * @param {Array} tasks - All tasks
 * @returns {Object} Statistics
 */
export const calculateGoalStats = (goal, tasks) => {
  if (!goal || !tasks) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      obligatoryCompleted: 0,
      optionalCompleted: 0,
      progressPercentage: 0,
    };
  }

  const goalTasks = tasks.filter(task => goal.taskIds.includes(task.id));
  const completedTasks = goalTasks.filter(task => task.completed);
  const obligatoryCompleted = completedTasks.filter(task => task.type === 'obligatory').length;
  const optionalCompleted = completedTasks.filter(task => task.type === 'optional').length;

  return {
    totalTasks: goalTasks.length,
    completedTasks: completedTasks.length,
    obligatoryCompleted,
    optionalCompleted,
    progressPercentage: goalTasks.length > 0
      ? Math.round((completedTasks.length / goalTasks.length) * 100)
      : 0,
  };
};

/**
 * Auto-archive expired goals
 * @param {Array} goals - All active goals
 * @returns {Array} Goal IDs to archive
 */
export const getGoalsToArchive = (goals) => {
  if (!goals || !Array.isArray(goals)) return [];

  return goals
    .filter(goal => goal.status === 'active' && isGoalExpired(goal))
    .map(goal => goal.id);
};

/**
 * Get week number of year
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Get motivational phrase based on week number (rotates weekly)
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Motivational phrase
 */
export const getWeeklyMotivationalPhrase = (date = new Date()) => {
  const phrases = [
    "Las metas semanales convierten el caos en claridad",
    "Una meta a la vez. Esa es la clave del progreso.",
    "Dale estructura a tu semana, dale poder a tu TDAH",
    "Las metas claras liberan dopamina. Tu cerebro lo agradecerá.",
    "Define tu semana. Conquista tus tareas.",
    "El enfoque nace de la intención. Crea tu meta hoy.",
    "Pequeños pasos semanales, grandes cambios mensuales",
    "Tu cerebro TDAH ama las metas concretas. Dale una.",
    "No es sobre la perfección, es sobre la dirección",
    "Una semana enfocada puede cambiar tu mes entero",
    "El caos es opcional. Las metas son tu brújula.",
    "Planifica tu semana, libera tu mente",
  ];

  const weekNumber = getWeekNumber(date);
  const phraseIndex = weekNumber % phrases.length;

  return phrases[phraseIndex];
};

/**
 * Check if all tasks in goal are from tasks list
 * @param {Object} goal - Goal object
 * @param {Array} tasks - All tasks
 * @returns {boolean}
 */
export const validateGoalTasks = (goal, tasks) => {
  if (!goal || !tasks) return false;

  const taskIds = tasks.map(t => t.id);
  return goal.taskIds.every(taskId => taskIds.includes(taskId));
};

/**
 * Get completion message based on goal performance
 * @param {Object} goal - Goal object
 * @returns {string} Completion message
 */
export const getGoalCompletionMessage = (goal) => {
  if (!goal) return '';

  const percentage = goal.progressPercentage || 0;

  if (percentage === 100) {
    return '¡Increíble! Completaste todas las tareas de tu meta 🎉';
  } else if (percentage >= 80) {
    return '¡Excelente progreso! Casi llegas a la meta 🌟';
  } else if (percentage >= 50) {
    return 'Buen avance. Sigue así 💪';
  } else if (percentage >= 25) {
    return 'Vas por buen camino. ¡No pares! 🚀';
  } else {
    return 'Cada paso cuenta. Sigue adelante ✨';
  }
};

/**
 * Calculate points earned from goal
 * @param {Object} goal - Goal object
 * @param {Array} tasks - All tasks
 * @returns {Object} Points breakdown
 */
export const calculateGoalPoints = (goal, tasks) => {
  if (!goal || !tasks) {
    return {
      taskPoints: 0,
      bonusPoints: 0,
      totalPoints: 0,
    };
  }

  const goalTasks = tasks.filter(task =>
    goal.taskIds.includes(task.id) && task.completed
  );

  const obligatoryPoints = goalTasks.filter(t => t.type === 'obligatory').length * 50;
  const optionalPoints = goalTasks.filter(t => t.type === 'optional').length * 25;
  const taskPoints = obligatoryPoints + optionalPoints;

  // Bonus if ALL tasks completed
  const allCompleted = goal.completedTasks === goal.totalTasks && goal.totalTasks > 0;
  const bonusPoints = allCompleted ? 100 : 0;

  return {
    taskPoints,
    bonusPoints,
    totalPoints: taskPoints + bonusPoints,
  };
};
