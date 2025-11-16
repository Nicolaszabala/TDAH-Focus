import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, StatusBar, BackHandler, Alert } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  selectActiveTask,
  selectFocusMessage,
  deactivateFocusMode,
  activateFocusMode,
} from '../store/slices/focusSlice';
import { selectAllTasks } from '../store/slices/tasksSlice';
import { enableFocusMode, disableFocusMode } from '../services/notificationService';

/**
 * FocusScreen - Minimalist focus mode (RF27-RF30)
 * Implements "dumb phone" concept to reduce digital distractions
 * - Suppresses app notifications
 * - Minimalist interface
 * - Prevents navigation away from focus (blocks back button)
 */
export default function FocusScreen({ navigation }) {
  const dispatch = useDispatch();
  const activeTask = useSelector(selectActiveTask);
  const focusMessage = useSelector(selectFocusMessage);
  const tasks = useSelector(selectAllTasks);

  const [taskSelectorVisible, setTaskSelectorVisible] = useState(false);

  // Prevent navigation away from Focus Mode (React Navigation hook)
  usePreventRemove(true, ({ data }) => {
    Alert.alert(
      'Salir del Modo Concentración',
      'Estás en modo concentración. ¿Seguro que quieres salir?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            // Allow navigation
            navigation.dispatch(data.action);
          },
        },
      ]
    );
  });

  // Enable focus mode on mount (suppress notifications)
  useEffect(() => {
    enableFocusMode();

    return () => {
      // Re-enable notifications on unmount
      disableFocusMode();
    };
  }, []);

  // Also block hardware back button on Android as additional layer
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Show alert instead of silent blocking
      Alert.alert(
        'Salir del Modo Concentración',
        'Estás en modo concentración. Usa el botón "Salir" para terminar la sesión.',
        [{ text: 'OK' }]
      );
      return true; // Prevents going back
    });

    return () => backHandler.remove();
  }, []);

  // Filter only incomplete tasks
  const availableTasks = tasks.filter(task => !task.completed);

  const handleSelectTask = (task) => {
    dispatch(activateFocusMode({
      taskId: task.id,
      taskTitle: task.title,
    }));
    setTaskSelectorVisible(false);
  };

  const handleExitFocusMode = async () => {
    await disableFocusMode();
    dispatch(deactivateFocusMode());
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E1E1E" />

      {/* RF29: Motivational message */}
      <View style={styles.messageContainer}>
        <Ionicons name="bulb" size={48} color="#F39C12" style={styles.icon} />
        <Text style={styles.message}>{focusMessage || 'Enfócate en lo importante'}</Text>
      </View>

      {/* RF30: Active task display */}
      {activeTask ? (
        <View style={styles.taskContainer}>
          <Text style={styles.taskLabel}>Tu foco está en:</Text>
          <Text style={styles.taskTitle}>{activeTask.title}</Text>

          <TouchableOpacity
            style={styles.changeTaskButton}
            onPress={() => setTaskSelectorVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.changeTaskText}>Cambiar Tarea</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.noTaskContainer}>
          <Ionicons name="hand-right-outline" size={64} color="#7F8C8D" />
          <Text style={styles.noTaskText}>
            Selecciona una tarea para concentrarte
          </Text>
          <TouchableOpacity
            style={styles.selectTaskButton}
            onPress={() => setTaskSelectorVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={24} color="#fff" />
            <Text style={styles.selectTaskText}>Seleccionar Tarea</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Focus Mode Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#27AE60" />
          <Text style={styles.statusTitle}>Modo Concentración Activo</Text>
        </View>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Ionicons name="notifications-off" size={20} color="#27AE60" />
            <Text style={styles.statusText}>Notificaciones{'\n'}de la app{'\n'}silenciadas</Text>
          </View>

          <View style={styles.statusItem}>
            <Ionicons name="eye-off" size={20} color="#27AE60" />
            <Text style={styles.statusText}>Interfaz{'\n'}minimalista{'\n'}activa</Text>
          </View>

          <View style={styles.statusItem}>
            <Ionicons name="phone-portrait" size={20} color="#27AE60" />
            <Text style={styles.statusText}>Navegación{'\n'}bloqueada</Text>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle" size={16} color="#95A5A6" />
          <Text style={styles.disclaimerText}>
            Modo dumb phone: Se suprimen notificaciones de esta app.
            Para bloquear apps externas, activa No Molestar en ajustes del sistema.
          </Text>
        </View>
      </View>

      {/* RF28: Exit focus mode button */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={handleExitFocusMode}
        activeOpacity={0.7}
      >
        <Ionicons name="close-circle" size={24} color="#fff" />
        <Text style={styles.exitButtonText}>Salir del Modo Concentración</Text>
      </TouchableOpacity>

      {/* Task Selector Modal */}
      <Modal
        visible={taskSelectorVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setTaskSelectorVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Tarea</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setTaskSelectorVisible(false)}
              >
                <Ionicons name="close" size={28} color="#2C3E50" />
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
                      activeTask?.id === item.id && styles.taskItemSelected,
                    ]}
                    onPress={() => handleSelectTask(item)}
                  >
                    <View
                      style={[
                        styles.taskTypeIndicator,
                        { backgroundColor: item.isMandatory ? '#E74C3C' : '#3498DB' },
                      ]}
                    />
                    <View style={styles.taskItemContent}>
                      <Text style={styles.taskItemText} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.taskItemBadge}>
                        {item.isMandatory ? 'OBLIGATORIA' : 'OPCIONAL'}
                      </Text>
                    </View>
                    {activeTask?.id === item.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
                    )}
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
    flex: 1,
    backgroundColor: '#1E1E1E',
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 60,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    fontSize: 20,
    color: '#ECF0F1',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 28,
  },
  taskContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  taskLabel: {
    fontSize: 14,
    color: '#95A5A6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  taskTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  changeTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  changeTaskText: {
    color: '#fff',
    fontSize: 14,
  },
  noTaskContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  noTaskText: {
    fontSize: 18,
    color: '#95A5A6',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  selectTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  selectTaskText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginVertical: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusText: {
    fontSize: 11,
    color: '#ECF0F1',
    textAlign: 'center',
    lineHeight: 14,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#95A5A6',
    lineHeight: 16,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 56,
    gap: 8,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  taskItemContent: {
    flex: 1,
  },
  taskItemText: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 4,
  },
  taskItemBadge: {
    fontSize: 11,
    color: '#7F8C8D',
    fontWeight: '600',
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
