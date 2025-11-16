import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  playSoundAction,
  pauseSoundAction,
  stopSoundAction,
  selectIsPlaying,
  selectSelectedSound,
  selectVolume,
} from '../store/slices/soundSlice';
import {
  requestAudioNotificationPermissions,
  updateAudioNotification,
  cancelAudioNotification,
  setupAudioNotificationActionListener,
} from '../services/audioNotificationService';

/**
 * useAudioNotifications Hook
 * Manages audio player notifications
 * - Shows persistent notification when audio is playing
 * - Updates notification when state changes
 * - Handles notification button actions
 */
export default function useAudioNotifications() {
  const dispatch = useDispatch();
  const isPlaying = useSelector(selectIsPlaying);
  const selectedSound = useSelector(selectSelectedSound);
  const volume = useSelector(selectVolume);

  const notificationListenerRef = useRef(null);

  // Request notification permissions on mount
  useEffect(() => {
    requestAudioNotificationPermissions();

    // Setup notification action listeners
    notificationListenerRef.current = setupAudioNotificationActionListener(
      () => dispatch(playSoundAction()),
      () => dispatch(pauseSoundAction()),
      () => dispatch(stopSoundAction())
    );

    // Cleanup on unmount
    return () => {
      notificationListenerRef.current?.();
      cancelAudioNotification();
    };
  }, [dispatch]);

  // Update notification when audio state changes
  useEffect(() => {
    if (selectedSound) {
      // Audio is loaded - show/update notification
      updateAudioNotification({
        soundType: selectedSound,
        isPlaying,
        volume,
      });
    } else {
      // No audio loaded - cancel notification
      cancelAudioNotification();
    }
  }, [selectedSound, isPlaying, volume]);

  return {
    isPlaying,
    selectedSound,
    volume,
  };
}
