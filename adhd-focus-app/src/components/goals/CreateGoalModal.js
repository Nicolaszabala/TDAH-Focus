import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllTasks } from '../../store/slices/tasksSlice';
import { createGoal, updateWeekSettings } from '../../store/slices/weeklyGoalsSlice';
import { selectWeekSettings } from '../../store/slices/weeklyGoalsSlice';

/**
 * CreateGoalModal Component
 * Modal for creating a new weekly goal
 */
export default function CreateGoalModal({ visible, onClose, onTaskCreate }) {
  const dispatch = useDispatch();
  const allTasks = useSelector(selectAllTasks);
  const weekSettings = useSelector(selectWeekSettings);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [weekType, setWeekType] = useState(weekSettings.defaultWeekType);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const handleToggleTask = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleCreate = () => {
    if (!title.trim()) {
      return; // Validation: title is required
    }

    // Update default week type if changed
    if (weekType !== weekSettings.defaultWeekType) {
      dispatch(updateWeekSettings({ defaultWeekType: weekType }));
    }

    // Create goal
    dispatch(
      createGoal({
        title: title.trim(),
        description: description.trim(),
        weekType,
        taskIds: selectedTaskIds,
      })
    );

    // Reset and close
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setWeekType(weekSettings.defaultWeekType);
    setSelectedTaskIds([]);
    onClose();
  };

  // Filter out already completed tasks
  const availableTasks = allTasks.filter(t => !t.completed);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="trophy" size={24} color="#F39C12" />
            <Text style={styles.headerTitle}>Nueva Meta Semanal</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#2C3E50" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Title input */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Título de la meta <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Preparar examen de matemáticas"
              placeholderTextColor="#95A5A6"
              maxLength={80}
            />
          </View>

          {/* Description input */}
          <View style={styles.section}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Agrega detalles adicionales..."
              placeholderTextColor="#95A5A6"
              multiline
              maxLength={200}
            />
          </View>

          {/* Week type selector */}
          <View style={styles.section}>
            <Text style={styles.label}>Tipo de semana</Text>

            <TouchableOpacity
              style={[
                styles.weekTypeOption,
                weekType === 'rolling' && styles.weekTypeOptionSelected,
              ]}
              onPress={() => setWeekType('rolling')}
              activeOpacity={0.7}
            >
              <View style={styles.weekTypeContent}>
                <Ionicons
                  name={weekType === 'rolling' ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={weekType === 'rolling' ? '#3498DB' : '#95A5A6'}
                />
                <View style={styles.weekTypeTextContainer}>
                  <Text style={styles.weekTypeTitle}>7 días corridos</Text>
                  <Text style={styles.weekTypeDescription}>
                    Desde hoy hasta dentro de 7 días
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.weekTypeOption,
                weekType === 'fixed' && styles.weekTypeOptionSelected,
              ]}
              onPress={() => setWeekType('fixed')}
              activeOpacity={0.7}
            >
              <View style={styles.weekTypeContent}>
                <Ionicons
                  name={weekType === 'fixed' ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={weekType === 'fixed' ? '#3498DB' : '#95A5A6'}
                />
                <View style={styles.weekTypeTextContainer}>
                  <Text style={styles.weekTypeTitle}>Lunes a Domingo</Text>
                  <Text style={styles.weekTypeDescription}>
                    Semana calendario estándar
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Tasks selector */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Selecciona tareas ({selectedTaskIds.length} seleccionadas)
            </Text>

            {availableTasks.length > 0 ? (
              <View style={styles.tasksList}>
                {availableTasks.map(task => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.taskOption,
                      selectedTaskIds.includes(task.id) && styles.taskOptionSelected,
                    ]}
                    onPress={() => handleToggleTask(task.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.taskCheckbox}>
                      {selectedTaskIds.includes(task.id) && (
                        <Ionicons name="checkmark" size={18} color="#3498DB" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.taskTitle,
                        selectedTaskIds.includes(task.id) && styles.taskTitleSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </Text>
                    <View
                      style={[
                        styles.taskTypeBadge,
                        { backgroundColor: task.type === 'obligatory' ? '#E74C3C' : '#3498DB' },
                      ]}
                    >
                      <Text style={styles.taskTypeBadgeText}>
                        {task.type === 'obligatory' ? 'OBL' : 'OPC'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noTasksContainer}>
                <Ionicons name="information-circle-outline" size={48} color="#BDC3C7" />
                <Text style={styles.noTasksText}>
                  No hay tareas disponibles
                </Text>
                <Text style={styles.noTasksSubtext}>
                  Crea tareas primero en la sección "Mis Tareas"
                </Text>
              </View>
            )}

            {/* Create new task button */}
            {onTaskCreate && (
              <TouchableOpacity
                style={styles.createTaskButton}
                onPress={onTaskCreate}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={20} color="#27AE60" />
                <Text style={styles.createTaskButtonText}>
                  Crear nueva tarea
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Footer with action buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.createButton,
              !title.trim() && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!title.trim()}
            activeOpacity={0.7}
          >
            <Text style={styles.createButtonText}>Crear Meta</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  weekTypeOption: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  weekTypeOptionSelected: {
    borderColor: '#3498DB',
    backgroundColor: '#E8F4FD',
  },
  weekTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekTypeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  weekTypeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  weekTypeDescription: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  tasksList: {
    marginBottom: 12,
  },
  taskOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  taskOptionSelected: {
    borderColor: '#3498DB',
    backgroundColor: '#E8F4FD',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3498DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 8,
  },
  taskTitleSelected: {
    fontWeight: '600',
  },
  taskTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  taskTypeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  noTasksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTasksText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 12,
  },
  noTasksSubtext: {
    fontSize: 13,
    color: '#95A5A6',
    marginTop: 6,
    textAlign: 'center',
  },
  createTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#27AE60',
    borderStyle: 'dashed',
  },
  createTaskButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27AE60',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#F8F9FA',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#3498DB',
  },
  createButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
