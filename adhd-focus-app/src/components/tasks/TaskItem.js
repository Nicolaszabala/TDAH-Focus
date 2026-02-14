import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TASK_TYPES, TASK_COLORS } from '../../utils/constants';

/**
 * TaskItem Component
 * Displays individual task with actions
 * RF03: Visual differentiation by type with chromatic contrast
 * RF05, RF06: Toggle complete status
 * RF07, RF08: Edit task (title and type)
 * RF09: Delete task
 */
export default function TaskItem({ task, onToggle, onEdit, onDelete, onPress, onNotesPress }) {
  const isObligatory = task.type === TASK_TYPES.OBLIGATORY;
  const taskColor = isObligatory ? TASK_COLORS.OBLIGATORY : TASK_COLORS.OPTIONAL;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        task.completed && styles.containerCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left side: Checkbox and content */}
      <View style={styles.leftContent}>
        {/* RF05, RF06: Checkbox to toggle completion */}
        <TouchableOpacity
          style={[styles.checkbox, { borderColor: taskColor }]}
          onPress={onToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={20} color={taskColor} />
          )}
        </TouchableOpacity>

        <View style={styles.textContent}>
          {/* Task title */}
          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Task metadata */}
          <View style={styles.metadata}>
            {/* RF03: Type badge with color differentiation */}
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: taskColor },
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {isObligatory ? 'OBLIGATORIA' : 'OPCIONAL'}
              </Text>
            </View>

            {/* RF02: Creation timestamp */}
            <Text style={styles.timestamp}>
              {formatDate(task.createdAt)}
            </Text>

            {/* Notes indicator */}
            {task.notes && task.notes.length > 0 && (
              <View style={styles.notesIndicator}>
                <Ionicons name="document-text" size={14} color="#7F8C8D" />
                <Text style={styles.notesCount}>{task.notes.length}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Right side: Action buttons */}
      <View style={styles.actions}>
        {/* Notes button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.notesButton]}
          onPress={onNotesPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="document-text" size={18} color="#9B59B6" />
          {task.notes && task.notes.length > 0 && (
            <View style={styles.notesBadge}>
              <Text style={styles.notesBadgeText}>{task.notes.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* RF07, RF08: Edit button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="pencil" size={18} color="#3498DB" />
        </TouchableOpacity>

        {/* RF09: Delete button */}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash" size={18} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80, // Ensure enough height for content
  },
  containerCompleted: {
    opacity: 0.6,
    backgroundColor: '#F8F9FA',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16, // RNF02: Minimum 16pt font
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#7F8C8D',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    color: '#95A5A6',
    marginRight: 8,
    marginBottom: 4,
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notesCount: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36, // RNF07: Minimum 44x44pt touch target (with hitSlop)
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notesButton: {
    backgroundColor: '#F4ECF7',
    position: 'relative',
  },
  notesBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#9B59B6',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notesBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#E8F4FD',
  },
  deleteButton: {
    backgroundColor: '#FDEAEA',
  },
});
