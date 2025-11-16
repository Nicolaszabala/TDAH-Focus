import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * SoundControls Component
 * Playback controls for ambient sounds
 * RF32: Play sound
 * RF33: Pause sound
 * RF34: Stop sound
 * RF35: Adjust volume
 * RNF07: Minimum 44x44pt touch target
 */
export default function SoundControls({
  isPlaying,
  volume,
  onPlayPause,
  onStop,
  onVolumeChange,
  disabled = false,
}) {
  // Convert volume from 0-1 to percentage
  const volumePercentage = Math.round(volume * 100);

  return (
    <View style={styles.container}>
      {/* Playback Controls */}
      <View style={styles.controlsRow}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          style={[
            styles.playButton,
            disabled && styles.disabledButton,
          ]}
          onPress={onPlayPause}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={36}
            color="#fff"
          />
          <Text style={styles.buttonText}>
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </Text>
        </TouchableOpacity>

        {/* Stop Button */}
        <TouchableOpacity
          style={[
            styles.stopButton,
            disabled && styles.disabledButton,
          ]}
          onPress={onStop}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="stop" size={36} color="#fff" />
          <Text style={styles.buttonText}>Detener</Text>
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <View style={styles.volumeHeader}>
          <Ionicons
            name={volume === 0 ? 'volume-mute' : 'volume-medium'}
            size={24}
            color="#2C3E50"
          />
          <Text style={styles.volumeLabel}>Volumen</Text>
          <Text style={styles.volumeValue}>{volumePercentage}%</Text>
        </View>

        {/* Simple Volume Bar - Alternative to Slider */}
        <View style={styles.volumeBar}>
          <View
            style={[
              styles.volumeFill,
              { width: `${volumePercentage}%` },
            ]}
          />
        </View>

        {/* Volume Presets */}
        <View style={styles.presetsContainer}>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => onVolumeChange(0.25)}
            disabled={disabled}
          >
            <Text style={styles.presetText}>25%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => onVolumeChange(0.5)}
            disabled={disabled}
          >
            <Text style={styles.presetText}>50%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => onVolumeChange(0.75)}
            disabled={disabled}
          >
            <Text style={styles.presetText}>75%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetButton}
            onPress={() => onVolumeChange(1.0)}
            disabled={disabled}
          >
            <Text style={styles.presetText}>100%</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Text */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle" size={20} color="#3498DB" />
        <Text style={styles.infoText}>
          La reproducción continúa en segundo plano mientras usas otras funciones.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  playButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    borderRadius: 12,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80, // RNF07: Minimum 44x44pt touch target
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  volumeContainer: {
    marginBottom: 16,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  volumeLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 12,
    flex: 1,
  },
  volumeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  volumeBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 8,
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#E74C3C',
    borderRadius: 6,
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  presetButton: {
    backgroundColor: '#ECF0F1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
});
