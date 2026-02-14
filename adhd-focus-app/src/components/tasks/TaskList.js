import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFilteredTasks,
  toggleTaskComplete,
} from '../../store/slices/tasksSlice';
import TaskItem from './TaskItem';
import { Ionicons } from '@expo/vector-icons';

/**
 * TaskList Component
 * RF03: Display tasks with visual differentiation
 * RF04: Show filtered tasks
 * Displays list of tasks using FlatList for performance
 */
export default function TaskList({ onEditTask, onDeleteTask, onTaskPress, onNotesPress }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectFilteredTasks);
  const filter = useSelector((state) => state.tasks.filter);

  const handleToggleComplete = (taskId) => {
    dispatch(toggleTaskComplete(taskId));
  };

  const renderEmptyState = () => {
    let emptyMessage = '¡Agrega tu primera tarea!';
    let emptySubtext = 'Toca el botón + para comenzar';

    if (filter === 'obligatory') {
      emptyMessage = 'Sin tareas obligatorias';
      emptySubtext = 'No tienes tareas obligatorias pendientes';
    } else if (filter === 'optional') {
      emptyMessage = 'Sin tareas opcionales';
      emptySubtext = 'No tienes tareas opcionales pendientes';
    } else if (tasks.length === 0) {
      // Check if there are ANY tasks at all
      emptyMessage = '¡Comienza tu día!';
      emptySubtext = 'Organiza tus tareas para mantener el foco';
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="list-outline" size={80} color="#BDC3C7" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        <Text style={styles.emptySubtext}>{emptySubtext}</Text>
      </View>
    );
  };

  const renderTaskItem = ({ item }) => (
    <TaskItem
      task={item}
      onToggle={() => handleToggleComplete(item.id)}
      onEdit={() => onEditTask(item)}
      onDelete={() => onDeleteTask(item)}
      onPress={() => onTaskPress && onTaskPress(item)}
      onNotesPress={() => onNotesPress(item)}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          tasks.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 0, // We have margin on TaskItem, so no additional separator needed
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16, // RNF02: Minimum 16pt
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
});
