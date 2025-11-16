import { createSlice } from '@reduxjs/toolkit';
import {
  initializeAudio,
  loadSound,
  playSound,
  pauseSound,
  stopSound,
  setVolume as setAudioVolume,
  getCurrentSound,
} from '../../services/soundService';

/**
 * Sound Slice
 * Manages ambient sound state (pink noise, brown noise, nature sounds)
 *
 * RF31-RF36: Ambient sound environment management
 */

const initialState = {
  selectedSound: null, // 'pink' | 'brown' | 'nature' | null
  isPlaying: false,
  volume: 0.5, // 0.0 to 1.0 (50% default)
  isLoading: false,
  error: null,
  isInitialized: false,
};

const soundSlice = createSlice({
  name: 'sound',
  initialState,
  reducers: {
    // Initialize audio system
    initializeStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    initializeSuccess(state) {
      state.isLoading = false;
      state.isInitialized = true;
      state.error = null;
    },
    initializeFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Load sound
    loadSoundStart(state, action) {
      state.isLoading = true;
      state.error = null;
      state.selectedSound = action.payload; // Optimistic update
    },
    loadSoundSuccess(state) {
      state.isLoading = false;
      state.error = null;
    },
    loadSoundFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
      state.selectedSound = null; // Revert on error
    },

    // Play sound
    playStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    playSuccess(state) {
      state.isPlaying = true;
      state.isLoading = false;
      state.error = null;
    },
    playFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Pause sound
    pauseStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    pauseSuccess(state) {
      state.isPlaying = false;
      state.isLoading = false;
      state.error = null;
    },
    pauseFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Stop sound
    stopStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    stopSuccess(state) {
      state.isPlaying = false;
      state.selectedSound = null;
      state.isLoading = false;
      state.error = null;
    },
    stopFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Set volume
    setVolumeStart(state, action) {
      state.volume = action.payload; // Optimistic update
      state.error = null;
    },
    setVolumeSuccess(state, action) {
      state.volume = action.payload;
      state.error = null;
    },
    setVolumeFailure(state, action) {
      state.error = action.payload;
    },

    // Clear error
    clearError(state) {
      state.error = null;
    },
  },
});

// Export actions
export const {
  initializeStart,
  initializeSuccess,
  initializeFailure,
  loadSoundStart,
  loadSoundSuccess,
  loadSoundFailure,
  playStart,
  playSuccess,
  playFailure,
  pauseStart,
  pauseSuccess,
  pauseFailure,
  stopStart,
  stopSuccess,
  stopFailure,
  setVolumeStart,
  setVolumeSuccess,
  setVolumeFailure,
  clearError,
} = soundSlice.actions;

// Thunks (async actions)

/**
 * Initialize audio system
 * Should be called once when app starts
 */
export const initializeAudioSystem = () => async (dispatch) => {
  dispatch(initializeStart());

  const result = await initializeAudio();

  if (result.success) {
    dispatch(initializeSuccess());
  } else {
    dispatch(initializeFailure(result.error || 'Failed to initialize audio'));
  }
};

/**
 * Select and load a sound
 * RF31: Select ambient sound environment
 * @param {string} soundType - 'pink' | 'brown' | 'nature'
 */
export const selectSound = (soundType) => async (dispatch, getState) => {
  const { sound } = getState();

  // If same sound is already loaded, just toggle play/pause
  if (sound.selectedSound === soundType && !sound.isLoading) {
    if (sound.isPlaying) {
      dispatch(togglePlayPause());
    } else {
      dispatch(playSoundAction());
    }
    return;
  }

  // Load new sound
  dispatch(loadSoundStart(soundType));

  const result = await loadSound(soundType);

  if (result.success) {
    dispatch(loadSoundSuccess());
    // Auto-play after loading
    dispatch(playSoundAction());
  } else {
    dispatch(loadSoundFailure(result.error || 'Failed to load sound'));
  }
};

/**
 * Play the currently loaded sound
 * RF32: Play sound in continuous loop
 */
export const playSoundAction = () => async (dispatch) => {
  dispatch(playStart());

  const result = await playSound();

  if (result.success) {
    dispatch(playSuccess());
  } else {
    dispatch(playFailure(result.error || 'Failed to play sound'));
  }
};

/**
 * Pause the currently playing sound
 * RF33: Pause sound playback
 */
export const pauseSoundAction = () => async (dispatch) => {
  dispatch(pauseStart());

  const result = await pauseSound();

  if (result.success) {
    dispatch(pauseSuccess());
  } else {
    dispatch(pauseFailure(result.error || 'Failed to pause sound'));
  }
};

/**
 * Stop the currently playing sound
 * RF34: Stop sound playback
 */
export const stopSoundAction = () => async (dispatch) => {
  dispatch(stopStart());

  const result = await stopSound();

  if (result.success) {
    dispatch(stopSuccess());
  } else {
    dispatch(stopFailure(result.error || 'Failed to stop sound'));
  }
};

/**
 * Toggle play/pause
 */
export const togglePlayPause = () => async (dispatch, getState) => {
  const { sound } = getState();

  if (sound.isPlaying) {
    dispatch(pauseSoundAction());
  } else {
    dispatch(playSoundAction());
  }
};

/**
 * Set volume level
 * RF35: Adjust volume (0-100%)
 * @param {number} volume - Volume level (0.0 to 1.0)
 */
export const setVolume = (volume) => async (dispatch) => {
  // Optimistic update
  dispatch(setVolumeStart(volume));

  const result = await setAudioVolume(volume);

  if (result.success) {
    dispatch(setVolumeSuccess(result.volume));
  } else {
    dispatch(setVolumeFailure(result.error || 'Failed to set volume'));
  }
};

// Selectors
export const selectSoundState = (state) => state.sound;
export const selectIsPlaying = (state) => state.sound.isPlaying;
export const selectSelectedSound = (state) => state.sound.selectedSound;
export const selectVolume = (state) => state.sound.volume;
export const selectIsLoading = (state) => state.sound.isLoading;
export const selectError = (state) => state.sound.error;
export const selectIsInitialized = (state) => state.sound.isInitialized;

export default soundSlice.reducer;
