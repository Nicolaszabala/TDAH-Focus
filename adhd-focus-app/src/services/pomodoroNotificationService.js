/**
 * Pomodoro Notification Service - Notifee Implementation
 * Manages foreground notifications for the Pomodoro timer
 * Displays timer status in Android notification tray with controls
 */

import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import { InteractionManager } from 'react-native';
import { TIMER_STATES } from '../utils/constants';

// Notification channel ID (required for Android 8+)
const POMODORO_CHANNEL_ID = 'pomodoro-timer';
const NOTIFICATION_ID = 'pomodoro-running';

// Action IDs for notification buttons
const ACTION_PAUSE = 'pause';
const ACTION_RESUME = 'resume';
const ACTION_STOP = 'stop';

/**
 * Create notification channel for Android
 * Must be called before showing notifications
 */
async function createNotificationChannel() {
  await notifee.createChannel({
    id: POMODORO_CHANNEL_ID,
    name: 'Temporizador Pomodoro',
    importance: AndroidImportance.DEFAULT,
    visibility: AndroidVisibility.PUBLIC,
    vibration: false,
    sound: undefined, // No sound for persistent notification
  });
}

/**
 * Request notification permissions (Android 13+)
 * @returns {Promise<boolean>} True if permissions granted
 */
export async function requestNotificationPermissions() {
  try {
    // Create channel first
    await createNotificationChannel();

    // Request permissions (Android 13+ only)
    const settings = await notifee.requestPermission();

    return settings.authorizationStatus >= 1; // 1 = authorized
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Format seconds into MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time (MM:SS)
 */
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get notification title based on timer state
 * @param {string} timerState - Current timer state
 * @returns {string} Notification title
 */
function getNotificationTitle(timerState) {
  switch (timerState) {
    case TIMER_STATES.WORKING:
      return '⏱️ Sesión Pomodoro en curso';
    case TIMER_STATES.BREAK:
      return '☕ Tiempo de descanso';
    case TIMER_STATES.PAUSED:
      return '⏸️ Pomodoro pausado';
    default:
      return 'Pomodoro';
  }
}

/**
 * Get notification body text
 * @param {string} timerState - Current timer state
 * @param {number} timeRemaining - Seconds remaining
 * @param {string} taskTitle - Current task title (optional)
 * @returns {string} Notification body
 */
function getNotificationBody(timerState, timeRemaining, taskTitle = null) {
  const formattedTime = formatTime(timeRemaining);

  if (timerState === TIMER_STATES.PAUSED) {
    return taskTitle
      ? `${formattedTime} - ${taskTitle}`
      : `${formattedTime} - Toca para continuar`;
  }

  if (taskTitle) {
    return `${formattedTime} restantes - ${taskTitle}`;
  }

  return `${formattedTime} restantes`;
}

/**
 * Create or update the Pomodoro notification
 * @param {Object} params - Notification parameters
 * @param {string} params.timerState - Current timer state
 * @param {number} params.timeRemaining - Seconds remaining
 * @param {string} params.taskTitle - Task title (optional)
 * @param {boolean} params.isRunning - Whether timer is running
 */
export async function updatePomodoroNotification({
  timerState,
  timeRemaining,
  taskTitle = null,
  isRunning = true,
}) {
  try {
    const title = getNotificationTitle(timerState);
    const body = getNotificationBody(timerState, timeRemaining, taskTitle);

    // Define notification actions (buttons)
    const actions = [];

    if (isRunning && timerState !== TIMER_STATES.PAUSED) {
      actions.push({
        title: 'Pausar',
        pressAction: { id: ACTION_PAUSE },
      });
    }

    if (timerState === TIMER_STATES.PAUSED) {
      actions.push({
        title: 'Continuar',
        pressAction: { id: ACTION_RESUME },
      });
    }

    actions.push({
      title: 'Detener',
      pressAction: { id: ACTION_STOP },
    });

    // Display notification
    await notifee.displayNotification({
      id: NOTIFICATION_ID,
      title,
      body,
      android: {
        channelId: POMODORO_CHANNEL_ID,
        importance: AndroidImportance.DEFAULT,
        visibility: AndroidVisibility.PUBLIC,
        ongoing: true, // Persistent notification (can't be swiped away)
        onlyAlertOnce: true, // Don't make sound/vibration on updates
        pressAction: {
          id: 'default',
        },
        actions,
        color: '#E74C3C',
        smallIcon: 'ic_launcher', // Using default app icon
        progress: {
          max: timerState === TIMER_STATES.WORKING ? 1500 : (timeRemaining <= 600 ? 600 : 300),
          current: Math.min(
            timeRemaining,
            timerState === TIMER_STATES.WORKING ? 1500 : (timeRemaining <= 600 ? 600 : 300)
          ),
        },
      },
    });

  } catch (error) {
    console.error('Error updating pomodoro notification:', error);
  }
}

/**
 * Cancel/dismiss the Pomodoro notification
 */
export async function cancelPomodoroNotification() {
  try {
    await notifee.cancelNotification(NOTIFICATION_ID);
  } catch (error) {
    console.error('Error canceling pomodoro notification:', error);
  }
}

/**
 * Setup notification action listener
 * Handles when user taps notification actions (Pause/Resume/Stop)
 * @param {Function} onPause - Callback when pause is tapped
 * @param {Function} onResume - Callback when resume is tapped
 * @param {Function} onStop - Callback when stop is tapped
 * @returns {Function} Unsubscribe function
 */
export function setupNotificationActionListener(onPause, onResume, onStop) {
  const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      // Use InteractionManager to ensure operations run on the main JS thread
      InteractionManager.runAfterInteractions(() => {
        switch (detail.pressAction.id) {
          case ACTION_PAUSE:
            onPause?.();
            break;
          case ACTION_RESUME:
            onResume?.();
            break;
          case ACTION_STOP:
            onStop?.();
            break;
          default:
            break;
        }
      });
    }
  });

  // Also handle background events
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      // Use InteractionManager to ensure operations run on the main JS thread
      InteractionManager.runAfterInteractions(() => {
        switch (detail.pressAction.id) {
          case ACTION_PAUSE:
            onPause?.();
            break;
          case ACTION_RESUME:
            onResume?.();
            break;
          case ACTION_STOP:
            onStop?.();
            break;
          default:
            break;
        }
      });
    }
  });

  return unsubscribe;
}

/**
 * Show completion notification when work/break ends
 * @param {string} type - 'work' or 'break'
 */
export async function showCompletionNotification(type) {
  try {
    const isWorkComplete = type === 'work';

    await notifee.displayNotification({
      title: isWorkComplete ? '🎉 ¡Sesión completada!' : '✅ ¡Descanso terminado!',
      body: isWorkComplete
        ? 'Has completado 25 minutos de trabajo enfocado. Toma un descanso.'
        : 'Tu descanso ha terminado. ¿Comenzamos otra sesión?',
      android: {
        channelId: POMODORO_CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [300, 500, 300],
        color: '#27AE60',
        smallIcon: 'ic_launcher',
      },
    });
  } catch (error) {
    console.error('Error showing completion notification:', error);
  }
}
