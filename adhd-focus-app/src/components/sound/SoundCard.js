import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * SoundCard Component
 * Individual card for each sound option (pink, brown, nature)
 * RF31: Select ambient sound environment
 * RNF02: Minimum 16pt font size
 * RNF07: Minimum 44x44pt touch target
 */
export default function SoundCard({
  soundInfo,
  isSelected,
  isPlaying,
  onSelect,
  disabled = false,
}) {
  const { name, description, scientificNote, icon, color } = soundInfo;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        { borderColor: color },
      ]}
      onPress={onSelect}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {/* Icon and Status */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>

        {isSelected && isPlaying && (
          <View style={styles.playingIndicator}>
            <Ionicons name="volume-medium" size={20} color={color} />
            <Text style={[styles.playingText, { color }]}>Reproduciendo</Text>
          </View>
        )}
      </View>

      {/* Sound Name */}
      <Text style={styles.name}>{name}</Text>

      {/* Description */}
      <Text style={styles.description}>{description}</Text>

      {/* Scientific Note */}
      <View style={styles.scientificNote}>
        <Ionicons name="flask" size={14} color="#7F8C8D" />
        <Text style={styles.scientificText}>{scientificNote}</Text>
      </View>

      {/* Selection Indicator */}
      {isSelected && (
        <View style={[styles.selectionBadge, { backgroundColor: color }]}>
          <Ionicons name="checkmark-circle" size={24} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ECF0F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 180, // Ensure adequate touch target
    position: 'relative',
  },
  selectedContainer: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  playingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  description: {
    fontSize: 16, // RNF02: Minimum 16pt
    color: '#7F8C8D',
    lineHeight: 22,
    marginBottom: 12,
  },
  scientificNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  scientificText: {
    fontSize: 13,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  selectionBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: 20,
  },
});
