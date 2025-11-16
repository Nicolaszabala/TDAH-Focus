/**
 * Audio Player Notification Service - Notifee Implementation
 * Manages foreground notifications for the audio player (pink/brown noise)
 * Displays playback status in Android notification tray with controls
 */

import notifee, { AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import { InteractionManager } from 'react-native';
import { SOUND_INFO } from './soundService';

// Notification channel ID (required for Android 8+)
const AUDIO_CHANNEL_ID = 'audio-player';
const NOTIFICATION_ID = 'audio-playing';

// Action IDs for notification buttons
const ACTION_PAUSE = 'audio_pause';
const ACTION_PLAY = 'audio_play';
const ACTION_STOP = 'audio_stop';

/**
 * Create notification channel for Android
 * Must be called before showing notifications
 */
async function createNotificationChannel() {
  await notifee.createChannel({
    id: AUDIO_CHANNEL_ID,
    name: 'Reproductor de Audio',
    importance: AndroidImportance.LOW, // Low importance for audio player
    visibility: AndroidVisibility.PUBLIC,
    vibration: false,
    sound: undefined, // No sound for audio player notification
  });
}

/**
 * Request notification permissions (Android 13+)
 * @returns {Promise<boolean>} True if permissions granted
 */
export async function requestAudioNotificationPermissions() {
  try {
    // Create channel first
    await createNotificationChannel();

    // Request permissions (Android 13+ only)
    const settings = await notifee.requestPermission();

    return settings.authorizationStatus >= 1; // 1 = authorized
  } catch (error) {
    console.error('Error requesting audio notification permissions:', error);
    return false;
  }
}

/**
 * Get notification title and body based on sound type
 * @param {string} soundType - 'pink' or 'brown'
 * @param {boolean} isPlaying - Whether audio is playing
 * @returns {Object} { title, body }
 */
function getNotificationContent(soundType, isPlaying) {
  const soundInfo = SOUND_INFO[soundType];

  if (!soundInfo) {
    return {
      title: 'Reproductor de Audio',
      body: isPlaying ? 'Reproduciendo' : 'Pausado',
    };
  }

  const icon = soundType === 'pink' ? '🎵' : '🌊';
  const statusText = isPlaying ? 'Reproduciendo' : 'Pausado';

  return {
    title: `${icon} ${soundInfo.name}`,
    body: `${statusText} - ${soundInfo.description}`,
  };
}

/**
 * Get color based on sound type
 * @param {string} soundType - 'pink' or 'brown'
 * @returns {string} Hex color
 */
function getSoundColor(soundType) {
  const soundInfo = SOUND_INFO[soundType];
  return soundInfo?.color || '#9C27B0';
}

/**
 * Create or update the audio player notification
 * @param {Object} params - Notification parameters
 * @param {string} params.soundType - 'pink' or 'brown'
 * @param {boolean} params.isPlaying - Whether audio is playing
 * @param {number} params.volume - Volume level (0-1)
 */
export async function updateAudioNotification({
  soundType,
  isPlaying = false,
  volume = 0.5,
}) {
  try {
    const { title, body } = getNotificationContent(soundType, isPlaying);
    const color = getSoundColor(soundType);

    // Define notification actions (buttons)
    const actions = [];

    if (isPlaying) {
      actions.push({
        title: '⏸ Pausar',
        pressAction: { id: ACTION_PAUSE },
      });
    } else {
      actions.push({
        title: '▶ Reproducir',
        pressAction: { id: ACTION_PLAY },
      });
    }

    actions.push({
      title: '⏹ Detener',
      pressAction: { id: ACTION_STOP },
    });

    // Display notification
    await notifee.displayNotification({
      id: NOTIFICATION_ID,
      title,
      body,
      subtitle: `Volumen: ${Math.round(volume * 100)}%`,
      android: {
        channelId: AUDIO_CHANNEL_ID,
        importance: AndroidImportance.LOW,
        visibility: AndroidVisibility.PUBLIC,
        ongoing: true, // Persistent notification (can't be swiped away while playing)
        onlyAlertOnce: true, // Don't make sound/vibration on updates
        pressAction: {
          id: 'default',
        },
        actions,
        color,
        smallIcon: 'ic_launcher', // Using default app icon
        // largeIcon removed - undefined causes error in notifee
        showTimestamp: true,
        timestamp: Date.now(),
      },
    });

  } catch (error) {
    console.error('Error updating audio notification:', error);
  }
}

/**
 * Cancel/dismiss the audio player notification
 */
export async function cancelAudioNotification() {
  try {
    await notifee.cancelNotification(NOTIFICATION_ID);
  } catch (error) {
    console.error('Error canceling audio notification:', error);
  }
}

/**
 * Setup notification action listener for audio controls
 * Handles when user taps notification actions (Play/Pause/Stop)
 * @param {Function} onPlay - Callback when play is tapped
 * @param {Function} onPause - Callback when pause is tapped
 * @param {Function} onStop - Callback when stop is tapped
 * @returns {Function} Unsubscribe function
 */
export function setupAudioNotificationActionListener(onPlay, onPause, onStop) {
  const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.ACTION_PRESS) {
      // Use InteractionManager to ensure audio operations run on the main JS thread
      // This fixes: "player current thread: 'pool-5-thread-1', expected thread 'main'"
      InteractionManager.runAfterInteractions(() => {
        switch (detail.pressAction.id) {
          case ACTION_PLAY:
            onPlay?.();
            break;
          case ACTION_PAUSE:
            onPause?.();
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
      // Use InteractionManager to ensure audio operations run on the main JS thread
      InteractionManager.runAfterInteractions(() => {
        switch (detail.pressAction.id) {
          case ACTION_PLAY:
            onPlay?.();
            break;
          case ACTION_PAUSE:
            onPause?.();
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
