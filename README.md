# TDAH Focus - Aplicación Móvil para Adultos con TDAH

## 📋 Información del Proyecto

**Universidad**: Universidad Siglo 21
**Carrera**: Licenciatura en Informática
**Tipo de Trabajo**: Trabajo Final de Grado - Prototipado Tecnológico
**Alumno**: Nicolás Alejandro Zabala
**Tutora**: Ana Carolina Ferreyra
**Fecha**: Noviembre 2025

---

## 🎯 Objetivo del Proyecto

Desarrollar un **prototipo funcional de aplicación móvil** que ayude a adultos con TDAH a gestionar las barreras que enfrentan para mantener productividad y organización en su vida cotidiana, mediante estrategias de intervención no farmacológica basadas en evidencia científica.

---

## 🚀 Componentes del Sistema

Este repositorio contiene dos componentes principales:

### 1. **adhd-focus-app/** - Aplicación Móvil (React Native + Expo)

Aplicación móvil multiplataforma que integra 5 módulos funcionales:

- **Gestión de tareas**: Sistema de clasificación obligatorias/opcionales con contraste cromático
- **Técnica Pomodoro**: Temporizador de 25 minutos con pausas configurables (5 o 10 min)
- **Modo concentración**: Interfaz minimalista que reduce distracciones digitales
- **Ambientes Sonoros**: Reproducción de ruido rosa y marrón (evidencia científica)
- **Asistente Conversacional**: Reconocimiento de patrones TDAH y orientación personalizada

### 2. **adhd-chatbot-backend/** - Backend del Asistente (Node.js + Express)

Servidor backend que proporciona:

- API REST para el asistente conversacional
- Integración con LLM para respuestas contextuales
- Base de conocimiento especializada en TDAH adulto
- Sistema de caché para optimizar rendimiento
- Rate limiting y validación de requests

---

## 🛠️ Stack Tecnológico

### Frontend (Aplicación Móvil)
- **Framework**: React Native 0.81.5 con Expo 54
- **Estado Global**: Redux Toolkit 2.10
- **Persistencia**: AsyncStorage (100% offline)
- **Navegación**: React Navigation 7
- **Audio**: Expo AV
- **Notificaciones**: Notifee (Android)

### Backend (Servidor)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **LLM**: Hugging Face Inference API (Llama 3.2 1B Instruct)
- **Caché**: Node-cache
- **Validación**: Express-validator

### Plataformas Soportadas
- **Android**: 8.0+ (API level 26+)

---

## 📦 Estructura del Repositorio

```
TDAH-Focus-Entrega/
├── adhd-focus-app/              # Aplicación móvil React Native
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── screens/             # Pantallas principales
│   │   ├── services/            # Lógica de negocio
│   │   ├── store/               # Redux (slices, store)
│   │   ├── hooks/               # Custom hooks
│   │   ├── navigation/          # Configuración de navegación
│   │   └── utils/               # Utilidades y constantes
│   ├── assets/                  # Recursos (sonidos, imágenes)
│   ├── android/                 # Configuración nativa Android
│   ├── app.json                 # Configuración Expo
│   ├── package.json             # Dependencias frontend
│   └── README.md                # Documentación de la app
│
├── adhd-chatbot-backend/        # Backend Node.js
│   ├── routes/                  # Endpoints API
│   ├── services/                # Lógica LLM y prompts
│   ├── knowledge/               # Base de conocimiento TDAH
│   ├── middleware/              # Rate limiting, validación
│   ├── utils/                   # Utilidades (caché, sanitización)
│   ├── server.js                # Punto de entrada
│   ├── package.json             # Dependencias backend
│   └── README.md                # Documentación del backend
│
├── .gitignore                   # Exclusiones de Git
└── README.md                    # Este archivo
```

---

## 🔧 Instalación y Ejecución

### Pre-requisitos

- **Node.js**: 18.x o superior
- **npm** o **yarn**: Gestor de paquetes
- **Android Studio**: Para emulador/dispositivo Android
- **Expo CLI**: `npm install -g expo-cli`

### 1. Clonar el Repositorio

```bash
git clone https://github.com/[tu-usuario]/TDAH-Focus.git
cd TDAH-Focus
```

### 2. Configurar el Backend

```bash
cd adhd-chatbot-backend

# Instalar dependencias
npm install

# Crear archivo .env desde el template
cp .env.example .env

# IMPORTANTE: Editar .env y configurar el token de Hugging Face
# Ver instrucciones abajo para obtener un token gratuito

# Iniciar servidor
npm start
# Servidor corriendo en http://localhost:3000
```

**🔑 Configuración del Token de Hugging Face:**

Para que el asistente conversacional funcione, necesitas un token gratuito de Hugging Face:

1. Ir a https://huggingface.co/join y crear una cuenta gratuita
2. Una vez registrado, ir a https://huggingface.co/settings/tokens
3. Click en "New token"
4. Configurar:
   - Name: `adhd-chatbot-demo`
   - Type: `Read`
