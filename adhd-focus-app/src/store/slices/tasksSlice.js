import { createSlice, createSelector } from '@reduxjs/toolkit';
import { TASK_TYPES, TASK_FILTERS } from '../../utils/constants';

const initialState = {
  tasks: [],
  filter: TASK_FILTERS.ALL,
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // RF01: Add new task
    addTask: (state, action) => {
      const { title, type } = action.payload;
      const newTask = {
        id: Date.now().toString(), // Simple ID generation
        title,
        type: type || TASK_TYPES.OPTIONAL,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
        notes: [],
      };
      state.tasks.unshift(newTask); // Add to beginning (most recent first)
    },

    // RF07: Edit task title
    editTask: (state, action) => {
      const { id, title, type } = action.payload;
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        if (title !== undefined) task.title = title;
        if (type !== undefined) task.type = type; // RF08: Change task type
      }
    },

    // RF05: Mark task as completed
    // RF06: Unmark task (toggle)
    toggleTaskComplete: (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
      }
    },

    // RF09: Delete task
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },

    // RF04: Set filter
    setFilter: (state, action) => {
      state.filter = action.payload;
    },

    // RF23: Add note to task
    addNote: (state, action) => {
      const { taskId, content } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        const newNote = {
          id: Date.now().toString(),
          content,
          createdAt: new Date().toISOString(),
        };
        task.notes.push(newNote);
      }
    },

    // RF26: Delete note
    deleteNote: (state, action) => {
      const { taskId, noteId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.notes = task.notes.filter(n => n.id !== noteId);
      }
    },

    // Edit note
    editNote: (state, action) => {
      const { taskId, noteId, content } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        const note = task.notes.find(n => n.id === noteId);
        if (note) {
          note.content = content;
          note.updatedAt = new Date().toISOString();
        }
      }
    },

    // Load tasks from storage
    loadTasks: (state, action) => {
      state.tasks = action.payload;
      state.loading = false;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear all tasks (for testing/reset)
    clearAllTasks: (state) => {
      state.tasks = [];
    },
  },
});

export const {
  addTask,
  editTask,
  toggleTaskComplete,
  deleteTask,
  setFilter,
  addNote,
  editNote,
  deleteNote,
  loadTasks,
  setLoading,
  setError,
  clearAllTasks,
} = tasksSlice.actions;

// Selectors
export const selectAllTasks = (state) => state.tasks.tasks;

export const selectFilteredTasks = (state) => {
  const { tasks, filter } = state.tasks;

  switch (filter) {
    case TASK_FILTERS.OBLIGATORY:
      return tasks.filter(t => t.type === TASK_TYPES.OBLIGATORY);
    case TASK_FILTERS.OPTIONAL:
      return tasks.filter(t => t.type === TASK_TYPES.OPTIONAL);
    default:
      return tasks;
  }
};

export const selectPendingTasks = (state) => {
  return state.tasks.tasks.filter(t => !t.completed);
};

export const selectObligatoryTasks = (state) => {
  return state.tasks.tasks.filter(t => t.type === TASK_TYPES.OBLIGATORY && !t.completed);
};

export const selectOptionalTasks = (state) => {
  return state.tasks.tasks.filter(t => t.type === TASK_TYPES.OPTIONAL && !t.completed);
};

export const selectTaskById = (taskId) => (state) => {
  return state.tasks.tasks.find(t => t.id === taskId);
};

// RF10: Task counts by type (memoized to avoid unnecessary re-renders)
const selectAllTasksBase = (state) => state.tasks.tasks;

export const selectTaskCounts = createSelector(
  [selectAllTasksBase],
  (tasks) => ({
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    obligatory: tasks.filter(t => t.type === TASK_TYPES.OBLIGATORY && !t.completed).length,
    optional: tasks.filter(t => t.type === TASK_TYPES.OPTIONAL && !t.completed).length,
  })
);

export default tasksSlice.reducer;
