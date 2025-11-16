import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_SETTINGS } from '../../utils/constants';

const initialState = {
  ...DEFAULT_SETTINGS,
  firstLaunch: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Set break duration (5 or 10 minutes)
    setBreakDuration: (state, action) => {
      state.breakDuration = action.payload;
    },

    // Set sound volume (0.0 - 1.0)
    setSoundVolume: (state, action) => {
      state.soundVolume = Math.max(0, Math.min(1, action.payload));
    },

    // Toggle notifications
    setNotificationsEnabled: (state, action) => {
      state.notificationsEnabled = action.payload;
    },

    // Mark tutorial as completed
    completeFirstLaunch: (state) => {
      state.firstLaunch = false;
    },

    // Mark tutorial as completed
    setTutorialCompleted: (state, action) => {
      state.tutorialCompleted = action.payload;
    },

    // Load settings from storage
    loadSettings: (state, action) => {
      return { ...state, ...action.payload };
    },

    // Reset to defaults
    resetSettings: (state) => {
      return { ...initialState, firstLaunch: false };
    },
  },
});

export const {
  setBreakDuration,
  setSoundVolume,
  setNotificationsEnabled,
  completeFirstLaunch,
  setTutorialCompleted,
  loadSettings,
  resetSettings,
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings;
export const selectIsFirstLaunch = (state) => state.settings.firstLaunch;
export const selectTutorialCompleted = (state) => state.settings.tutorialCompleted || false;
export const selectBreakDuration = (state) => state.settings.breakDuration;
export const selectSoundVolume = (state) => state.settings.soundVolume;
export const selectNotificationsEnabled = (state) => state.settings.notificationsEnabled;

export default settingsSlice.reducer;
