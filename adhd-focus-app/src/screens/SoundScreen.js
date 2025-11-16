import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import SoundCard from '../components/sound/SoundCard';
import SoundControls from '../components/sound/SoundControls';
import { SOUND_INFO } from '../services/soundService';
import {
  initializeAudioSystem,
  selectSound,
  togglePlayPause,
  stopSoundAction,
  setVolume,
  selectSoundState,
  selectIsPlaying,
  selectSelectedSound,
  selectVolume,
  selectIsLoading,
  selectError,
  selectIsInitialized,
} from '../store/slices/soundSlice';
import useAudioNotifications from '../hooks/useAudioNotifications';

/**
 * Sound Screen
 * Manages therapeutic ambient sounds (pink noise, brown noise, nature)
 * RF31-RF36: Complete ambient sound environment functionality
 * RNF02: Minimum 16pt font size
 * RNF03: WCAG AA contrast (4.5:1)
 */
export default function SoundScreen() {
  const dispatch = useDispatch();

  // Selectors
  const isPlaying = useSelector(selectIsPlaying);
  const selectedSound = useSelector(selectSelectedSound);
  const volume = useSelector(selectVolume);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isInitialized = useSelector(selectIsInitialized);

  // Setup audio notifications
  useAudioNotifications();

  // Initialize audio system on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(initializeAudioSystem());
    }
  }, [dispatch, isInitialized]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error de Audio',
        `Ocurrió un problema: ${error}`,
        [{ text: 'OK' }]
      );
    }
  }, [error]);

  // Handle sound selection
  const handleSelectSound = (soundType) => {
    dispatch(selectSound(soundType));
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    if (selectedSound) {
      dispatch(togglePlayPause());
    } else {
      Alert.alert(
        'Selecciona un Sonido',
        'Primero selecciona un ambiente sonoro para reproducir.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle stop
  const handleStop = () => {
    dispatch(stopSoundAction());
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    dispatch(setVolume(newVolume));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Ionicons name="headset" size={48} color="#E74C3C" />
          <Text style={styles.title}>Ambientes Sonoros</Text>
          <Text style={styles.subtitle}>
            Sonidos terapéuticos basados en evidencia científica para mejorar concentración
          </Text>
        </View>

        {/* Loading Indicator */}
        {isLoading && !selectedSound && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E74C3C" />
            <Text style={styles.loadingText}>Inicializando audio...</Text>
          </View>
        )}

        {/* Sound Cards */}
        <View style={styles.soundsSection}>
          <Text style={styles.sectionTitle}>Selecciona un Ambiente</Text>

          <SoundCard
            soundInfo={SOUND_INFO.pink}
            isSelected={selectedSound === 'pink'}
            isPlaying={isPlaying && selectedSound === 'pink'}
            onSelect={() => handleSelectSound('pink')}
            disabled={isLoading}
          />

          <SoundCard
            soundInfo={SOUND_INFO.brown}
            isSelected={selectedSound === 'brown'}
            isPlaying={isPlaying && selectedSound === 'brown'}
            onSelect={() => handleSelectSound('brown')}
            disabled={isLoading}
          />

        </View>

        {/* Playback Controls */}
        {selectedSound && (
          <View style={styles.controlsSection}>
            <Text style={styles.sectionTitle}>Controles de Reproducción</Text>
            <SoundControls
              isPlaying={isPlaying}
              volume={volume}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
              onVolumeChange={handleVolumeChange}
              disabled={isLoading}
            />
          </View>
        )}

        {/* Scientific Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Beneficios Científicos</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="flask" size={24} color="#3498DB" />
              <Text style={styles.infoCardTitle}>
                Ruido Rosa y TDAH
              </Text>
            </View>
            <Text style={styles.infoText}>
              Según meta-análisis de Nigg et al. (2024), el ruido rosa produce
              beneficios significativos en tareas de atención (g=0.249, p&lt;.0001)
              en personas con TDAH.
            </Text>
            <Text style={styles.infoText}>
              El ruido marrón (frecuencias graves) ayuda a enmascarar distractores
              ambientales sin generar sobre-estimulación.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#27AE60" />
              <Text style={styles.infoCardTitle}>
                Recomendaciones de Uso
              </Text>
            </View>
            <Text style={styles.infoText}>
              • Usa auriculares o audífonos para mejor efecto{'\n'}
              • Ajusta el volumen a un nivel cómodo (30-50% recomendado){'\n'}
              • Combina con sesiones Pomodoro para máxima concentración{'\n'}
              • Prueba diferentes sonidos según la tarea{'\n'}
              • La reproducción continúa en segundo plano
            </Text>
          </View>
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </View>
    </ScrollView>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16, // RNF02: Minimum 16pt
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
  },
  soundsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  controlsSection: {
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  infoText: {
    fontSize: 16, // RNF02
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 8,
  },
  footer: {
    height: 32,
  },
});
