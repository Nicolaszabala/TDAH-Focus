import { createSlice } from '@reduxjs/toolkit';
import { FOCUS_MESSAGES } from '../../utils/constants';

const initialState = {
  isFocusModeActive: false,
  activeTask: null, // { id, title }
  focusMessage: '',
};

const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    // RF27: Activate focus mode
    activateFocusMode: (state, action) => {
      const { taskId, taskTitle } = action.payload;
      state.isFocusModeActive = true;
      state.activeTask = { id: taskId, title: taskTitle };

      // RF30: Show motivational message
      const randomIndex = Math.floor(Math.random() * FOCUS_MESSAGES.length);
      state.focusMessage = FOCUS_MESSAGES[randomIndex];
    },

    // RF29: Deactivate focus mode
    deactivateFocusMode: (state) => {
      state.isFocusModeActive = false;
      state.activeTask = null;
      state.focusMessage = '';
    },

    // Update focus message
    setFocusMessage: (state, action) => {
      state.focusMessage = action.payload;
    },
  },
});

export const {
  activateFocusMode,
  deactivateFocusMode,
  setFocusMessage,
} = focusSlice.actions;

// Selectors
export const selectIsFocusModeActive = (state) => state.focus.isFocusModeActive;
export const selectActiveTask = (state) => state.focus.activeTask;
export const selectFocusMessage = (state) => state.focus.focusMessage;

export default focusSlice.reducer;
