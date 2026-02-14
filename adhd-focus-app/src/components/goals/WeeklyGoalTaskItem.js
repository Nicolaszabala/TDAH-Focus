import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TASK_TYPES, TASK_COLORS } from '../../utils/constants';

/**
 * WeeklyGoalTaskItem Component
 * Displays task within weekly goal with points
 */
export default function WeeklyGoalTaskItem({ task, onToggle, onRemove }) {
  if (!task) return null;

  const isObligatory = task.type === TASK_TYPES.OBLIGATORY;
  const taskColor = isObligatory ? TASK_COLORS.OBLIGATORY : TASK_COLORS.OPTIONAL;
  const points = isObligatory ? 50 : 25;

  return (
    <View
      style={[
        styles.container,
        task.completed && styles.containerCompleted,
      ]}
    >
      {/* Left: Checkbox and content */}
      <View style={styles.leftContent}>
        {/* Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, { borderColor: taskColor }]}
          onPress={onToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={18} color={taskColor} />
          )}
        </TouchableOpacity>

        {/* Task info */}
        <View style={styles.taskInfo}>
          <Text
            style={[
              styles.taskTitle,
              task.completed && styles.taskTitleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          <View style={styles.metadata}>
            {/* Type badge */}
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

            {/* Points badge */}
            <View
              style={[
                styles.pointsBadge,
                task.completed && styles.pointsBadgeEarned,
              ]}
            >
              <Ionicons
                name={task.completed ? 'diamond' : 'diamond-outline'}
                size={12}
                color={task.completed ? '#27AE60' : '#95A5A6'}
              />
              <Text
                style={[
                  styles.pointsText,
                  task.completed && styles.pointsTextEarned,
                ]}
              >
                {points} pts
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right: Remove button */}
      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={22} color="#E74C3C" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3498DB',
  },
  containerCompleted: {
    opacity: 0.7,
    backgroundColor: '#F8F9FA',
    borderLeftColor: '#27AE60',
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
    lineHeight: 20,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#7F8C8D',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: '#F5F5F5',
  },
  pointsBadgeEarned: {
    backgroundColor: '#E8F5E9',
  },
  pointsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#95A5A6',
    marginLeft: 3,
  },
  pointsTextEarned: {
    color: '#27AE60',
  },
  removeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
