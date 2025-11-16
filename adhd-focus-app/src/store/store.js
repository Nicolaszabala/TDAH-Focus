import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import pomodoroReducer from './slices/pomodoroSlice';
import focusReducer from './slices/focusSlice';
import settingsReducer from './slices/settingsSlice';
import soundReducer from './slices/soundSlice';

/**
 * Redux Store Configuration
 * Combines all feature slices into a single store
 */
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    pomodoro: pomodoroReducer,
    focus: focusReducer,
    settings: settingsReducer,
    sound: soundReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types if needed
        ignoredActions: ['pomodoro/tick'],
      },
    }),
});

export default store;
