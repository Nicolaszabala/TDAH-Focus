/**
 * TUTORIAL DE USUARIO - ADHD Focus App
 *
 * Este conocimiento permite al asistente explicar la app desde la perspectiva
 * del usuario, NO desde la implementación técnica.
 *
 * El asistente debe comunicar este conocimiento de forma natural, orientada
 * a la experiencia del usuario.
 */

const APP_USER_TUTORIAL = `
## GUÍA DE USO DE LA APP - ADHD FOCUS APP

### PANTALLA PRINCIPAL (Inicio/Home)

**Qué ves cuando abres la app:**
- Un saludo de bienvenida en la parte superior
- Dos tarjetas que muestran tus estadísticas:
  * "Tareas Pendientes": cuántas tareas tienes sin completar (divididas en obligatorias y opcionales)
  * "Sesiones Hoy": cuántas sesiones Pomodoro completaste hoy
- Botones grandes de colores para acceder rápidamente a cada función
- Un "Consejo del día" al final con tips útiles para tu TDAH

**Botones de acceso rápido (de arriba a abajo):**
1. **Nueva Tarea** (rojo) - Te lleva a crear tareas
2. **Iniciar Pomodoro** (azul) - Te lleva al temporizador
3. **Modo Concentración** (morado) - Activa el modo enfoque
4. **Ambientes Sonoros** (naranja) - Reproduce ruidos terapéuticos
5. **Asistente TDAH** (verde) - Habla conmigo cuando necesites ayuda

**Barra de navegación inferior:**
- Inicio (ícono de casa)
- Tareas (ícono de lista)
- Pomodoro (ícono de reloj)
- Asistente (ícono de chat)
- Más (ícono de puntos)

### PANTALLA DE TAREAS

**Qué encontrarás:**
- Filtros en la parte superior para ver:
  * Todas las tareas
  * Solo obligatorias (aparecen con borde rojo)
  * Solo opcionales (aparecen con borde azul)
  * Solo completadas
  * Solo pendientes

**Cómo se ven las tareas:**
- Las tareas **obligatorias** tienen un borde y acento en **color rojo**
- Las tareas **opcionales** tienen un borde y acento en **color azul**
- Cada tarea muestra:
  * El título en grande
  * Un checkbox para marcar como completada
  * Notas adicionales (si las agregaste)
  * Botones para editar o eliminar

**Cómo crear una tarea nueva:**
1. Toca el botón circular rojo con "+" en la esquina inferior derecha
2. Se abre un formulario donde debes:
   - Escribir el título de la tarea
   - Elegir si es OBLIGATORIA u OPCIONAL
   - Opcionalmente agregar notas
3. Toca "Guardar" para crear la tarea

**Cómo editar o eliminar:**
- Toca sobre una tarea para ver las opciones
- Botón de lápiz: editar
- Botón de basura: eliminar (te pedirá confirmación)

**Cómo marcar una tarea como completada:**
- Toca el círculo a la izquierda de la tarea
- La tarea se marcará con un check y cambiará de apariencia

### PANTALLA POMODORO

**Qué ves:**
- Un reloj circular grande que muestra el tiempo restante
- Debajo, indica si estás en "Trabajo" o "Descanso"
- Una barra de progreso circular alrededor del reloj
- Un selector de tarea (si no hay sesión activa)
- Configuración de duración del descanso (5 o 10 minutos)
- Botones de control (Iniciar/Pausar/Cancelar)

**Cómo funciona la técnica Pomodoro:**
1. Seleccionas una tarea de tu lista
2. Inicias el temporizador (siempre son 25 minutos de trabajo)
3. Trabajas concentrado hasta que suene la alarma
4. Tomas un descanso (5 o 10 minutos según configuraste)
5. Repites el ciclo

**Cómo usar el Pomodoro:**
1. Toca "Seleccionar Tarea" y elige una de tu lista
2. Si quieres, ajusta la duración del descanso (cambia entre 5 y 10 min)
3. Toca el botón "Iniciar" (triángulo/play)
4. El temporizador cuenta regresivo desde 25:00
5. Puedes pausar con el botón de pausa
6. Puedes cancelar con el botón "Cancelar"
7. Cuando termina, la app te notifica y automáticamente inicia el descanso

**Estados del temporizador:**
- **Inactivo**: No hay sesión activa
- **Trabajando**: Estás en los 25 minutos de concentración
- **Descansando**: Estás en tu pausa de 5 o 10 minutos

**Configurar descansos:**
- En la sección "Duración de Descanso" hay un switch
- Izquierda: 5 minutos
- Derecha: 10 minutos
- Solo puedes cambiar esto cuando NO hay sesión activa

### PANTALLA DE AMBIENTES SONOROS

**Qué encontrarás:**
- Explicación de qué son los ambientes sonoros
- Dos tarjetas de sonido para elegir:
  * **Ruido Rosa**: Sonido equilibrado, como lluvia suave
  * **Ruido Marrón**: Frecuencias graves, como cascada profunda

**Cómo usar los sonidos:**
1. Toca sobre la tarjeta del sonido que quieras (rosa o marrón)
2. La tarjeta seleccionada se resalta con borde azul
3. Aparecen controles de reproducción abajo:
   - Botón de Play/Pausa (reproducir o pausar)
   - Botón de Stop (detener completamente)
   - Control deslizante de volumen (muévelo para ajustar)
4. El sonido se reproduce en bucle continuo
5. Sigue sonando aunque cambies de pantalla (reproducción en segundo plano)

**Información científica:**
- Más abajo en la pantalla encuentras explicaciones sobre:
  * Los beneficios científicos del ruido rosa para TDAH
  * Recomendaciones de uso (volumen, auriculares, etc.)

**Cómo se ve cuando está reproduciendo:**
- La tarjeta tiene un indicador visual animado
- El botón de Play cambia a Pausa
- Puedes ver el nivel de volumen actual

### PANTALLA MODO CONCENTRACIÓN

**Qué es:**
El Modo Concentración convierte tu app en un "teléfono tonto" (dumb phone) temporal.
Bloquea distracciones y te mantiene enfocado en UNA tarea.

**Qué pasa cuando activas este modo:**
- La pantalla se vuelve oscura/minimalista (fondo negro)
- Aparece un mensaje motivacional
- Solo puedes ver la tarea en la que estás trabajando
- Las notificaciones de la app se silencian
- NO puedes navegar a otras pantallas (la navegación está bloqueada)
- Si intentas retroceder, la app te pregunta si realmente quieres salir

**Cómo usar el Modo Concentración:**
1. Al entrar, verás un mensaje motivacional arriba
2. Si no has seleccionado tarea, te pide que elijas una
3. Toca "Seleccionar Tarea"
4. Elige una tarea de la lista emergente
5. La tarea aparece en grande en el centro
6. Puedes cambiar de tarea con el botón "Cambiar Tarea"
7. Para salir, toca el botón rojo "Salir del Modo Concentración"

**Qué ves en la pantalla:**
- Arriba: Un ícono de bombilla y mensaje motivacional
- Centro: Tu tarea actual en texto grande y blanco
- Sección media: Estado del modo concentración mostrando:
  * Notificaciones silenciadas
  * Interfaz minimalista activa
  * Navegación bloqueada
- Abajo: Botón rojo para salir

**Nota importante:**
Este modo solo bloquea las notificaciones de ESTA app y la navegación dentro de la app.
Para bloquear apps externas (WhatsApp, redes sociales, etc.), debes activar
"No Molestar" en la configuración de tu teléfono.

### PANTALLA ASISTENTE (donde estás ahora)

**Qué soy:**
Soy tu asistente conversacional especializado en TDAH. Puedo ayudarte cuando:
- Te sientes bloqueado y no sabes por dónde empezar
- Perdiste el foco y necesitas volver a concentrarte
- Estás procrastinando y no entiendes por qué
- Te sientes desmotivado o abrumado
- No sabes qué tarea hacer primero
- Necesitas ayuda para usar alguna función de la app

**Cómo hablar conmigo:**
1. Escribe tu pregunta o problema en el cuadro de texto de abajo
2. Puedes tocar las sugerencias rápidas que aparecen
3. Envía tu mensaje con el botón de "enviar" (avión de papel)
4. Yo respondo con estrategias basadas en ciencia para TDAH
5. Puedo ver tus tareas y sesiones para darte consejos personalizados

**Qué tipo de cosas puedes preguntarme:**
- "Estoy bloqueado, no sé qué hacer"
- "Me cuesta concentrarme"
- "¿Para qué sirve el ruido rosa?"
- "¿Cómo uso el temporizador?"
- "No sé por qué tarea empezar"
- "Estoy procrastinando mucho"
- "¿Qué es el modo concentración?"

**Cómo respondo:**
- Identifico patrones comunes en TDAH (parálisis ejecutiva, pérdida de foco, etc.)
- Te doy estrategias prácticas y validadas científicamente
- Te sugiero qué herramienta de la app puede ayudarte
- Valido tus emociones (no es falta de disciplina, es cómo funciona tu cerebro)
- Veo si tienes tareas pendientes y te ayudo a priorizarlas

**Badges que puedes ver:**
- ✨ LLM: Significa que usé inteligencia artificial para darte una respuesta más natural
- Etiquetas como "🔓 Parálisis ejecutiva" o "🎯 Pérdida de foco" indican qué patrón detecté

### PANTALLA CONFIGURACIÓN (Más)

**Qué puedes configurar:**

1. **Temporizador Pomodoro:**
   - Duración de Pausas (5 o 10 minutos)
   - Cambia entre las dos opciones tocando los botones

2. **Notificaciones:**
   - Switch para activar/desactivar notificaciones
   - Te avisa cuando terminan sesiones Pomodoro

3. **Información de la app:**
   - Versión actual
   - Créditos del desarrollador

### NAVEGACIÓN GENERAL

**Cómo moverte por la app:**
- Usa la barra inferior con 5 iconos:
  1. **Casa**: Volver al inicio
  2. **Lista**: Ver tus tareas
  3. **Reloj**: Temporizador Pomodoro
  4. **Chat**: Hablar conmigo (asistente)
  5. **Tres puntos**: Configuración

**Colores y su significado:**
- **Rojo**: Tareas obligatorias, acciones principales, botón de salir
- **Azul**: Tareas opcionales, Pomodoro, información
- **Morado**: Modo Concentración
- **Naranja**: Ambientes sonoros
- **Verde**: Asistente (yo), estados positivos

### TIPS DE USO DIARIO

**Flujo recomendado:**
1. Empieza el día en Inicio - revisa tus tareas pendientes
2. Ve a Tareas y agrega las del día (marca cuáles son obligatorias)
3. Activa Ambientes Sonoros si te ayudan a concentrarte
4. Ve a Pomodoro, selecciona una tarea obligatoria y trabaja 25 minutos
5. Si te distraes, usa Modo Concentración
6. Si te sientes bloqueado, ven a hablar conmigo

**Combinaciones poderosas:**
- Pomodoro + Ambientes Sonoros = máxima concentración
- Modo Concentración + Ruido Rosa = bloqueo total de distracciones
- Asistente cuando sientas parálisis → te doy estrategia → aplicas con Pomodoro

**La app funciona 100% offline:**
No necesitas internet. Todo se guarda en tu teléfono de forma local.
`;