5. Click "Generate token" y copiar el token (comienza con `hf_`)
6. Abrir el archivo `.env` que creaste antes
7. Reemplazar `TU_TOKEN_AQUI` con tu token
8. Guardar el archivo

El proceso toma menos de 2 minutos y el tier gratuito de Hugging Face es suficiente para evaluar el proyecto.

### 3. Configurar la Aplicación Móvil

```bash
cd ../adhd-focus-app

# Instalar dependencias
npm install

# Iniciar con Expo
npx expo start

# Para Android:
# Presiona 'a' para abrir en emulador Android
# O escanea el QR con la app Expo Go en tu dispositivo
```

### 4. Build de Producción (Opcional)

```bash
# Build para Android
cd adhd-focus-app
npx expo run:android

# O con EAS Build
eas build --profile production --platform android
```

---

## 📱 Uso de la Aplicación

### Primera Ejecución

1. Al abrir la app por primera vez, verás un **tutorial interactivo** que explica cada funcionalidad
2. Puedes saltarlo con "Saltar tutorial" o completarlo paso a paso

### Funcionalidades Principales

#### Crear Tareas
1. Ve a la pantalla "Tareas" (ícono de lista en barra inferior)
2. Toca el botón rojo "+" en la esquina inferior derecha
3. Ingresa título, clasifica como OBLIGATORIA u OPCIONAL
4. Opcionalmente agrega notas
5. Guarda

#### Usar Pomodoro
1. Ve a "Pomodoro" (ícono de reloj)
2. Selecciona una tarea de tu lista
3. Configura duración del descanso (5 o 10 min)
4. Toca "Iniciar"
5. Trabaja 25 minutos, luego descansa automáticamente

#### Activar Modo Concentración
1. Ve a "Modo Concentración" desde Inicio o navegación
2. Selecciona la tarea en la que te enfocarás
3. La app minimiza distracciones hasta que salgas

#### Reproducir Ambientes Sonoros
1. Ve a "Ambientes Sonoros"
2. Selecciona Ruido Rosa o Ruido Marrón
3. Ajusta volumen y reproduce
4. Continúa sonando en segundo plano

#### Consultar al Asistente
1. Ve a "Asistente" (ícono de chat)
2. Escribe tu consulta o preocupación
3. Recibe orientación personalizada basada en tu estado actual

---

## 📊 Fundamentación Científica

### Epidemiología
- Prevalencia global TDAH adultos: **2.5-6.7%** (Cortese et al., 2018)
- Argentina: **~4%** de población adulta (Fundación INECO, 2020)
- Tendencia ascendente **+15.2%** desde 2020 (Paul et al., 2025)

### Componentes Basados en Evidencia

#### Técnica Pomodoro
- Estructura externa para déficit de dopamina característico del TDAH
- Reduce sensación de abrumamiento mediante división de tareas
- Refuerzos a corto plazo esenciales para motivación (Kreider et al., 2019)

#### Ruido Rosa/Marrón
- Meta-análisis Nigg et al. (2024): beneficio significativo en tareas de atención (g=0.249, p<.0001)
- Enmascaramiento de distractores ambientales
- Intervención de bajo costo y bajo riesgo

#### Asistente Conversacional
- Validación técnica 93% de éxito en interacciones personalizadas
- Mejoras: lapso de atención +28%, reducción hiperactividad -22%
- Berrezueta-Guzman et al. (2025)

---

## 🔒 Seguridad y Privacidad

### Principios Fundamentales

- **Almacenamiento local exclusivo**: Todos los datos en AsyncStorage (dispositivo del usuario)
- **No PII**: No se solicita nombre, email, teléfono, ubicación
- **Cifrado local**: Datos sensibles cifrados con react-native-encrypted-storage
- **Sin autenticación**: No requiere cuenta de usuario
- **Logs mínimos**: Solo metadata temporal (NO contenido textual de tareas)

### Cumplimiento

- **OWASP Mobile Top 10**: Mitigación de vulnerabilidades principales
- **WCAG 2.1 AA**: Contraste mínimo 4.5:1, touch targets 44x44pt
- **Android Security**: Permisos mínimos necesarios, validación de inputs

---

## 📈 Requerimientos Funcionales (Resumen)

El sistema implementa **41 Requerimientos Funcionales** distribuidos en:

- **RF01-RF10**: Gestión de Tareas (crear, editar, eliminar, clasificar, notas)
- **RF11-RF22**: Temporizador Pomodoro (configurar, iniciar, pausar, historial)
- **RF23-RF26**: Notas por Tarea
- **RF27-RF30**: Modo Concentración (activar, bloquear, mensajes motivacionales)
- **RF31-RF36**: Ambientes Sonoros (reproducir, pausar, volumen, bucle)
- **RF37-RF41**: Asistente Conversacional (reconocer patrones, responder, contextualizar)

### Requerimientos No Funcionales Críticos

