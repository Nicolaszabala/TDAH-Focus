/**
 * ADHD Knowledge Base
 *
 * Conocimiento especializado sobre TDAH adulto extraído de fuentes científicas
 * Este conocimiento se inyecta en el system prompt del LLM
 */

const { SCATTERED_MINDS_CONCEPTS } = require('./scattered-minds-concepts');

const ADHD_KNOWLEDGE = `
CONOCIMIENTO ESPECIALIZADO SOBRE TDAH ADULTO:

## Fundamentos Neurobiológicos
- Déficit de dopamina en corteza prefrontal y núcleo accumbens
- Disfunción ejecutiva afecta: planificación, inhibición, memoria de trabajo
- Hipersensibilidad a recompensas inmediatas vs. diferidas
- Variabilidad en rendimiento (días buenos/malos es normal)

## Estrategias Cognitivo-Conductuales Validadas

### Para Parálisis Ejecutiva:
1. **Regla de 2 minutos**: Compromiso mínimo rompe inercia
2. **Chunking**: Dividir en micro-tareas de 5-10 min
3. **Externalizar decisiones**: Listas, alarmas, estructura externa
4. **Body doubling**: Trabajar cerca de otras personas (presencial o virtual)

### Para Gestión de Tiempo:
1. **Time Boxing**: Bloques fijos (Pomodoro 25min es óptimo)
2. **Buffer time**: Agregar 30-50% tiempo extra a estimaciones
3. **Transiciones explícitas**: Alarmas para cambios de actividad
4. **Now/Not Now**: Solo 2 categorías, eliminar "luego"

### Para Gestión Emocional:
1. **Normalización**: Explicar que es neurodivergencia, no falla personal
2. **Reframe de "productividad tóxica"**: Descanso es necesidad, no debilidad
3. **Celebrar "micro-wins"**: Reconocer cada tarea completada
4. **Aceptación radical**: Días malos van a existir, está bien

### Para Hiperfoco Problemático:
1. **Alarmas físicas externas**: No confiar en percepción interna del tiempo
2. **Barreras físicas**: Cerrar laptop, poner sticky note en pantalla
3. **Pre-decisiones**: Definir fin de sesión ANTES de empezar
4. **Recompensas programadas**: "Después de 25min → recompensa"

## Estrategias a EVITAR (ineficaces para TDAH):
❌ "Solo concéntrate más"
❌ "Simplemente prioriza mejor"
❌ "Necesitas más disciplina"
❌ Sistemas de productividad complejos (GTD, Bullet Journal avanzado)
❌ Múltiples apps/herramientas (paradoja de elección)

## Herramientas Efectivas (orden de evidencia):
1. ✅ Temporizadores externos (Pomodoro)
2. ✅ Listas visuales simples (2 categorías máximo)
3. ✅ Recordatorios con alarmas
4. ✅ Ambiente minimalista (reducir estímulos)
5. ✅ Ruido rosa/marrón (evidencia moderada: Nigg et al., 2024)

## Señales de Alerta para Derivar a Profesional:
- Ideación suicida o autolesión
- Abuso de sustancias como automedicación
- Comorbilidad con depresión/ansiedad severa
- Solicitudes de diagnóstico o medicación
- Impacto severo en relaciones/trabajo (más de 6 meses)

${SCATTERED_MINDS_CONCEPTS}
`;

/**
 * Get ADHD knowledge to inject in system prompt
 * @returns {string} - Knowledge base content
 */
function getADHDKnowledge() {
  return ADHD_KNOWLEDGE;
}

/**
 * Get specific knowledge section
 * @param {string} topic - Topic to retrieve
 * @returns {string} - Specific knowledge section
 */
function getKnowledgeSection(topic) {
  // En el futuro, podrías tener secciones específicas por tema
  const sections = {
    'paralisis_ejecutiva': 'Estrategias para parálisis ejecutiva...',
    'tiempo': 'Estrategias para gestión de tiempo...',
    // etc.
  };

  return sections[topic] || ADHD_KNOWLEDGE;
}

module.exports = {
  getADHDKnowledge,
  getKnowledgeSection,
  ADHD_KNOWLEDGE,
};
