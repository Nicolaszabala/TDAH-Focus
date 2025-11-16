# TDAH Focus App - Aplicación de Gestión para Adultos con TDAH

## 📱 Descripción

Prototipo funcional de aplicación móvil que ayuda a adultos con TDAH a gestionar las barreras que poseen para mantener productividad y organización en su vida cotidiana, mediante estrategias de intervención no farmacológica basadas en evidencia científica.

## ✨ Componentes Principales

1. **Gestión Diferenciada de Tareas**: Sistema de organización con clasificación obligatorias/opcionales
2. **Temporizador Pomodoro Adaptado**: Intervalos de 25 minutos con pausas configurables
3. **Modo Concentración**: Interfaz minimalista para eliminar distracciones
4. **Ambientes Sonoros Terapéuticos**: Ruido rosa y marrón para mejorar concentración
5. **Asistente Conversacional**: Orientación especializada para TDAH

## 🚀 Estado del Desarrollo

### ✅ Fase 1 Completada: Setup y Configuración
- [x] Proyecto Expo inicializado
- [x] Dependencias instaladas
- [x] Estructura de carpetas creada
- [x] Redux store configurado
- [x] Navegación básica implementada
- [x] Pantallas placeholder creadas

### 🔨 Próximos Pasos
- **Fase 2**: Módulo de Gestión de Tareas
- **Fase 3**: Módulo de Temporizador Pomodoro
- **Fase 4**: Módulo de Modo Concentración

## 📋 Requisitos Previos

- Node.js 16+ ([https://nodejs.org/](https://nodejs.org/))
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio con emulador Android 8.0+ (API 26+) **O** dispositivo físico con Expo Go

## 🛠️ Instalación

### 1. Clonar repositorio
```bash
git clone [URL-del-repositorio]
cd adhd-focus-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar servidor de desarrollo
```bash
npx expo start
```

### 4. Ejecutar en emulador/dispositivo
- Presionar **'a'** para Android emulator
- O escanear QR con **Expo Go** en dispositivo físico

## 📁 Estructura del Proyecto

```
adhd-focus-app/
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── common/        # Botones, inputs, etc.
│   │   ├── tasks/         # Componentes de tareas
│   │   ├── pomodoro/      # Componentes de temporizador
│   │   └── focus/         # Modo concentración
│   ├── screens/           # Pantallas principales
│   │   ├── HomeScreen.js
│   │   ├── TasksScreen.js
│   │   ├── PomodoroScreen.js
│   │   ├── FocusScreen.js
│   │   └── SettingsScreen.js
│   ├── navigation/        # Configuración de navegación
│   │   └── AppNavigator.js
│   ├── store/             # Redux store y slices
│   │   ├── slices/
│   │   │   ├── tasksSlice.js
│   │   │   ├── pomodoroSlice.js
│   │   │   ├── focusSlice.js
│   │   │   └── settingsSlice.js
│   │   └── store.js
│   ├── services/          # Lógica de negocio
│   │   └── storageService.js
│   ├── utils/             # Utilidades y constantes
│   │   └── constants.js
│   └── assets/
│       └── sounds/        # Archivos de audio (ruido rosa/marrón)
├── App.js                 # Punto de entrada
├── package.json
└── README.md
```

## 📦 Dependencias Principales

- **react-native**: Framework principal
- **expo**: Plataforma de desarrollo
- **@react-navigation/native**: Navegación
- **@react-navigation/stack**: Stack navigation
- **@react-navigation/bottom-tabs**: Tab navigation
- **@reduxjs/toolkit**: Manejo de estado
- **react-redux**: Bindings de Redux para React
- **@react-native-async-storage/async-storage**: Almacenamiento local
- **expo-av**: Reproducción de audio
- **expo-notifications**: Notificaciones push
- **react-native-vector-icons**: Iconos

## 🎯 Requerimientos Implementados

### Fase 1 (Setup)
- **RNF15**: Funcionamiento 100% offline
- **RNF23**: Almacenamiento local exclusivo (AsyncStorage)
- **RNF19**: Validación de integridad de datos

### Pantalla Home
- **RNF01**: Máximo 3 acciones principales visibles
- **RNF02**: Fuente mínima 16pt
- **RNF07**: Área táctil mínima 44x44pt
- **RNF03**: Contraste WCAG AA (4.5:1)

## 🧪 Testing

```bash
# Ejecutar en modo desarrollo
npx expo start

# Limpiar cache
npx expo start -c
```

## 🔧 Troubleshooting

### Error: Unable to resolve module
**Solución:**
```bash
npm install
npx expo start -c  # Clear cache
```

### Notificaciones no funcionan en emulador
**Solución:** Las notificaciones funcionan mejor en dispositivo físico. En emulador, verificar permisos en configuración de Android.

## 📝 Notas de Desarrollo

- El proyecto utiliza **Expo managed workflow**
- Compatible con **Android 8.0+** (API level 26+)
- Preparado para expansión futura a iOS con 86% de reutilización de código
- **100% offline** - no requiere conexión a internet

## 👨‍💻 Autor

**Nicolás Alejandro Zabala**
- Universidad Siglo 21
- Licenciatura en Informática
- Trabajo Final de Grado - Noviembre 2025

## 📄 Licencia

Este proyecto es parte de un Trabajo Final de Grado académico.

---

**Última actualización**: 14 de noviembre de 2025
**Estado**: Fase 1 completada - Setup y Configuración
