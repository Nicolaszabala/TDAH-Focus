import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import TimerDisplay from '../components/pomodoro/TimerDisplay';
import TimerControls from '../components/pomodoro/TimerControls';
import TaskSelector from '../components/pomodoro/TaskSelector';
import usePomodoro from '../hooks/usePomodoro';
import {
  startWorkSession,
  pauseTimer,
  resumeTimer,
  cancelSession,
  setBreakDuration,
  selectCurrentSession,
  selectFormattedTimeRemaining,
  selectBreakDuration,
} from '../store/slices/pomodoroSlice';
import { TIMER_STATES, TIMER_DURATIONS } from '../utils/constants';

/**
 * PomodoroScreen
 * Main screen for Pomodoro Timer functionality
 * Implements RF11-RF22: Pomodoro Timer requirements
 */
export default function PomodoroScreen() {
  const dispatch = useDispatch();
  const { timeRemaining, timerState, isTimerRunning } = usePomodoro();

  const currentSession = useSelector(selectCurrentSession);
  const formattedTime = useSelector(selectFormattedTimeRemaining);
  const breakDuration = useSelector(selectBreakDuration);

  const [selectedTask, setSelectedTask] = useState(null);

  // RF11: Break duration toggle (5 or 10 minutes)
  const isLongBreak = breakDuration === TIMER_DURATIONS.LONG_BREAK;

  const handleToggleBreakDuration = (value) => {
    const newDuration = value
      ? TIMER_DURATIONS.LONG_BREAK
      : TIMER_DURATIONS.SHORT_BREAK;
    dispatch(setBreakDuration(newDuration));
  };

  // RF12: Start work session
  const handleStart = () => {
    if (selectedTask) {
      dispatch(
        startWorkSession({
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
        })
      );
    }
  };

  // RF17: Pause timer
  const handlePause = () => {
    dispatch(pauseTimer());
  };

  // RF18: Resume timer
  const handleResume = () => {
    dispatch(resumeTimer());
  };

  // RF19: Cancel session
  const handleCancel = () => {
    dispatch(cancelSession());
    // Keep task selection for potential restart
  };

  // Calculate progress percentage for visual indicator
  const calculateProgress = () => {
    if (timerState === TIMER_STATES.IDLE) return 0;

    const totalDuration =
      timerState === TIMER_STATES.WORKING
        ? TIMER_DURATIONS.WORK
        : breakDuration;

    const elapsed = totalDuration - timeRemaining;
    return (elapsed / totalDuration) * 100;
  };

  const isSessionActive = timerState !== TIMER_STATES.IDLE;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Timer Display */}
      <TimerDisplay
        formattedTime={formattedTime}
        timerState={timerState}
        progress={calculateProgress()}
      />

      {/* Current Task Display */}
      {currentSession && (
        <View style={styles.currentTaskContainer}>
          <Text style={styles.currentTaskLabel}>Trabajando en:</Text>
          <Text style={styles.currentTaskTitle} numberOfLines={2}>
            {currentSession.taskTitle}
          </Text>
        </View>
      )}

      {/* Task Selector */}
      <TaskSelector
        selectedTask={selectedTask || currentSession}
        onSelectTask={setSelectedTask}
        disabled={isSessionActive}
      />

      {/* Break Duration Setting */}
      <View style={styles.settingContainer}>
        <View style={styles.settingContent}>
          <Text style={styles.settingLabel}>Duración de Descanso</Text>
          <View style={styles.settingOptions}>
            <Text style={[styles.optionText, !isLongBreak && styles.optionTextActive]}>
              5 min
            </Text>
            <Switch
              value={isLongBreak}
              onValueChange={handleToggleBreakDuration}
              disabled={isSessionActive}
              trackColor={{ false: '#3498DB', true: '#27AE60' }}
              thumbColor="#FFFFFF"
            />
            <Text style={[styles.optionText, isLongBreak && styles.optionTextActive]}>
              10 min
            </Text>
          </View>
        </View>
      </View>

      {/* Timer Controls */}
      <TimerControls
        timerState={timerState}
        isTimerRunning={isTimerRunning}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onCancel={handleCancel}
        hasSelectedTask={!!selectedTask}
      />

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          La técnica Pomodoro te ayuda a mantener el foco mediante intervalos de
          trabajo de 25 minutos seguidos de pausas configurables.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  currentTaskContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentTaskLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentTaskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  settingContainer: {
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    gap: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  settingOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: 16,
    color: '#95A5A6',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  infoContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#EBF5FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#AED6F1',
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
    textAlign: 'center',
  },
});
