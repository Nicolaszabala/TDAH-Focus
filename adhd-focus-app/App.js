import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadTasks } from './src/store/slices/tasksSlice';
import { loadHistory } from './src/store/slices/pomodoroSlice';
import { loadSettings, setTutorialCompleted } from './src/store/slices/settingsSlice';
import * as storageService from './src/services/storageService';

/**
 * Main App Component
 * Integrates Redux store and navigation
 * Handles data persistence with AsyncStorage
 */
function AppContent() {
  useEffect(() => {
    // Load persisted data on app start
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      // RNF19: Validate storage integrity
      const integrity = await storageService.validateStorageIntegrity();

      if (!integrity.isValid) {
        console.warn('Storage integrity check failed:', integrity);
        // Could show a dialog to user here
        return;
      }

      // Load tasks
      const tasks = await storageService.loadTasks();
      if (tasks) {
        store.dispatch(loadTasks(tasks));
      }

      // Load pomodoro history
      const history = await storageService.loadPomodoroHistory();
      if (history) {
        store.dispatch(loadHistory(history));
      }

      // Load settings
      const settings = await storageService.loadSettings();
      if (settings) {
        store.dispatch(loadSettings(settings));
      }

      // Load tutorial completion status
      const tutorialCompleted = await storageService.loadTutorialCompleted();
      console.log('[App] Tutorial completed status loaded:', tutorialCompleted);
      store.dispatch(setTutorialCompleted(tutorialCompleted));
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  };

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
