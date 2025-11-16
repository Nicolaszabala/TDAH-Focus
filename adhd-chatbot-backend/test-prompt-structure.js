/**
 * Test Prompt Structure
 * Verifies that prompts are correctly formatted
 */

const { buildPrompt } = require('./services/promptBuilder');

console.log('\n=== VERIFICACIÓN DE ESTRUCTURA DE PROMPTS ===\n');

const testContext = {
  tasks: [
    { isMandatory: true, completed: false },
    { isMandatory: false, completed: false }
  ],
  pomodoroSessions: 1,
  hasPendingTasks: true
};

const testMessage = 'Me siento abrumado y no sé por dónde empezar';

const prompt = buildPrompt(testMessage, testContext);

console.log('--- PROMPT COMPLETO ---\n');
console.log(prompt);
console.log('\n--- FIN DEL PROMPT ---\n');

// Analysis
console.log('\n--- ANÁLISIS ---');
console.log(`Longitud total: ${prompt.length} caracteres`);
console.log(`Longitud en tokens (aprox): ${Math.ceil(prompt.length / 4)}`);
console.log(`Contiene instrucción en español: ${prompt.includes('Responde en español') ? 'Sí' : 'No'}`);
console.log(`Incluye knowledge base TDAH: ${prompt.includes('CONOCIMIENTO ESPECIALIZADO') ? 'Sí' : 'No'}`);
console.log(`Incluye Scattered Minds: ${prompt.includes('Scattered Minds') ? 'Sí' : 'No'}`);
console.log(`Incluye contexto del usuario: ${prompt.includes('CONTEXTO ACTUAL DEL USUARIO') ? 'Sí' : 'No'}`);
console.log(`Incluye directrices estrictas: ${prompt.includes('DIRECTRICES ESTRICTAS') ? 'Sí' : 'No'}`);
console.log(`Mensaje del usuario incluido: ${prompt.includes(testMessage) ? 'Sí' : 'No'}`);
console.log(`Instrucciones de formato: ${prompt.includes('INSTRUCCIONES DE FORMATO') ? 'Sí' : 'No'}`);

// Check for potential issues
console.log('\n--- POSIBLES PROBLEMAS ---');
if (prompt.length > 4000) {
  console.log('⚠️  Prompt muy largo (>4000 caracteres) - puede exceder límites de algunos modelos');
}
if (!prompt.includes('español')) {
  console.log('⚠️  No se especifica explícitamente el idioma español');
}
if (prompt.split('\n').length < 50) {
  console.log('⚠️  Prompt parece muy corto, puede faltar knowledge base');
}

console.log('\n');
