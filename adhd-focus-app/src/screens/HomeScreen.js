import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { selectTaskCounts } from '../store/slices/tasksSlice';
import { selectHistory } from '../store/slices/pomodoroSlice';
import { selectTutorialCompleted } from '../store/slices/settingsSlice';
import Tutorial from '../components/common/Tutorial';
import { getTipOfTheDay } from '../utils/dailyTips';

/**
 * Home Screen
 * Dashboard with quick stats and navigation
 * RNF02: Minimum 16pt font size
 * RNF07: Minimum 44x44pt touch targets
 */
export default function HomeScreen({ navigation }) {
  const taskCounts = useSelector(selectTaskCounts);
  const pomodoroHistory = useSelector(selectHistory);
  const tutorialCompleted = useSelector(selectTutorialCompleted);

  const [showTutorial, setShowTutorial] = useState(false);
  const [dailyTip, setDailyTip] = useState(getTipOfTheDay());

  // Show tutorial on first launch
  useEffect(() => {
    console.log('[HomeScreen] tutorialCompleted:', tutorialCompleted);
    if (!tutorialCompleted) {
      console.log('[HomeScreen] Showing tutorial...');
      // Small delay to ensure smooth render
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tutorialCompleted]);

  const todaysSessions = pomodoroHistory.filter(session => {
    const sessionDate = new Date(session.endTime).toDateString();
    const today = new Date().toDateString();
    return sessionDate === today;
  }).length;

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Bienvenido</Text>
            <Text style={styles.welcomeSubtitle}>
              Organiza tu día y mantén el foco
            </Text>
          </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Tasks Card */}
          <View style={[styles.card, styles.taskCard]}>
            <Ionicons name="list" size={32} color="#E74C3C" />
            <Text style={styles.cardNumber}>{taskCounts.pending}</Text>
            <Text style={styles.cardLabel}>Tareas Pendientes</Text>
            <View style={styles.taskBreakdown}>
              <Text style={styles.taskBreakdownText}>
                {taskCounts.obligatory} obligatorias • {taskCounts.optional} opcionales
              </Text>
            </View>
          </View>

          {/* Pomodoro Card */}
          <View style={[styles.card, styles.pomodoroCard]}>
            <Ionicons name="timer" size={32} color="#E74C3C" />
            <Text style={styles.cardNumber}>{todaysSessions}</Text>
            <Text style={styles.cardLabel}>Sesiones Hoy</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Tareas')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Nueva Tarea</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Pomodoro')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="play-circle" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Iniciar Pomodoro</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.focusButton]}
            onPress={() => navigation.navigate('Focus')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="eye-off" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Modo Concentración</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.soundButton]}
            onPress={() => navigation.navigate('Sonidos')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="headset" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Ambientes Sonoros</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.assistantButton]}
            onPress={() => navigation.navigate('Asistente')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="chatbubbles" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Asistente TDAH</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Consejo del día</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              {dailyTip.text}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>

      {/* Tutorial */}
      <Tutorial
        visible={showTutorial}
        onComplete={handleTutorialComplete}
        navigation={navigation}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16, // RNF02: Minimum 16pt
    color: '#7F8C8D',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCard: {
    marginRight: 8,
  },
  pomodoroCard: {
    marginLeft: 8,
  },
  cardNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  taskBreakdown: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  taskBreakdownText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 60, // RNF07: Minimum 44x44pt touch target
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#3498DB',
  },
  focusButton: {
    backgroundColor: '#9B59B6',
  },
  soundButton: {
    backgroundColor: '#E67E22',
  },
  assistantButton: {
    backgroundColor: '#16A085',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
  },
  tipText: {
    fontSize: 16, // RNF02
    color: '#2C3E50',
    lineHeight: 24,
  },
});
