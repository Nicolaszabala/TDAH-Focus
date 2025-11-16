import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Storage Service
 * Handles all AsyncStorage operations for offline persistence
 * Implements RNF15: 100% offline availability
 * Implements RNF23: Local storage only, no external transmission
 */

// Generic storage operations
export const saveData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return { success: true };
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
    return { success: false, error: error.message };
  }
};

export const loadData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading data from ${key}:`, error);
    return null;
  }
};

export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error(`Error removing data from ${key}:`, error);
    return { success: false, error: error.message };
  }
};

// Task-specific operations
export const saveTasks = async (tasks) => {
  return await saveData(STORAGE_KEYS.TASKS, tasks);
};

export const loadTasks = async () => {
  return await loadData(STORAGE_KEYS.TASKS);
};

// Pomodoro history operations
export const savePomodoroHistory = async (history) => {
  // RNF25: Only store metadata (date, duration, task ID), not textual content
  const sanitizedHistory = history.map(session => ({
    id: session.id,
    taskId: session.taskId,
    taskTitle: session.taskTitle, // We keep title for display purposes
    duration: session.duration,
    startTime: session.startTime,
    endTime: session.endTime,
  }));

  return await saveData(STORAGE_KEYS.POMODORO_HISTORY, sanitizedHistory);
};

export const loadPomodoroHistory = async () => {
  return await loadData(STORAGE_KEYS.POMODORO_HISTORY);
};

// Settings operations
export const saveSettings = async (settings) => {
  return await saveData(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = async () => {
  return await loadData(STORAGE_KEYS.SETTINGS);
};

// Tutorial operations
export const saveTutorialCompleted = async (completed) => {
  return await saveData(STORAGE_KEYS.TUTORIAL_COMPLETED, completed);
};

export const loadTutorialCompleted = async () => {
  const completed = await loadData(STORAGE_KEYS.TUTORIAL_COMPLETED);
  return completed !== null ? completed : false;
};

// RNF19: Validate data integrity
export const validateStorageIntegrity = async () => {
  try {
    const tasks = await loadTasks();
    const history = await loadPomodoroHistory();
    const settings = await loadSettings();

    // Basic validation
    const isValid = {
      tasks: Array.isArray(tasks) || tasks === null,
      history: Array.isArray(history) || history === null,
      settings: typeof settings === 'object' || settings === null,
    };

    const allValid = Object.values(isValid).every(v => v);

    return {
      isValid: allValid,
      details: isValid,
    };
  } catch (error) {
    console.error('Storage integrity check failed:', error);
    return {
      isValid: false,
      error: error.message,
    };
  }
};

// Clear all data (for reset/testing)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TASKS,
      STORAGE_KEYS.POMODORO_HISTORY,
      STORAGE_KEYS.SETTINGS,
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error clearing all data:', error);
    return { success: false, error: error.message };
  }
};

// RNF18: Handle storage errors gracefully
export const handleStorageError = (error, operation) => {
  console.error(`Storage error during ${operation}:`, error);

  // Return user-friendly error message
  return {
    title: 'Error de Almacenamiento',
    message: 'No se pudo guardar los datos. Por favor, intenta nuevamente.',
    action: 'retry',
  };
};

// Auto-save helper (used by components)
export const autoSave = async (key, data) => {
  // RNF17: Auto-save implementation
  const result = await saveData(key, data);

  if (!result.success) {
    // Log but don't interrupt user
    console.warn(`Auto-save failed for ${key}`);
  }

  return result;
};
