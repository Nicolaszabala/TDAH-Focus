import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TASK_TYPES, TASK_COLORS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';

/**
 * TaskForm Component
 * RF01: Create new task with title and type
 * RF07: Edit task title
 * RF08: Change task type
 * Validates that title is not empty
 */
export default function TaskForm({ task, onSave, onCancel }) {
  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || '');
  const [type, setType] = useState(task?.type || TASK_TYPES.OPTIONAL);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setType(task.type);
    }
  }, [task]);

  const handleSave = () => {
    // RF01: Validate title is not empty
    if (title.trim() === '') {
      setError('El título es obligatorio');
      return;
    }

    onSave({
      id: task?.id,
      title: title.trim(),
      type,
    });

    // Reset form
    setTitle('');
    setType(TASK_TYPES.OPTIONAL);
    setError('');
  };

  const handleCancel = () => {
    setTitle('');
    setType(TASK_TYPES.OPTIONAL);
    setError('');
    onCancel();
  };

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setError(''); // Clear error when user interacts
  };

  const handleTitleChange = (text) => {
    setTitle(text);
    if (error && text.trim() !== '') {
      setError(''); // Clear error when user starts typing
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Form Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={[
              styles.input,
              error && styles.inputError,
            ]}
            placeholder="¿Qué necesitas hacer?"
            value={title}
            onChangeText={handleTitleChange}
            autoFocus={!isEditing}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        {/* Type Selector */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de Tarea</Text>
          <View style={styles.typeButtons}>
            {/* Obligatory Button */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === TASK_TYPES.OBLIGATORY && styles.typeButtonActive,
                type === TASK_TYPES.OBLIGATORY && {
                  borderColor: TASK_COLORS.OBLIGATORY,
                  backgroundColor: TASK_COLORS.OBLIGATORY,
                },
              ]}
              onPress={() => handleTypeSelect(TASK_TYPES.OBLIGATORY)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color={
                  type === TASK_TYPES.OBLIGATORY
                    ? '#fff'
                    : TASK_COLORS.OBLIGATORY
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === TASK_TYPES.OBLIGATORY && styles.typeButtonTextActive,
                ]}
              >
                Obligatoria
              </Text>
            </TouchableOpacity>

            {/* Optional Button */}
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === TASK_TYPES.OPTIONAL && styles.typeButtonActive,
                type === TASK_TYPES.OPTIONAL && {
                  borderColor: TASK_COLORS.OPTIONAL,
                  backgroundColor: TASK_COLORS.OPTIONAL,
                },
              ]}
              onPress={() => handleTypeSelect(TASK_TYPES.OPTIONAL)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="star"
                size={20}
                color={
                  type === TASK_TYPES.OPTIONAL
                    ? '#fff'
                    : TASK_COLORS.OPTIONAL
                }
              />
              <Text
                style={[
                  styles.typeButtonText,
                  type === TASK_TYPES.OPTIONAL && styles.typeButtonTextActive,
                ]}
              >
                Opcional
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helperText}>
            {type === TASK_TYPES.OBLIGATORY
              ? 'Tareas que debes completar hoy'
              : 'Tareas que puedes hacer si tienes tiempo'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            activeOpacity={0.7}
          >
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Guardar' : 'Crear Tarea'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16, // RNF02
    color: '#2C3E50',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 80,
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 6,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 56, // RNF07
  },
  typeButtonActive: {
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  helperText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52, // RNF07
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#BDC3C7',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  saveButton: {
    backgroundColor: '#E74C3C',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
