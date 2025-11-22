import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import {
  selectActiveGoal,
} from '../store/slices/weeklyGoalsSlice';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import DeleteConfirmModal from '../components/common/DeleteConfirmModal';
import NotesModal from '../components/tasks/NotesModal';
import WeeklyGoalHeader from '../components/goals/WeeklyGoalHeader';
import WeeklyGoalTaskList from '../components/goals/WeeklyGoalTaskList';
import EmptyGoalState from '../components/goals/EmptyGoalState';
import CreateGoalModal from '../components/goals/CreateGoalModal';
import * as storageService from '../services/storageService';

/**
 * TasksScreen
 * Main screen for task management with tabs
 * RF01-RF10: Complete CRUD for tasks
 * Weekly Goals: Manage weekly goals with gamification
 */
export default function TasksScreen() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTasks);
  const activeGoal = useSelector(selectActiveGoal);

  // Tab state
  const [activeTab, setActiveTab] = useState('tasks');

  // Tasks tab state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [notesTask, setNotesTask] = useState(null);

  // Goals tab state
  const [isCreateGoalModalVisible, setIsCreateGoalModalVisible] = useState(false);

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

  // Tasks handlers
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

  const handleOpenNotes = (task) => {
    setNotesTask(task);
    setIsNotesModalVisible(true);
  };

  const handleCloseNotes = () => {
    setIsNotesModalVisible(false);
    setNotesTask(null);
  };

  // Goals handlers
  const handleCreateGoal = () => {
    setIsCreateGoalModalVisible(true);
  };

  const handleCloseCreateGoal = () => {
    setIsCreateGoalModalVisible(false);
  };

  const handleCreateTaskFromGoal = () => {
    // Close create goal modal and open task form
    setIsCreateGoalModalVisible(false);
    setEditingTask(null);
    setIsFormVisible(true);
  };

  const handleAddTaskToGoal = () => {
    // Open task form to create new task
    setEditingTask(null);
    setIsFormVisible(true);
  };

  // Render tab buttons
  const renderTabButton = (tab, icon, label) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.tabButtonActive]}
        onPress={() => setActiveTab(tab)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isActive ? '#3498DB' : '#7F8C8D'}
        />
        <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs header */}
      <View style={styles.tabsHeader}>
        {renderTabButton('tasks', 'list', 'Mis Tareas')}
        {renderTabButton('goal', 'trophy', 'Meta Semanal')}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 'tasks' ? (
          <>
            {/* Tasks tab */}
            <TaskFilters />
            <TaskList
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onNotesPress={handleOpenNotes}
            />

            {/* FAB: Floating Action Button to add task */}
            <TouchableOpacity
              style={styles.fab}
              onPress={handleAddTask}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Goals tab */}
            <View style={styles.goalsContainer}>
              {activeGoal ? (
                <>
                  <WeeklyGoalHeader goal={activeGoal} />
                  <WeeklyGoalTaskList
                    goal={activeGoal}
                    onAddTask={handleAddTaskToGoal}
                  />
                </>
              ) : (
                <EmptyGoalState onCreateGoal={handleCreateGoal} />
              )}
            </View>
          </>
        )}
      </View>

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

      {/* Notes Modal */}
      <NotesModal
        visible={isNotesModalVisible}
        task={notesTask}
        onClose={handleCloseNotes}
      />

      {/* Create Goal Modal */}
      <CreateGoalModal
        visible={isCreateGoalModalVisible}
        onClose={handleCloseCreateGoal}
        onTaskCreate={handleCreateTaskFromGoal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#3498DB',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7F8C8D',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#3498DB',
  },
  tabContent: {
    flex: 1,
  },
  goalsContainer: {
    flex: 1,
    padding: 16,
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
