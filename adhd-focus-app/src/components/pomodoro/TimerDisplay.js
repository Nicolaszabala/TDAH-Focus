import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TIMER_STATES } from '../../utils/constants';

/**
 * TimerDisplay Component
 * Displays the countdown timer with visual feedback based on timer state
 *
 * @param {string} formattedTime - Time in MM:SS format
 * @param {string} timerState - Current state (IDLE, WORKING, BREAK, PAUSED)
 * @param {number} progress - Progress percentage (0-100) for circular indicator
 */
export default function TimerDisplay({ formattedTime, timerState, progress = 0 }) {
  // Determine color based on timer state
  const getStateColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORKING:
        return '#E74C3C'; // Red for work session
      case TIMER_STATES.BREAK:
        return '#27AE60'; // Green for break
      case TIMER_STATES.PAUSED:
        return '#F39C12'; // Orange for paused
      default:
        return '#95A5A6'; // Gray for idle
    }
  };

  const getStateLabel = () => {
    switch (timerState) {
      case TIMER_STATES.WORKING:
        return 'Sesión de Trabajo';
      case TIMER_STATES.BREAK:
        return 'Descanso';
      case TIMER_STATES.PAUSED:
        return 'Pausado';
      default:
        return 'Listo para comenzar';
    }
  };

  const stateColor = getStateColor();

  return (
    <View style={styles.container}>
      {/* Circular Progress Indicator */}
      <View style={[styles.timerCircle, { borderColor: stateColor }]}>
        <View style={styles.timerInner}>
          <Text style={[styles.timerText, { color: stateColor }]}>
            {formattedTime}
          </Text>
          <Text style={[styles.stateLabel, { color: stateColor }]}>
            {getStateLabel()}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progress}%`,
              backgroundColor: stateColor
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  stateLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  progressBarContainer: {
    width: 280,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 1s linear',
  },
});
