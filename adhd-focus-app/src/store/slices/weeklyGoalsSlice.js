import { createSlice, createSelector } from '@reduxjs/toolkit';

/**
 * Weekly Goals Slice
 * Manages weekly goals with task references
 */

const initialState = {
  goals: [],
  activeGoalId: null, // Only ONE active goal at a time
  archivedGoals: [],
  settings: {
    defaultWeekType: 'rolling', // 'rolling' or 'fixed'
    weekStartDay: 1, // 0=Sunday, 1=Monday (for 'fixed' type)
  },
  loading: false,
  error: null,
};

const weeklyGoalsSlice = createSlice({
  name: 'weeklyGoals',
  initialState,
  reducers: {
    // Create a new weekly goal
    createGoal: (state, action) => {
      const { title, description, weekType, taskIds } = action.payload;

      const now = new Date();
      let startDate = now;
      let endDate;

      if (weekType === 'fixed') {
        // Calculate start of week (Monday or custom day)
        const currentDay = now.getDay();
        const daysToStart = (currentDay - state.settings.weekStartDay + 7) % 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysToStart);
        startDate.setHours(0, 0, 0, 0);

        // End date is 7 days later
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Rolling: 7 days from now
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        endDate.setHours(23, 59, 59, 999);
      }

      const newGoal = {
        id: Date.now().toString(),
        title,
        description: description || '',
        weekType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: 'active',
        taskIds: taskIds || [],
        totalTasks: (taskIds || []).length,
        completedTasks: 0,
        progressPercentage: 0,
        pointsEarned: 0,
        bonusApplied: false,
        createdAt: now.toISOString(),
        completedAt: null,
        archivedAt: null,
      };

      state.goals.push(newGoal);
      state.activeGoalId = newGoal.id;
    },

    // Update goal details
    updateGoal: (state, action) => {
      const { id, title, description } = action.payload;
      const goal = state.goals.find(g => g.id === id);
      if (goal && goal.status === 'active') {
        if (title !== undefined) goal.title = title;
        if (description !== undefined) goal.description = description;
      }
    },

    // Add task to goal
    addTaskToGoal: (state, action) => {
      const { goalId, taskId } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal && goal.status === 'active' && !goal.taskIds.includes(taskId)) {
        goal.taskIds.push(taskId);
        goal.totalTasks = goal.taskIds.length;
        // Recalculate progress
        goal.progressPercentage = goal.totalTasks > 0
          ? Math.round((goal.completedTasks / goal.totalTasks) * 100)
          : 0;
      }
    },

    // Remove task from goal
    removeTaskFromGoal: (state, action) => {
      const { goalId, taskId } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal && goal.status === 'active') {
        goal.taskIds = goal.taskIds.filter(id => id !== taskId);
        goal.totalTasks = goal.taskIds.length;
        // Recalculate progress
        goal.progressPercentage = goal.totalTasks > 0
          ? Math.round((goal.completedTasks / goal.totalTasks) * 100)
          : 0;
      }
    },

    // Update goal progress (called when tasks are completed/uncompleted)
    updateGoalProgress: (state, action) => {
      const { goalId, completedTaskIds } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal) {
        // Count how many tasks in this goal are completed
        goal.completedTasks = goal.taskIds.filter(taskId =>
          completedTaskIds.includes(taskId)
        ).length;

        goal.progressPercentage = goal.totalTasks > 0
          ? Math.round((goal.completedTasks / goal.totalTasks) * 100)
          : 0;

        // Auto-complete if all tasks done
        if (goal.completedTasks === goal.totalTasks && goal.totalTasks > 0) {
          goal.status = 'completed';
          goal.completedAt = new Date().toISOString();
        }
      }
    },

    // Manually complete goal
    completeGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal && goal.status === 'active') {
        goal.status = 'completed';
        goal.completedAt = new Date().toISOString();
      }
    },

    // Archive goal
    archiveGoal: (state, action) => {
      const goalId = action.payload;
      const goalIndex = state.goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        const goal = state.goals[goalIndex];
        goal.status = 'archived';
        goal.archivedAt = new Date().toISOString();

        // Move to archived goals
        state.archivedGoals.unshift(goal);
        state.goals.splice(goalIndex, 1);

        // Clear active goal if this was it
        if (state.activeGoalId === goalId) {
          state.activeGoalId = null;
        }
      }
    },

    // Delete goal (only if not archived)
    deleteGoal: (state, action) => {
      const goalId = action.payload;
      const goalIndex = state.goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        state.goals.splice(goalIndex, 1);
        if (state.activeGoalId === goalId) {
          state.activeGoalId = null;
        }
      }
    },

    // Set active goal
    setActiveGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal && goal.status === 'active') {
        state.activeGoalId = goalId;
      }
    },

    // Update week settings
    updateWeekSettings: (state, action) => {
      const { defaultWeekType, weekStartDay } = action.payload;
      if (defaultWeekType !== undefined) {
        state.settings.defaultWeekType = defaultWeekType;
      }
      if (weekStartDay !== undefined) {
        state.settings.weekStartDay = weekStartDay;
      }
    },

    // Add points to goal (called from gamification system)
    addPointsToGoal: (state, action) => {
      const { goalId, points } = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal) {
        goal.pointsEarned += points;
      }
    },

    // Apply bonus to goal
    applyBonusToGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find(g => g.id === goalId);
      if (goal && !goal.bonusApplied) {
        goal.bonusApplied = true;
      }
    },

    // Load goals from storage
    loadGoals: (state, action) => {
      const { goals, archivedGoals, settings, activeGoalId } = action.payload;
      state.goals = goals || [];
      state.archivedGoals = archivedGoals || [];
      state.settings = settings || initialState.settings;
      state.activeGoalId = activeGoalId || null;
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

    // Clear all goals (for testing/reset)
    clearAllGoals: (state) => {
      state.goals = [];
      state.archivedGoals = [];
      state.activeGoalId = null;
    },
  },
});

