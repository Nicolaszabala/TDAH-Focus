# ADHD Knowledge Base

Este directorio contiene el conocimiento especializado sobre TDAH adulto que usa el asistente conversacional en modo offline.

## 📁 Estructura

```
knowledge/
├── README.md                      # Este archivo
├── index.js                       # Export principal
├── adhdKnowledgeBase.js          # Knowledge base completo
├── adhdKnowledgeOptimized.js     # Knowledge base optimizado con detección de patrones
└── scatteredMindsConcepts.js     # Conceptos del libro "Scattered Minds" de Dr. Gabor Maté
```

## 🎯 Propósito

El knowledge base permite que el asistente conversacional funcione **100% offline** con el mismo nivel de conocimiento que la versión online (LLM).

### Ventajas del Knowledge Base Offline:

1. **Privacidad Total**: No se envía ningún dato al servidor
2. **Funcionamiento Offline**: La app funciona sin conexión a internet
3. **Respuestas Instantáneas**: No hay latencia de red
4. **Conocimiento Científico**: Basado en evidencia sobre TDAH adulto

## 📚 Contenido del Knowledge Base

### 1. Fundamentos Neurobiológicos
- Déficit de dopamina y función ejecutiva
- Hipersensibilidad a recompensas
- Variabilidad en rendimiento

### 2. Estrategias Cognitivo-Conductuales
- **Parálisis Ejecutiva**: Regla de 2 minutos, chunking, externalización
- **Gestión de Tiempo**: Time boxing, Pomodoro, buffer time
- **Gestión Emocional**: Normalización, micro-wins, aceptación radical
- **Hiperfoco**: Alarmas externas, barreras físicas, pre-decisiones

### 3. Conceptos de "Scattered Minds" (Dr. Gabor Maté)
- Modelo bio-psico-social del TDAH
- Auto-regulación deficiente (emocional, conductual, motivacional)
- Sensibilidad emocional aumentada (RSD)
- Estrategias de sanación y compasión

## 🔧 Uso

### Importar Todo el Knowledge Base

```javascript
import { getADHDKnowledge } from '../knowledge';

const fullKnowledge = getADHDKnowledge();
console.log(fullKnowledge);
```

### Importar Knowledge Optimizado (Recomendado)

```javascript
import {
  getOptimizedKnowledge,
  detectPattern
} from '../knowledge';

const userMessage = "no sé por dónde empezar";
const pattern = detectPattern(userMessage); // 'paralisis_ejecutiva'
const relevantKnowledge = getOptimizedKnowledge(userMessage);
```

### Importar Conceptos Específicos

```javascript
import {
  getCoreKnowledge,
  getPatternKnowledge,
  SCATTERED_MINDS_CONCEPTS
} from '../knowledge';

// Core knowledge (siempre incluir)
const core = getCoreKnowledge();

// Knowledge de patrón específico
const paralysisInfo = getPatternKnowledge('paralisis_ejecutiva');

// Conceptos de Scattered Minds
console.log(SCATTERED_MINDS_CONCEPTS);
```

## 🎨 Patrones Detectados

El knowledge base optimizado puede detectar automáticamente estos patrones en mensajes de usuarios:

| Patrón | Palabras Clave | Knowledge Específico |
|--------|----------------|---------------------|
| `paralisis_ejecutiva` | "abrumado", "por dónde empezar", "bloqueado" | Regla de 2 min, chunking, Pomodoro |
| `foco` | "concentrar", "distraído", "atención" | Modo Concentración, ruido rosa, body doubling |
| `procrastinacion` | "postergar", "dejar para después" | Evitación emocional, estrategia Maté |
| `desmotivacion` | "sin ganas", "agotado", "cansado" | Micro-recompensas, validación, descanso |
| `indecision` | "no sé cuál", "qué hago primero" | Matriz de priorización, obligatorias primero |

## 🔄 Sincronización con Backend

El knowledge base offline está sincronizado con el knowledge base del backend LLM:

**Backend**: `/adhd-chatbot-backend/knowledge/`
- `adhd-knowledge-base.js` → `adhdKnowledgeBase.js`
- `adhd-knowledge-base-optimized.js` → `adhdKnowledgeOptimized.js`
- `scattered-minds-concepts.js` → `scatteredMindsConcepts.js`

### Actualizar Knowledge Base

Si se actualiza el knowledge base del backend, copiar los cambios manualmente a los archivos de la app:

```bash
# Desde el directorio raíz del proyecto
cd TFG
diff adhd-chatbot-backend/knowledge/adhd-knowledge-base.js adhd-focus-app/src/knowledge/adhdKnowledgeBase.js
```

## 📖 Referencias Científicas

El knowledge base está basado en:

1. **Nigg et al., 2024**: Ruido blanco/rosa y rendimiento atencional
2. **Kreider et al., 2019**: Técnica Pomodoro y TDAH
3. **Isaac et al., 2024**: Disfunción ejecutiva y neurobiología TDAH
4. **Dr. Gabor Maté**: "Scattered Minds: The Origins and Healing of Attention Deficit Disorder"

## 🚨 Importante

- **NO modificar** la estructura del knowledge base sin actualizar también el backend
- **Mantener sincronizado** con el backend para consistencia entre modo online/offline
- **No incluir PII** (información personal identificable) en el knowledge base
- El knowledge base es **educativo**, no reemplaza atención médica profesional

## 🔐 Privacidad

El knowledge base está almacenado **localmente en el dispositivo**:
- ✅ No se transmite a servidores externos
- ✅ No requiere conexión a internet
- ✅ No contiene información personal del usuario
- ✅ Solo contiene conocimiento científico general sobre TDAH

## 📝 Ejemplo Completo

```javascript
// En chatService.js
import { getOptimizedKnowledge, detectPattern } from '../knowledge';

function generateOfflineResponse(userMessage, context) {
  // 1. Detectar patrón
  const pattern = detectPattern(userMessage);

  // 2. Obtener knowledge relevante
  const knowledge = getOptimizedKnowledge(userMessage);

  // 3. Agregar contexto de la app
  const contextInfo = `\nTienes ${context.tasks?.length} tareas pendientes.`;

  // 4. Combinar knowledge + contexto
  return knowledge + contextInfo;
}
```

---

**Última actualización**: 16 de noviembre de 2025
**Versión**: 1.0
**Sincronizado con backend**: ✅ Sí