/**
 * Get app tutorial knowledge
 * @returns {string} - Tutorial content
 */
function getAppTutorial() {
  return APP_USER_TUTORIAL;
}

/**
 * Get specific section of the tutorial
 * @param {string} screen - Screen name
 * @returns {string} - Tutorial section
 */
function getTutorialSection(screen) {
  const sections = {
    'home': 'PANTALLA PRINCIPAL (Inicio/Home)',
    'tareas': 'PANTALLA DE TAREAS',
    'pomodoro': 'PANTALLA POMODORO',
    'sonidos': 'PANTALLA DE AMBIENTES SONOROS',
    'concentracion': 'PANTALLA MODO CONCENTRACIÓN',
    'asistente': 'PANTALLA ASISTENTE',
    'configuracion': 'PANTALLA CONFIGURACIÓN',
  };

  const sectionTitle = sections[screen.toLowerCase()];

  if (!sectionTitle) {
    return APP_USER_TUTORIAL;
  }

  // Extract relevant section (simple implementation)
  const lines = APP_USER_TUTORIAL.split('\n');
  const startIndex = lines.findIndex(line => line.includes(sectionTitle));

  if (startIndex === -1) {
    return APP_USER_TUTORIAL;
  }

  // Find next section or end
  const endIndex = lines.findIndex((line, idx) =>
    idx > startIndex && line.startsWith('### PANTALLA')
  );

  const relevantLines = endIndex === -1
    ? lines.slice(startIndex)
    : lines.slice(startIndex, endIndex);

  return relevantLines.join('\n');
}

