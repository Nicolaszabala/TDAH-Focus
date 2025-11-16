import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSettings,
  setBreakDuration,
  setNotificationsEnabled,
} from '../store/slices/settingsSlice';
import { TIMER_DURATIONS } from '../utils/constants';
import SoundPlayer from '../components/common/SoundPlayer';

/**
 * Settings Screen
 * Configure app preferences (RF11 - break duration)
 * RF31-RF36: Ambient sounds configuration
 */
export default function SettingsScreen() {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);

  const isShortBreak = settings.breakDuration === TIMER_DURATIONS.SHORT_BREAK;

  const toggleBreakDuration = () => {
    const newDuration = isShortBreak
      ? TIMER_DURATIONS.LONG_BREAK
      : TIMER_DURATIONS.SHORT_BREAK;
    dispatch(setBreakDuration(newDuration));
  };

  const toggleNotifications = () => {
    dispatch(setNotificationsEnabled(!settings.notificationsEnabled));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Temporizador Pomodoro</Text>

        {/* RF11: Break duration configuration */}
        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Duración de Pausas</Text>
            <Text style={styles.settingDescription}>
              {isShortBreak ? '5 minutos' : '10 minutos'}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.durationButton,
              isShortBreak && styles.durationButtonActive,
            ]}
            onPress={toggleBreakDuration}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationButtonText,
                isShortBreak && styles.durationButtonTextActive,
              ]}
            >
              5 min
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.durationButton,
              !isShortBreak && styles.durationButtonActive,
            ]}
            onPress={toggleBreakDuration}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.durationButtonText,
                !isShortBreak && styles.durationButtonTextActive,
              ]}
            >
              10 min
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.settingCard}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Activar Notificaciones</Text>
            <Text style={styles.settingDescription}>
              Recibe alertas al finalizar sesiones
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#BDC3C7', true: '#E74C3C' }}
            thumbColor={settings.notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.sectionTitle}>Ambientes Sonoros Terapéuticos</Text>

        {/* RF31-RF36: Ambient Sounds */}
        <View style={styles.soundPlayerContainer}>
          <SoundPlayer />
        </View>

        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>TDAH Focus App</Text>
          </Text>
          <Text style={styles.infoText}>Versión 1.0.0</Text>
          <Text style={styles.infoText}>
            Aplicación diseñada para adultos con TDAH
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Desarrollado por Nicolás Alejandro Zabala
          </Text>
          <Text style={styles.footerText}>Universidad Siglo 21 - 2025</Text>
        </View>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  soundPlayerContainer: {
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
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDC3C7',
    marginLeft: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: '#E74C3C',
    borderColor: '#E74C3C',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  durationButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoCard: {
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
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  footer: {
    marginTop: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
});
