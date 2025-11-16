import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAllTasks } from '../../store/slices/tasksSlice';

/**
 * TaskSelector Component
 * Allows user to select a task to associate with the Pomodoro session
 *
 * @param {Object} selectedTask - Currently selected task {id, title}
 * @param {Function} onSelectTask - Callback when task is selected
 * @param {boolean} disabled - Whether selector is disabled (during active session)
 */
export default function TaskSelector({ selectedTask, onSelectTask, disabled = false }) {
  const [modalVisible, setModalVisible] = useState(false);
  const tasks = useSelector(selectAllTasks);

  // Filter only incomplete tasks
  const availableTasks = tasks.filter(task => !task.completed);

  const handleSelectTask = (task) => {
    onSelectTask({ id: task.id, title: task.title });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tarea Actual:</Text>

      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          selectedTask && styles.selectorSelected,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedTask && styles.selectorPlaceholder,
            disabled && styles.selectorTextDisabled,
          ]}
          numberOfLines={1}
        >
          {selectedTask ? selectedTask.title : 'Selecciona una tarea'}
        </Text>
      </TouchableOpacity>

      {/* Task Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Tarea</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {availableTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No hay tareas pendientes.{'\n'}
                  Crea una tarea primero.
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.taskItem,
                      selectedTask?.id === item.id && styles.taskItemSelected,
                    ]}
                    onPress={() => handleSelectTask(item)}
                  >
                    <View
                      style={[
                        styles.taskTypeIndicator,
                        { backgroundColor: item.isMandatory ? '#E74C3C' : '#3498DB' },
                      ]}
                    />
                    <Text style={styles.taskItemText} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.taskList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  selector: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  selectorSelected: {
    borderColor: '#3498DB',
    backgroundColor: '#EBF5FB',
  },
  selectorDisabled: {
    backgroundColor: '#ECF0F1',
    borderColor: '#D5DBDB',
  },
  selectorText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectorPlaceholder: {
    color: '#95A5A6',
  },
  selectorTextDisabled: {
    color: '#7F8C8D',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#7F8C8D',
  },
  taskList: {
    padding: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  taskItemSelected: {
    backgroundColor: '#EBF5FB',
    borderColor: '#3498DB',
  },
  taskTypeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
});
