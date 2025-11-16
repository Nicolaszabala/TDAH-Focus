import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  addTask,
  editTask,
  deleteTask,
  selectAllTasks,
} from '../store/slices/tasksSlice';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import * as storageService from '../services/storageService';

/**
 * TasksScreen
 * Main screen for task management
 * Integrates all task components
 * RF01-RF10: Complete CRUD for tasks
 */
export default function TasksScreen() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTasks);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // RNF17: Auto-save tasks whenever they change
  useEffect(() => {
    const saveTasksToStorage = async () => {
      await storageService.saveTasks(tasks);
    };

    if (tasks.length > 0) {
      // Debounce save to avoid excessive writes
      const timeoutId = setTimeout(saveTasksToStorage, 500);
      return () => clearTimeout(timeoutId);
    } else {
      saveTasksToStorage(); // Save immediately for empty state
    }
  }, [tasks]);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsFormVisible(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsFormVisible(true);
  };

  const handleDeleteTask = (task) => {
    setDeletingTask(task);
    setIsDeleteModalVisible(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      // RF07, RF08: Edit existing task
      dispatch(editTask(taskData));
    } else {
      // RF01: Add new task
      dispatch(addTask(taskData));
    }

    setIsFormVisible(false);
    setEditingTask(null);
  };

  const handleConfirmDelete = () => {
    if (deletingTask) {
      // RF09: Delete task (after confirmation)
      dispatch(deleteTask(deletingTask.id));
    }

    setIsDeleteModalVisible(false);
    setDeletingTask(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setDeletingTask(null);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingTask(null);
  };

  return (
    <View style={styles.container}>
      {/* RF04: Filters */}
      <TaskFilters />

      {/* RF03: Task list */}
      <TaskList
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* FAB: Floating Action Button to add task */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddTask}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Task Form Modal */}
      <Modal
        visible={isFormVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TaskForm
            task={editingTask}
            onSave={handleSaveTask}
            onCancel={handleCancelForm}
          />
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        visible={isDeleteModalVisible}
        title="¿Eliminar tarea?"
        message={`¿Estás seguro que deseas eliminar "${deletingTask?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E74C3C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
