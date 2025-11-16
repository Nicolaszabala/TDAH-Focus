import React, { useMemo, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import PomodoroScreen from '../screens/PomodoroScreen';
import SoundScreen from '../screens/SoundScreen';
import FocusScreen from '../screens/FocusScreen';
import ChatScreen from '../screens/ChatScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * Tab Navigator
 * Main navigation for the app
 * RNF01: Maximum 3 main actions visible (we have 5 tabs, but they're navigation, not actions)
 */
function MainTabs() {
  // Get safe area insets to avoid overlap with Android system buttons
  const insets = useSafeAreaInsets();

  // Force update when dimensions change (handles navigation bar show/hide)
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Memoize screen options to ensure they update when insets change
  const screenOptions = useMemo(() => {
    // Calculate safe bottom padding (minimum 10px for Android, adds insets if present)
    // Using a larger minimum to ensure compatibility across all Android devices
    const bottomPadding = Platform.OS === 'android'
      ? Math.max(insets.bottom + 10, 18)
      : Math.max(insets.bottom, 8);
    const totalHeight = 60 + bottomPadding;

    return ({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case 'Inicio':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Tareas':
            iconName = focused ? 'list' : 'list-outline';
            break;
          case 'Pomodoro':
            iconName = focused ? 'timer' : 'timer-outline';
            break;
          case 'Sonidos':
            iconName = focused ? 'headset' : 'headset-outline';
            break;
          case 'Asistente':
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            break;
          case 'Ajustes':
            iconName = focused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'help-circle-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#E74C3C',
      tabBarInactiveTintColor: 'gray',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
      tabBarStyle: {
        paddingBottom: bottomPadding,
        paddingTop: 8,
        height: totalHeight,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        elevation: 8,
      },
      headerStyle: {
        backgroundColor: '#E74C3C',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 18,
      },
    });
  }, [insets.bottom, dimensions.height]); // Recompute when bottom inset or dimensions change

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          headerTitle: 'TDAH Focus',
        }}
      />
      <Tab.Screen
        name="Tareas"
        component={TasksScreen}
        options={{
          headerTitle: 'Mis Tareas',
        }}
      />
      <Tab.Screen
        name="Pomodoro"
        component={PomodoroScreen}
        options={{
          headerTitle: 'Temporizador',
        }}
      />
      <Tab.Screen
        name="Sonidos"
        component={SoundScreen}
        options={{
          headerTitle: 'Ambientes Sonoros',
        }}
      />
      <Tab.Screen
        name="Asistente"
        component={ChatScreen}
        options={{
          headerTitle: 'Asistente TDAH',
        }}
      />
      <Tab.Screen
        name="Ajustes"
        component={SettingsScreen}
        options={{
          headerTitle: 'Configuración',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Stack Navigator
 * Includes Focus mode as a modal/overlay
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { flex: 1 },
        }}
      >
        <Stack.Screen name="MainApp" component={MainTabs} />
        <Stack.Screen
          name="Focus"
          component={FocusScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: false, // Prevent accidental dismiss
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
