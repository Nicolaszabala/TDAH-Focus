/**
 * SoundPlayer Component
 * Displays and controls therapeutic ambient sounds
 *
 * RF31-RF36: Ambient Sound Playback
 * Features:
 * - Two sound options: Pink Noise, Brown Noise
 * - Play/pause controls
 * - Volume control
 * - Visual feedback for active sound
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { SOUND_INFO, loadSound, playSound, pauseSound, stopSound, setVolume as setAudioVolume } from '../../services/soundService';

// Map sound IDs to match soundService format
const SOUND_TYPES = {
  PINK_NOISE: 'pink',
  BROWN_NOISE: 'brown',
};

export default function SoundPlayer() {
  const [playingSound, setPlayingSound] = useState(null);
  const [volume, setVolume] = useState(0.7);
  const [isPlaying, setIsPlaying] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

  /**
   * Handle sound selection and playback
   */
  const handleSoundPress = async (soundType) => {
    try {
      if (playingSound === soundType && isPlaying) {
        // If clicking the same playing sound, pause it
        await pauseSound();
        setIsPlaying(false);
      } else if (playingSound === soundType && !isPlaying) {
        // If clicking the same paused sound, resume it
        await playSound();
        setIsPlaying(true);
      } else {
        // Load and play new sound
        await loadSound(soundType);
        await playSound();
        setPlayingSound(soundType);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error handling sound press:', error);
    }
  };

  /**
   * Stop all sounds
   */
  const handleStopAll = async () => {
    try {
      await stopSound();
      setPlayingSound(null);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = async (newVolume) => {
    setVolume(newVolume);
    await setAudioVolume(newVolume);
  };

  /**
   * Render a sound card
   */
  const renderSoundCard = (soundType) => {
    const soundInfo = SOUND_INFO[soundType];
    const isActive = playingSound === soundType;
    const isCurrentlyPlaying = isActive && isPlaying;

    return (
      <TouchableOpacity
        key={soundType}
        style={[styles.soundCard, isActive && styles.soundCardActive]}
        onPress={() => handleSoundPress(soundType)}
        activeOpacity={0.7}
      >
        <View style={styles.soundCardHeader}>
          <Ionicons
            name={soundInfo.icon}
            size={32}
            color={isActive ? '#E74C3C' : '#7F8C8D'}
          />
          <View style={styles.playIconContainer}>
            <Ionicons
              name={isCurrentlyPlaying ? 'pause-circle' : 'play-circle'}
              size={28}
              color={isActive ? '#E74C3C' : '#BDC3C7'}
            />
          </View>
        </View>

        <Text style={[styles.soundName, isActive && styles.soundNameActive]}>
          {soundInfo.name}
        </Text>
        <Text style={styles.soundDescription}>{soundInfo.description}</Text>

        {isCurrentlyPlaying && (
          <View style={styles.playingIndicator}>
            <View style={styles.pulseCircle} />
            <Text style={styles.playingText}>Reproduciendo...</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ambientes Sonoros</Text>
        <Text style={styles.subtitle}>
          Basados en evidencia científica para mejorar concentración
        </Text>
      </View>

      {/* Sound Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.soundsContainer}
        contentContainerStyle={styles.soundsContent}
      >
        {renderSoundCard(SOUND_TYPES.PINK_NOISE)}
        {renderSoundCard(SOUND_TYPES.BROWN_NOISE)}
      </ScrollView>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <Ionicons name="volume-low" size={24} color="#7F8C8D" />
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={handleVolumeChange}
          minimumTrackTintColor="#E74C3C"
          maximumTrackTintColor="#BDC3C7"
          thumbTintColor="#E74C3C"
        />
        <Ionicons name="volume-high" size={24} color="#7F8C8D" />
        <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
      </View>

      {/* Stop All Button */}
      {playingSound && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStopAll}
          activeOpacity={0.7}
        >
          <Ionicons name="stop-circle" size={24} color="#fff" />
          <Text style={styles.stopButtonText}>Detener Todo</Text>
        </TouchableOpacity>
      )}

      {/* Information */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3498DB" />
        <Text style={styles.infoText}>
          Los sonidos se reproducen en bucle continuo. Puedes usarlos mientras trabajas con
          otras apps.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  soundsContainer: {
    marginBottom: 20,
  },
  soundsContent: {
    paddingRight: 16,
  },
  soundCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: '#ECF0F1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  soundCardActive: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF5F5',
  },
  soundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playIconContainer: {
    padding: 4,
  },
  soundName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 6,
  },
  soundNameActive: {
    color: '#E74C3C',
  },
  soundDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  pulseCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    marginRight: 8,
  },
  playingText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 12,
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
    minWidth: 45,
    textAlign: 'right',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F4F8',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#2C3E50',
    marginLeft: 8,
    lineHeight: 18,
  },
});
