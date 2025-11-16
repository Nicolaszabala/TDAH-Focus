# 📚 Knowledge Base - TDAH Focus App

Esta carpeta contiene la base de conocimiento especializada que se inyecta en el LLM para proporcionar respuestas más informadas y basadas en evidencia.

## 📖 Cómo Agregar Contenido de un Libro

### Método 1: Resumen Estructurado (Recomendado)

Si tienes un libro sobre TDAH que quieres usar como fuente:

1. **Lee y extrae conceptos clave** del libro
2. **Crea un archivo** con el resumen estructurado
3. **Agrega la fuente** para referencias

**Ejemplo**: `adhd-book-driven-to-distraction.js`

```javascript
/**
 * Driven to Distraction - Edward M. Hallowell & John J. Ratey
 * Conceptos clave extraídos para knowledge base
 */

const DRIVEN_TO_DISTRACTION_KNOWLEDGE = `
FUENTE: "Driven to Distraction" (Hallowell & Ratey, 2011)

## Conceptos Clave sobre TDAH Adulto:

### Mitos vs. Realidad
❌ MITO: TDAH es solo cosa de niños
✅ REALIDAD: 60% de niños con TDAH lo mantienen en adultez

❌ MITO: Es falta de disciplina
✅ REALIDAD: Es diferencia neurobiológica en dopamina y noradrenalina

### Patrones Comunes en Adultos:
1. Procrastinación crónica (no por pereza, por abrumamiento)
2. Hiperfoco en temas de interés (horas sin darse cuenta)
3. Desorganización crónica a pesar de múltiples intentos
4. Dificultad para mantener rutinas
5. Sensibilidad a críticas (rechazo percibido)

### Estrategias Recomendadas por los Autores:
1. **Estructura externa es clave**: No confiar en memoria/voluntad interna
2. **Listas cortas**: Máximo 3 items por lista
3. **Recordatorios múltiples**: Visual + auditivo + táctil
4. **Ejercicio físico**: 20-30 min diario mejora dopamina naturalmente
5. **Sueño no negociable**: 7-9 horas crítico para función ejecutiva

### Señales de Que Necesitas Ayuda Profesional:
- Has intentado 3+ sistemas de organización y todos fallan
- Impacto en relaciones personales (parejas mencionan olvidos)
- Riesgo de perder empleo por tardanzas/olvidos
- Uso de estimulantes no prescritos (cafeína excesiva, etc.)
`;

module.exports = DRIVEN_TO_DISTRACTION_KNOWLEDGE;
```

### Método 2: Chunks de Texto Relevante

Si quieres citar párrafos específicos del libro:

```javascript
const BOOK_EXCERPTS = {
  paralisis_ejecutiva: `
    "La parálisis ante tareas es característica del TDAH adulto.
    No es pereza. El cerebro literalmente no genera suficiente
    dopamina para iniciar tareas que no son inmediatamente
    gratificantes." (Hallowell, pág. 87)
  `,

  estrategia_iniciacion: `
    "La regla de oro: divide hasta que sea ridículamente pequeño.
    Si escribir un informe te paraliza, empieza con 'abrir Word'.
    Eso es TODO. El siguiente paso vendrá solo." (Hallowell, pág. 142)
  `,
};
```

### Método 3: Para Libros Extensos (RAG - Retrieval Augmented Generation)

Si tienes un libro completo y quieres que el LLM pueda "buscar" información relevante:

**Opción A - Vector Database (Avanzado)**:
- Usa Pinecone, Weaviate, o ChromaDB
- Embeddings de chunks del libro
- Búsqueda semántica antes de consulta al LLM

**Opción B - Simple Index (Intermedio)**:
```javascript
// Indexar por temas
const BOOK_INDEX = {
  keywords: {
    'parálisis': [
      'El cerebro TDAH tiene déficit de dopamina...',
      'Estrategias: tarea de 2 minutos...',
    ],
    'procrastinación': [...],
    'hiperfoco': [...],
  }
};

// Buscar keywords en mensaje del usuario
function findRelevantKnowledge(userMessage) {
  const keywords = extractKeywords(userMessage);
  return keywords.map(k => BOOK_INDEX.keywords[k]).flat();
}
```

## 🔧 Integración Actual

El sistema actual usa `adhd-knowledge-base.js` que se inyecta en CADA consulta.

**Limitación de tokens**: Los LLMs tienen límite de contexto (~4000 tokens para Llama 3.2 1B).

**Estrategia actual**:
- ~1500 tokens de knowledge base
- ~500 tokens de prompt + instrucciones
- ~500 tokens de contexto del usuario
- ~1500 tokens disponibles para respuesta

## 📝 Cómo Agregar Nuevo Contenido

1. **Edita** `adhd-knowledge-base.js`
2. **Agrega secciones** con el nuevo conocimiento
3. **Mantén formato consistente**: Títulos, listas, bullets
4. **Cita fuentes** cuando sea posible
5. **Prueba** que el LLM use el conocimiento

**Ejemplo de adición**:

