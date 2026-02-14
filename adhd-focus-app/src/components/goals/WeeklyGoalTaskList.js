import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  toggleTaskComplete,
  selectAllTasks,
} from '../../store/slices/tasksSlice';
import {
  removeTaskFromGoal,
  updateGoalProgress,
} from '../../store/slices/weeklyGoalsSlice';
import WeeklyGoalTaskItem from './WeeklyGoalTaskItem';

/**
 * WeeklyGoalTaskList Component
 * Displays list of tasks in weekly goal
 */
export default function WeeklyGoalTaskList({ goal, onAddTask }) {
  const dispatch = useDispatch();
  const allTasks = useSelector(selectAllTasks);

  if (!goal) return null;

  // Get actual task objects from taskIds
  const goalTasks = goal.taskIds
    .map(taskId => allTasks.find(t => t.id === taskId))
    .filter(Boolean); // Remove any null/undefined (deleted tasks)

  const handleToggleTask = (taskId) => {
    dispatch(toggleTaskComplete(taskId));

    // Update goal progress
    setTimeout(() => {
      const completedIds = allTasks
        .filter(t => t.completed)
        .map(t => t.id);

      dispatch(
        updateGoalProgress({
          goalId: goal.id,
          completedTaskIds: completedIds,
        })
      );
    }, 100);
  };

  const handleRemoveTask = (taskId) => {
    dispatch(
      removeTaskFromGoal({
        goalId: goal.id,
        taskId,
      })
    );
  };

  const renderTaskItem = ({ item }) => (
    <WeeklyGoalTaskItem
      task={item}
      onToggle={() => handleToggleTask(item.id)}
      onRemove={() => handleRemoveTask(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="add-circle-outline" size={64} color="#BDC3C7" />
      <Text style={styles.emptyText}>
        No hay tareas en esta meta
      </Text>
      <Text style={styles.emptySubtext}>
        Agrega tareas para empezar a acumular puntos
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tasks list */}
      <FlatList
        data={goalTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          goalTasks.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      {/* Add task button */}
      {onAddTask && (
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={onAddTask}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={20} color="#3498DB" />
          <Text style={styles.addTaskText}>Agregar Tarea a Meta</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
  },
  addTaskText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3498DB',
    marginLeft: 8,
  },
});
