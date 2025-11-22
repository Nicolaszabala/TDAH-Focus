import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateRange, getDaysRemaining } from '../../services/goalService';

/**
 * WeeklyGoalHeader Component
 * Displays weekly goal header with progress and stats
 */
export default function WeeklyGoalHeader({ goal, onSettings }) {
  if (!goal) return null;

  const daysRemaining = getDaysRemaining(goal);
  const dateRange = formatDateRange(goal.startDate, goal.endDate);
  const progressPercentage = goal.progressPercentage || 0;

  // Progress bar color based on completion
  const getProgressColor = () => {
    if (progressPercentage === 100) return '#27AE60';
    if (progressPercentage >= 75) return '#3498DB';
    if (progressPercentage >= 50) return '#F39C12';
    return '#95A5A6';
  };

  // Days remaining color
  const getDaysColor = () => {
    if (daysRemaining === 0) return '#E74C3C';
    if (daysRemaining <= 1) return '#E67E22';
    if (daysRemaining <= 2) return '#F39C12';
    return '#7F8C8D';
  };

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="trophy" size={24} color="#F39C12" />
          <Text style={styles.headerTitle}>Meta de la Semana</Text>
        </View>
        {onSettings && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettings}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="settings-outline" size={22} color="#7F8C8D" />
          </TouchableOpacity>
        )}
      </View>

      {/* Date range */}
      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color="#7F8C8D" />
        <Text style={styles.dateText}>{dateRange}</Text>
      </View>

      {/* Goal title */}
      <Text style={styles.goalTitle} numberOfLines={2}>
        {goal.title}
      </Text>

      {/* Description (if exists) */}
      {goal.description && goal.description.trim() && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}

      {/* Progress section */}
      <View style={styles.progressSection}>
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {/* Progress percentage */}
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {progressPercentage}%
            </Text>
            <Text style={styles.statLabel}>
              {goal.completedTasks}/{goal.totalTasks} tareas
            </Text>
          </View>

          {/* Points earned */}
          <View style={styles.statItem}>
            <View style={styles.pointsContainer}>
              <Ionicons name="diamond" size={16} color="#9B59B6" />
              <Text style={styles.pointsValue}>
                {goal.pointsEarned} pts
              </Text>
            </View>
            <Text style={styles.statLabel}>acumulados</Text>
          </View>

          {/* Days remaining */}
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getDaysColor() }]}>
              {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}
            </Text>
            <Text style={styles.statLabel}>restantes</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  settingsButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#7F8C8D',
    marginLeft: 6,
    fontWeight: '500',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 0.3s ease',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#95A5A6',
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9B59B6',
    marginLeft: 4,
  },
});
