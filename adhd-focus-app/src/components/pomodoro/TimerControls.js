import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { TIMER_STATES } from '../../utils/constants';

/**
 * TimerControls Component
 * Displays control buttons for the Pomodoro timer
 *
 * @param {string} timerState - Current timer state
 * @param {boolean} isTimerRunning - Whether timer is currently running
 * @param {Function} onStart - Callback to start timer
 * @param {Function} onPause - Callback to pause timer
 * @param {Function} onResume - Callback to resume timer
 * @param {Function} onCancel - Callback to cancel session
 * @param {boolean} hasSelectedTask - Whether a task is selected
 */
export default function TimerControls({
  timerState,
  isTimerRunning,
  onStart,
  onPause,
  onResume,
  onCancel,
  hasSelectedTask = false,
}) {
  const renderPrimaryButton = () => {
    // If idle and no task selected, disabled
    if (timerState === TIMER_STATES.IDLE && !hasSelectedTask) {
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.disabledButton]}
          disabled
        >
          <Text style={styles.primaryButtonText}>
            Selecciona una tarea para comenzar
          </Text>
        </TouchableOpacity>
      );
    }

    // If idle with task selected, show start
    if (timerState === TIMER_STATES.IDLE) {
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.startButton]}
          onPress={onStart}
        >
          <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      );
    }

    // If paused, show resume
    if (timerState === TIMER_STATES.PAUSED) {
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.resumeButton]}
          onPress={onResume}
        >
          <Text style={styles.primaryButtonText}>Reanudar</Text>
        </TouchableOpacity>
      );
    }

    // If running (working or break), show pause
    if (isTimerRunning) {
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.pauseButton]}
          onPress={onPause}
        >
          <Text style={styles.primaryButtonText}>Pausar</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  const showCancelButton = timerState !== TIMER_STATES.IDLE;

  return (
    <View style={styles.container}>
      {renderPrimaryButton()}

      {showCancelButton && (
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onCancel}
        >
          <Text style={styles.secondaryButtonText}>Cancelar Sesión</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 12,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#27AE60',
  },
  pauseButton: {
    backgroundColor: '#F39C12',
  },
  resumeButton: {
    backgroundColor: '#3498DB',
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: '600',
  },
});