```javascript
// En adhd-knowledge-base.js

### Estrategias de Tu Libro Favorito:
1. **Técnica del Ancla**: (De "Tu Libro", pág. X)
   - Descripción de la técnica
   - Cuándo usarla
   - Ejemplo práctico

2. **Método XYZ**: (De "Otro Libro", Capítulo 5)
   - ...
```

## 🧪 Testing

Prueba que el LLM use el conocimiento:

```bash
curl -X POST https://adhd-chatbot-api.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qué hago con la procrastinación crónica?",
    "context": {}
  }'
```

La respuesta debería mencionar conceptos del knowledge base.

## 📊 Fuentes Actuales

1. **adhd-knowledge-base.js**: Compilación de:
   - Fundamentos neurobiológicos generales
   - Estrategias cognitivo-conductuales validadas
   - Meta-análisis Nigg et al. (2024) sobre ruido rosa
   - Mejores prácticas de gestión TDAH

## 🔮 Futuras Mejoras

- [ ] RAG con vector database para libros completos
- [ ] Knowledge base por temas específicos (laboral, relaciones, etc.)
- [ ] Actualización automática con nuevos papers científicos
- [ ] Personalización de knowledge base por usuario

---

## 🎯 Tutorial de Usuario de la App (NUEVO)

### `app-user-tutorial.js` ✨

**Objetivo**: Permitir al asistente explicar cómo usar la app desde la **perspectiva del usuario**, NO desde la implementación técnica.

**Contenido**:
- Descripción detallada de cada pantalla (Home, Tareas, Pomodoro, Sonidos, Concentración, Asistente, Configuración)
- Instrucciones paso a paso para cada funcionalidad
- Explicación de colores, iconos y elementos visuales
- Casos de uso prácticos y flujos recomendados
- Tips de uso diario

### Diferencia Clave: Técnico vs. Usuario

**❌ Respuesta Técnica (NO deseada)**:
```
"El componente PomodoroScreen renderiza un TimerDisplay que usa el
selector selectFormattedTimeRemaining del slice..."
```

**✅ Respuesta Usuario (DESEADA)**:
```
"En la pantalla Pomodoro ves un reloj circular grande que muestra
cuántos minutos quedan. Toca 'Seleccionar Tarea' para elegir en qué
trabajar, luego toca el botón 'Iniciar' (triángulo azul)..."
```

### Uso en el Código

El sistema automáticamente detecta preguntas sobre la app:

```javascript
const { detectAppQuestion, getTutorialSection } = require('./knowledge/app-user-tutorial');

// Detecta automáticamente preguntas como:
// "¿Cómo creo una tarea?"
// "¿Para qué sirve el ruido rosa?"
// "¿Qué es el modo concentración?"

const detection = detectAppQuestion(userMessage);
if (detection && detection.isAppQuestion) {
  const tutorial = getTutorialSection(detection.screen);
  // Construye prompt orientado al usuario
}
```

### Integración en `promptBuilder.js`

Cuando el usuario pregunta sobre la app:
1. Se detecta automáticamente el tipo de pregunta
2. Se extrae la sección relevante del tutorial
3. Se construye un prompt que instruye al LLM a:
   - Responder desde perspectiva del usuario
   - Mencionar qué VE en pantalla (colores, iconos, posiciones)
   - Dar pasos concretos y accionables
   - NO mencionar términos técnicos (componentes, estados, props, etc.)
   - Usar segunda persona ("tú ves", "tocas", "aparece")

### Pantallas Cubiertas

1. **Home** - Dashboard con estadísticas y acciones rápidas
2. **Tareas** - Creación, edición, filtrado de tareas obligatorias/opcionales
3. **Pomodoro** - Temporizador 25 min con selector de tarea
4. **Sonidos** - Ambientes sonoros (ruido rosa y marrón)
5. **Concentración** - Modo focus/dumb phone
6. **Asistente** - Chat conversacional con el usuario
7. **Configuración** - Ajustes de duración de pausas y notificaciones

### Ejemplos de Preguntas que Activan el Tutorial

- "¿Cómo creo una tarea obligatoria?"
- "¿Qué diferencia hay entre ruido rosa y marrón?"
- "No entiendo cómo usar el Pomodoro"
- "¿Para qué sirve el modo concentración?"
- "¿Dónde veo mis sesiones completadas?"
- "Explícame los botones de la pantalla principal"

### Testing

Prueba con preguntas reales:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cómo creo una tarea?",
    "context": {}
  }'
```

Respuesta esperada (perspectiva de usuario):
- Menciona el botón circular rojo con "+"
- Explica los campos del formulario
- Describe la diferencia visual entre obligatoria (rojo) y opcional (azul)
- Da pasos concretos sin mencionar código

### Mantenimiento

Al agregar nuevas funcionalidades a la app:
1. Actualizar `app-user-tutorial.js` con descripción desde perspectiva de usuario
2. Actualizar patrones de detección en `detectAppQuestion()`
3. Probar con preguntas reales
4. Verificar que NO se mencionen términos técnicos en las respuestas
