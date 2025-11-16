import { createSlice } from '@reduxjs/toolkit';
import { TIMER_STATES, TIMER_DURATIONS } from '../../utils/constants';

const initialState = {
  // RF11: Configurable break duration (5 or 10 minutes)
  breakDuration: TIMER_DURATIONS.SHORT_BREAK,
  workDuration: TIMER_DURATIONS.WORK, // Fixed 25 minutes

  // Current session state
  currentSession: null, // { taskId, taskTitle, startTime }
  timerState: TIMER_STATES.IDLE,
  timeRemaining: 0,
  previousTimerState: null, // Store state before pause

  // History of completed sessions
  history: [], // { id, taskId, taskTitle, duration, startTime, endTime }

  // Timer control
  isTimerRunning: false,
};

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    // RF11: Set break duration
    setBreakDuration: (state, action) => {
      state.breakDuration = action.payload;
    },

    // RF12: Start work session
    startWorkSession: (state, action) => {
      const { taskId, taskTitle } = action.payload;
      state.currentSession = {
        taskId,
        taskTitle,
        startTime: new Date().toISOString(),
      };
      state.timerState = TIMER_STATES.WORKING;
      state.timeRemaining = state.workDuration;
      state.isTimerRunning = true;
    },

    // RF15: Start break session
    startBreakSession: (state) => {
      state.timerState = TIMER_STATES.BREAK;
      state.timeRemaining = state.breakDuration;
      state.isTimerRunning = true;
    },

    // RF17: Pause timer
    pauseTimer: (state) => {
      if (state.timerState !== TIMER_STATES.IDLE && state.timerState !== TIMER_STATES.PAUSED) {
        state.previousTimerState = state.timerState; // Save current state
        state.timerState = TIMER_STATES.PAUSED;
        state.isTimerRunning = false;
      }
    },

    // RF18: Resume timer
    resumeTimer: (state) => {
      if (state.timerState === TIMER_STATES.PAUSED && state.previousTimerState) {
        // Restore previous state (was it working or break?)
        state.timerState = state.previousTimerState;
        state.previousTimerState = null;
        state.isTimerRunning = true;
      }
    },

    // RF19: Cancel session (don't save to history)
    cancelSession: (state) => {
      state.currentSession = null;
      state.timerState = TIMER_STATES.IDLE;
      state.timeRemaining = 0;
      state.isTimerRunning = false;
    },

    // RF13: Tick - decrement timer by 1 second
    tick: (state) => {
      if (state.isTimerRunning && state.timeRemaining > 0) {
        state.timeRemaining -= 1;
      }
    },

    // RF14, RF20: Complete work interval (25 minutes)
    completeWorkInterval: (state) => {
      if (state.currentSession) {
        // Save to history
        const completedSession = {
          id: Date.now().toString(),
          taskId: state.currentSession.taskId,
          taskTitle: state.currentSession.taskTitle,
          duration: state.workDuration,
          startTime: state.currentSession.startTime,
          endTime: new Date().toISOString(),
        };
        state.history.unshift(completedSession);
      }

      // RF15: Transition to break
      state.timerState = TIMER_STATES.BREAK;
      state.timeRemaining = state.breakDuration;
      state.isTimerRunning = true; // Auto-start break timer
    },

    // RF16: Complete break interval
    completeBreakInterval: (state) => {
      // Reset to idle, keep session for potential restart
      state.timerState = TIMER_STATES.IDLE;
      state.timeRemaining = 0;
      state.isTimerRunning = false;
      state.currentSession = null;
    },

    // Load history from storage
    loadHistory: (state, action) => {
      state.history = action.payload;
    },

    // Clear history (for testing/reset)
    clearHistory: (state) => {
      state.history = [];
    },

    // Update timer state (for persistence recovery)
    updateTimerState: (state, action) => {
      const { timerState, timeRemaining, currentSession } = action.payload;
      if (timerState) state.timerState = timerState;
      if (timeRemaining !== undefined) state.timeRemaining = timeRemaining;
      if (currentSession !== undefined) state.currentSession = currentSession;
    },
  },
});

export const {
  setBreakDuration,
  startWorkSession,
  startBreakSession,
  pauseTimer,
  resumeTimer,
  cancelSession,
  tick,
  completeWorkInterval,
  completeBreakInterval,
  loadHistory,
  clearHistory,
  updateTimerState,
} = pomodoroSlice.actions;

// Selectors
export const selectTimerState = (state) => state.pomodoro.timerState;
export const selectTimeRemaining = (state) => state.pomodoro.timeRemaining;
export const selectCurrentSession = (state) => state.pomodoro.currentSession;
export const selectIsTimerRunning = (state) => state.pomodoro.isTimerRunning;
export const selectBreakDuration = (state) => state.pomodoro.breakDuration;

// RF21: History organized by date
export const selectHistory = (state) => state.pomodoro.history;

// RF22: Total sessions per task
export const selectSessionsByTask = (state) => {
  const sessionsByTask = {};
  state.pomodoro.history.forEach(session => {
    const taskId = session.taskId;
    if (!sessionsByTask[taskId]) {
      sessionsByTask[taskId] = {
        taskId,
        taskTitle: session.taskTitle,
        count: 0,
        totalDuration: 0,
      };
    }
    sessionsByTask[taskId].count += 1;
    sessionsByTask[taskId].totalDuration += session.duration;
  });
  return Object.values(sessionsByTask);
};

// Formatted time remaining (MM:SS)
export const selectFormattedTimeRemaining = (state) => {
  const totalSeconds = state.pomodoro.timeRemaining;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default pomodoroSlice.reducer;