export const {
  createGoal,
  updateGoal,
  addTaskToGoal,
  removeTaskFromGoal,
  updateGoalProgress,
  completeGoal,
  archiveGoal,
  deleteGoal,
  setActiveGoal,
  updateWeekSettings,
  addPointsToGoal,
  applyBonusToGoal,
  loadGoals,
  setLoading,
  setError,
  clearAllGoals,
} = weeklyGoalsSlice.actions;

// Selectors
export const selectAllGoals = (state) => state.weeklyGoals.goals;

export const selectActiveGoal = (state) => {
  const activeId = state.weeklyGoals.activeGoalId;
  return state.weeklyGoals.goals.find(g => g.id === activeId) || null;
};

export const selectArchivedGoals = (state) => state.weeklyGoals.archivedGoals;

export const selectWeekSettings = (state) => state.weeklyGoals.settings;

export const selectGoalById = (goalId) => (state) => {
  return state.weeklyGoals.goals.find(g => g.id === goalId);
};

// Check if goal is expired (past end date)
export const selectIsGoalExpired = (goalId) => (state) => {
  const goal = state.weeklyGoals.goals.find(g => g.id === goalId);
  if (!goal) return false;
  return new Date() > new Date(goal.endDate);
};

// Get days remaining in active goal
export const selectDaysRemainingInActiveGoal = (state) => {
  const activeGoal = selectActiveGoal(state);
  if (!activeGoal) return null;

  const now = new Date();
  const endDate = new Date(activeGoal.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

// Get goal statistics (memoized)
export const selectGoalStats = createSelector(
  [selectAllGoals, selectArchivedGoals],
  (goals, archivedGoals) => {
    const totalGoals = goals.length + archivedGoals.length;
    const completedGoals = archivedGoals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;

    return {
      total: totalGoals,
      completed: completedGoals,
      active: activeGoals,
      completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
    };
  }
);

export default weeklyGoalsSlice.reducer;
