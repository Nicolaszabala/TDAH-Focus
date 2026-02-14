import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeeklyMotivationalPhrase } from '../../services/goalService';

/**
 * EmptyGoalState Component
 * Displays when no weekly goal is active
 * Shows motivational phrase that rotates weekly
 */
export default function EmptyGoalState({ onCreateGoal }) {
  const motivationalPhrase = getWeeklyMotivationalPhrase();

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="trophy-outline" size={80} color="#F39C12" />
      </View>

      {/* Title */}
      <Text style={styles.title}>
        No hay meta semanal activa
      </Text>

      {/* Motivational phrase (rotates weekly) */}
      <View style={styles.phraseContainer}>
        <Ionicons name="bulb" size={20} color="#3498DB" />
        <Text style={styles.phrase}>
          "{motivationalPhrase}"
        </Text>
      </View>

      {/* Create goal button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={onCreateGoal}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.createButtonText}>
          Crear Meta Semanal
        </Text>
      </TouchableOpacity>

      {/* Info text */}
      <Text style={styles.infoText}>
        Define tus objetivos de la semana y{'\n'}
        gana puntos al completarlos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  phraseContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    maxWidth: '100%',
  },
  phrase: {
    flex: 1,
    fontSize: 15,
    color: '#2C3E50',
    fontStyle: 'italic',
    lineHeight: 22,
    marginLeft: 12,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 240,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
});
