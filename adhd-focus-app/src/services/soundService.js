import { Audio } from 'expo-av';

/**
 * Sound Service
 * Manages ambient sound playback (pink noise, brown noise)
 * Uses expo-av for audio playback with looping and volume control
 *
 * RF31: Select ambient sound environment
 * RF32: Play sound in continuous loop
 * RF33: Pause sound playback
 * RF34: Stop sound playback
 * RF35: Adjust volume (0-100%)
 * RF36: Background playback support
 *
 * NOTE: expo-av is deprecated but kept for SDK 54 compatibility with existing architecture
 * Migration to expo-audio will require refactoring to hooks-based architecture
 */

// Disable console logs in production
const DEBUG = false;

// Sound file mappings
const SOUND_FILES = {
  pink: require('../../assets/sounds/pink_noise.mp3'),
  brown: require('../../assets/sounds/brown_noise.mp3'),
};

// Sound metadata for UI
export const SOUND_INFO = {
  pink: {
    id: 'pink',
    name: 'Ruido Rosa',
    description: 'Frecuencias equilibradas. Ayuda a enmascarar distracciones externas.',
    scientificNote: 'Mejora significativa en tareas de atención (Nigg et al., 2024)',
    icon: 'radio',
    color: '#E91E63',
  },
  brown: {
    id: 'brown',
    name: 'Ruido Marrón',
    description: 'Frecuencias graves profundas. Similar al sonido de una cascada.',
    scientificNote: 'Enmascaramiento efectivo de distractores ambientales',
    icon: 'water',
    color: '#795548',
  },
};

// Singleton sound object
let soundObject = null;
let currentSound = null;

/**
 * Initialize audio mode for background playback
 * RNF36: Enable background audio playback
 */
export async function initializeAudio() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true, // Enable background playback
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    // Audio mode initialized successfully
    return { success: true };
  } catch (error) {
    if (DEBUG) console.error('❌ Error initializing audio mode:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load a sound file
 * @param {string} soundType - 'pink' | 'brown'
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function loadSound(soundType) {
  try {
    // If there's a currently loaded sound, unload it first
    if (soundObject) {
      await unloadSound();
    }

    // Check if sound type is valid
    if (!SOUND_FILES[soundType]) {
      throw new Error(`Invalid sound type: ${soundType}`);
    }

    // Create new sound object
    const { sound } = await Audio.Sound.createAsync(
      SOUND_FILES[soundType],
      {
        shouldPlay: false,
        isLooping: true, // RF32: Continuous loop
        volume: 0.5, // Default 50%
      },
      onPlaybackStatusUpdate
    );

    soundObject = sound;
    currentSound = soundType;

    // Sound loaded successfully
    return { success: true };
  } catch (error) {
    if (DEBUG) console.error(`❌ Error loading sound ${soundType}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Play the currently loaded sound
 * RF32: Play sound in continuous loop
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function playSound() {
  try {
    if (!soundObject) {
      throw new Error('No sound loaded. Call loadSound() first.');
    }

    const status = await soundObject.getStatusAsync();

    if (status.isLoaded) {
      await soundObject.playAsync();
      // Sound playing successfully
      return { success: true };
    } else {
      throw new Error('Sound not loaded properly');
    }
  } catch (error) {
    if (DEBUG) console.error('❌ Error playing sound:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pause the currently playing sound
 * RF33: Pause sound playback
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function pauseSound() {
  try {
    if (!soundObject) {
      return { success: false, error: 'No sound loaded' };
    }

    const status = await soundObject.getStatusAsync();

    if (status.isLoaded && status.isPlaying) {
      await soundObject.pauseAsync();
      // Sound paused successfully
      return { success: true };
    }

    return { success: true }; // Already paused
  } catch (error) {
    if (DEBUG) console.error('❌ Error pausing sound:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Stop and unload the current sound
 * RF34: Stop sound playback
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function stopSound() {
  try {
    if (!soundObject) {
      return { success: true }; // Nothing to stop
    }

    const status = await soundObject.getStatusAsync();

    if (status.isLoaded) {
      await soundObject.stopAsync();
      // Sound stopped successfully
    }

    return { success: true };
  } catch (error) {
    if (DEBUG) console.error('❌ Error stopping sound:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Unload the current sound and free memory
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function unloadSound() {
  try {
    if (soundObject) {
      await soundObject.unloadAsync();
      soundObject = null;
      currentSound = null;
      // Sound unloaded successfully
    }
    return { success: true };
  } catch (error) {
    if (DEBUG) console.error('❌ Error unloading sound:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set volume of the current sound
 * RF35: Adjust volume (0-100%)
 * @param {number} volume - Volume level (0.0 to 1.0)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setVolume(volume) {
  try {
    if (!soundObject) {
      return { success: false, error: 'No sound loaded' };
    }

    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));

    await soundObject.setVolumeAsync(clampedVolume);
    // Volume set successfully

    return { success: true, volume: clampedVolume };
  } catch (error) {
    if (DEBUG) console.error('❌ Error setting volume:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get current playback status
 * @returns {Promise<object|null>}
 */
export async function getStatus() {
  try {
    if (!soundObject) {
      return null;
    }

    return await soundObject.getStatusAsync();
  } catch (error) {
    if (DEBUG) console.error('❌ Error getting status:', error);
    return null;
  }
}

/**
 * Get currently loaded sound type
 * @returns {string|null}
 */
export function getCurrentSound() {
  return currentSound;
}

/**
 * Playback status update callback
 * @param {object} status - Playback status
 */
function onPlaybackStatusUpdate(status) {
  if (status.error) {
    if (DEBUG) console.error('❌ Playback error:', status.error);
  }

  if (status.didJustFinish && !status.isLooping) {
    if (DEBUG) console.log('⚠️ Sound finished (should not happen with looping enabled)');
  }

  // Log for debugging (can be removed in production)
  // if (status.isLoaded && status.isPlaying) {
  //   if (DEBUG) console.log(`🔊 Playing: ${currentSound}, Position: ${status.positionMillis}ms`);
  // }
}

/**
 * Cleanup - call when app is closing
 * @returns {Promise<void>}
 */
export async function cleanup() {
  await stopSound();
  await unloadSound();
  // Sound service cleanup complete
}