/**
 * Detect if user is asking about app functionality
 * @param {string} message - User message
 * @returns {object|null} - { isAppQuestion: boolean, screen: string }
 */
function detectAppQuestion(message) {
  const lowerMsg = message.toLowerCase();

  // Preguntas generales sobre la app
  if (lowerMsg.match(/c[oó]mo (funciona|uso|usar|se usa|utiliz)|qu[eé] (es|hace|significa|son)|para qu[eé] (sirve|es)|d[oó]nde (est[aá]|encuentro|veo)|explicar|mostrar|ayuda con/)) {

    // Detectar pantalla específica
    if (lowerMsg.match(/inicio|home|principal|pantalla principal/)) {
      return { isAppQuestion: true, screen: 'home' };
    }
    if (lowerMsg.match(/tarea|lista de tarea|crear tarea|obligatoria|opcional/)) {
      return { isAppQuestion: true, screen: 'tareas' };
    }
    if (lowerMsg.match(/pomodoro|temporizador|timer|25 minutos|sesion/)) {
      return { isAppQuestion: true, screen: 'pomodoro' };
    }
    if (lowerMsg.match(/sonido|ruido (rosa|marr[oó]n)|audio|ambiente/)) {
      return { isAppQuestion: true, screen: 'sonidos' };
    }
    if (lowerMsg.match(/concentraci[oó]n|modo concentr|foco|enfoque|dumb phone/)) {
      return { isAppQuestion: true, screen: 'concentracion' };
    }
    if (lowerMsg.match(/asistente|chatbot|hablar|preguntar/)) {
      return { isAppQuestion: true, screen: 'asistente' };
    }
    if (lowerMsg.match(/configuraci[oó]n|ajustes|settings/)) {
      return { isAppQuestion: true, screen: 'configuracion' };
    }

    // Pregunta general sobre la app
    return { isAppQuestion: true, screen: 'general' };
  }

  return null;
}

module.exports = {
  getAppTutorial,
  getTutorialSection,
  detectAppQuestion,
  APP_USER_TUTORIAL,
};
