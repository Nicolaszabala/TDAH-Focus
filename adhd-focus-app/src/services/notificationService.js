/**
 * Notification Service (Stub Implementation for Expo Go Compatibility)
 *
 * CONTEXT:
 * - expo-notifications was removed from this project to avoid Expo Go errors
 * - Expo Go SDK 53+ removed support for push notifications
 * - This stub implementation maintains API compatibility without actual notifications
 *
 * IMPACT ON TFG PROTOTYPE:
 * - Focus Mode works without notification suppression (acceptable for prototype)
 * - Pomodoro Timer works with visual/audio alerts instead of system notifications
 * - No errors or warnings in Expo Go
 *
 * FOR PRODUCTION:
 * - Re-add expo-notifications as dependency
 * - Restore full implementation from git history (commit before this change)
 * - Build development build or standalone app (not Expo Go)
 */

/**
 * Enable Focus Mode (stub - no actual notification changes)
 * In production, this would suppress app notifications
 * @returns {Promise<void>}
 */
export async function enableFocusMode() {
  // Stub: Does nothing in Expo Go
  // In production with expo-notifications:
  // - Would set Do Not Disturb mode (Android)
  // - Would suppress notification sounds/vibrations
  console.log('[NotificationService] Focus mode enabled (visual-only in Expo Go)');
  return Promise.resolve();
}

/**
 * Disable Focus Mode (stub - no actual notification changes)
 * @returns {Promise<void>}
 */
export async function disableFocusMode() {
  // Stub: Does nothing in Expo Go
  console.log('[NotificationService] Focus mode disabled');
  return Promise.resolve();
}

/**
 * Request notification permissions (stub - always returns false)
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermissions() {
  // Stub: Notifications not available in Expo Go
  console.log('[NotificationService] Notifications disabled (Expo Go limitation)');
  return Promise.resolve(false);
}

/**
 * Schedule local notification (stub - does nothing)
 * @param {Object} options - Notification options
 * @returns {Promise<string|null>}
 */
export async function scheduleNotification(options) {
  // Stub: No notifications in Expo Go
  console.log('[NotificationService] Notification scheduled (visual-only):', options.title);
  return Promise.resolve(null);
}

/**
 * Cancel scheduled notification (stub - does nothing)
 * @param {string} notificationId - ID of notification to cancel
 * @returns {Promise<void>}
 */
export async function cancelNotification(notificationId) {
  // Stub: Does nothing
  return Promise.resolve();
}

/**
 * Cancel all scheduled notifications (stub - does nothing)
 * @returns {Promise<void>}
 */
export async function cancelAllNotifications() {
  // Stub: Does nothing
  return Promise.resolve();
}

export default {
  enableFocusMode,
  disableFocusMode,
  requestNotificationPermissions,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
};