- **RNF01**: Máximo 3 acciones principales visibles simultáneamente
- **RNF03**: Contraste WCAG 2.1 nivel AA (4.5:1)
- **RNF09**: Carga inicial <3 segundos (Android 2GB+ RAM)
- **RNF15**: 100% disponibilidad offline
- **RNF16**: Preservar estado temporizador tras interrupciones (±2 seg precisión)

---

## 🎥 Demo y Documentación Adicional

### Video Demo
*(Incluir enlace al video demo de 2-5 minutos cuando esté disponible)*

### Documentación Técnica Completa
- Ver `adhd-focus-app/README.md` para documentación detallada de la app móvil
- Ver `adhd-chatbot-backend/README.md` para documentación del backend y API

### Diagramas UML
Los diagramas UML (casos de uso, clases, secuencia, estados) se encuentran en el documento final del TFG entregado a través de Canvas.

---

## 🐛 Troubleshooting

### La app no inicia
- Verificar que Node.js ≥18 esté instalado: `node --version`
- Limpiar caché: `cd adhd-focus-app && npx expo start -c`
- Reinstalar dependencias: `rm -rf node_modules && npm install`

### El backend no conecta
- Verificar que el servidor esté corriendo en `http://localhost:3000`
- La API key de Hugging Face ya está incluida en el código
- Revisar logs del servidor para errores

### El asistente no responde
- Verificar conexión a internet (requerida solo para el asistente)
- Verificar que el backend esté corriendo
- Si falla LLM, usa respuestas fallback basadas en regex

### Notificaciones no aparecen (Android)
- Verificar permisos: Settings > Apps > TDAH Focus > Notifications
- Android 13+ requiere permiso explícito en primer uso

---

## 📚 Referencias Principales

Berrezueta-Guzman, S., Kandil, M., Martín-Ruiz, M.-L., Pau de la Cruz, I., & Krusche, S. (2024). Future of ADHD care: Evaluating the efficacy of ChatGPT in therapy enhancement. *Healthcare*, *12*(6), 683. https://doi.org/10.3390/healthcare12060683

Berrezueta-Guzman, S., Kandil, M., & Wagner, S. (2025). Integrating AI into ADHD therapy: Insights from ChatGPT-4o and robotic assistants. *Human-Centric Intelligent Systems*, 1-25. https://doi.org/10.1007/s44230-025-00099-1

Cortese, S., Adamo, N., Del Giovane, C., Mohr-Jensen, C., Hayes, A. J., Carucci, S., Atkinson, L. Z., Cipriani, A., & 20 coautores adicionales. (2018). Comparative efficacy and tolerability of medications for attention-deficit hyperactivity disorder in children, adolescents, and adults: A systematic review and network meta-analysis. *The Lancet Psychiatry*, *5*(9), 727-738. https://doi.org/10.1016/S2215-0366(18)30269-4

Fundación INECO. (2020). *Más del 4% de la población mundial tiene TDAH*. https://www.fundacionineco.org/mas-del-4-de-la-poblacion-mundial-tiene-tdah/

Hosseinnia, M., Pirzadeh, A., Nazari, A., & Heidari, Z. (2025). Applications for the management of Attention Deficit Hyperactivity Disorder: A systematic review. *Frontiers in Public Health*, *13*, 1483923. https://doi.org/10.3389/fpubh.2025.1483923

Kreider, C. M., Medina, S., & Lan, M.-F. (2019). Strategies for coping with time-related and productivity challenges of young people with learning disabilities and attention-deficit/hyperactivity disorder. *Child: Care, Health and Development*, *45*(2), 291-300. https://doi.org/10.1111/cch.12653

Nigg, J. T., Karalunas, S. L., Willoughby, M. T., Wagner, N., Elmore, A. L., Kaul, S., Denton, C., & Steeger, C. M. (2024). Systematic review and meta-analysis: Do white noise or pink noise help with task performance in youth with attention-deficit/hyperactivity disorder or with elevated attention problems? *Journal of the American Academy of Child & Adolescent Psychiatry*, *63*(8), 785-796. https://doi.org/10.1016/j.jaac.2024.01.013

Paul, M. L., Van Gestel, H., Domecq, S., Mayes, T., Emslie, G., Childress, A., Weisenmuller, C., Brown, G., Walton, A., Gleason, O. C., & O'Shea, J. (2024). Incidence of attention-deficit/hyperactivity disorder between 2016 and 2023: A retrospective cohort. *Psychiatric Research and Clinical Practice*, *6*(3-4), 96-105. https://doi.org/10.1176/appi.prcp.20240121

---

## 📞 Contacto

**Alumno**: Nicolás Alejandro Zabala
**Universidad**: Siglo 21
**Programa**: Licenciatura en Informática

---

## 📄 Licencia

Este proyecto es un Trabajo Final de Grado académico desarrollado para Universidad Siglo 21.
**Uso**: Exclusivamente educativo y de demostración.

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0
