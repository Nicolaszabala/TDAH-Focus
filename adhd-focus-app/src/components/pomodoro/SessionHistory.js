import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectHistory, selectSessionsByTask } from '../../store/slices/pomodoroSlice';

/**
 * SessionHistory Component
 * Displays history of completed Pomodoro sessions
 * Implements RF21 (history by date) and RF22 (sessions per task)
 */
export default function SessionHistory() {
  const history = useSelector(selectHistory);
  const sessionsByTask = useSelector(selectSessionsByTask);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (history.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          No hay sesiones completadas aún.{'\n'}
          ¡Comienza tu primera sesión Pomodoro!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{history.length}</Text>
          <Text style={styles.statLabel}>Sesiones Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sessionsByTask.length}</Text>
          <Text style={styles.statLabel}>Tareas Trabajadas</Text>
        </View>
      </View>

      {/* Sessions per Task */}
      {sessionsByTask.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Tarea</Text>
          {sessionsByTask.map((taskStat) => (
            <View key={taskStat.taskId} style={styles.taskStatCard}>
              <View style={styles.taskStatHeader}>
                <Text style={styles.taskStatTitle} numberOfLines={1}>
                  {taskStat.taskTitle}
                </Text>
                <Text style={styles.taskStatCount}>
                  {taskStat.count} sesion{taskStat.count !== 1 ? 'es' : ''}
                </Text>
              </View>
              <Text style={styles.taskStatDuration}>
                Total: {formatDuration(taskStat.totalDuration)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial Reciente</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTask} numberOfLines={1}>
                  {item.taskTitle}
                </Text>
                <Text style={styles.sessionDuration}>
                  {formatDuration(item.duration)}
                </Text>
              </View>
              <View style={styles.sessionFooter}>
                <Text style={styles.sessionDate}>
                  {formatDate(item.endTime)}
                </Text>
                <Text style={styles.sessionTime}>
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </Text>
              </View>
            </View>
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.sessionList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498DB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  taskStatCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskStatTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  taskStatCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  taskStatDuration: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  sessionList: {
    gap: 8,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTask: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  sessionDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sessionDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  sessionTime: {
    fontSize: 12,
    color: '#95A5A6',
  },
});
