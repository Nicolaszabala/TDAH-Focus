/**
 * Test Optimized Prompt Structure
 */

const { buildOptimizedPrompt } = require('./services/promptBuilder-optimized');

console.log('\n=== VERIFICACIÓN PROMPT OPTIMIZADO ===\n');

const testCases = [
  {
    name: 'Parálisis Ejecutiva',
    message: 'Me siento abrumado y no sé por dónde empezar',
  },
  {
    name: 'Pérdida de Foco',
    message: 'No puedo concentrarme, me distraigo constantemente',
  },
  {
    name: 'Procrastinación',
    message: 'Sigo posponiendo las tareas importantes',
  },
  {
    name: 'Consulta General',
    message: '¿Cómo puedo organizarme mejor?',
  }
];

const testContext = {
  tasks: [
    { isMandatory: true, completed: false },
    { isMandatory: false, completed: false }
  ],
  pomodoroSessions: 1,
  hasPendingTasks: true
};

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log(`${'='.repeat(70)}\n`);

  const prompt = buildOptimizedPrompt(testCase.message, testContext);

  console.log('--- PROMPT ---');
  console.log(prompt);
  console.log('\n--- ANÁLISIS ---');
  console.log(`Longitud: ${prompt.length} caracteres`);
  console.log(`Tokens (aprox): ${Math.ceil(prompt.length / 4)}`);
  console.log(`Palabras: ${prompt.split(/\s+/).length}`);

  const targetMax = 3000;
  const reductionPercent = ((1 - prompt.length / 9136) * 100).toFixed(1);

  if (prompt.length <= targetMax) {
    console.log(`✅ Dentro del target (<${targetMax} chars)`);
    console.log(`📉 Reducción: ${reductionPercent}% vs prompt original`);
  } else {
    console.log(`⚠️  Excede target: ${prompt.length - targetMax} chars de más`);
  }
});

console.log('\n' + '='.repeat(70));
console.log('RESUMEN COMPARATIVO');
console.log('='.repeat(70));
console.log('Prompt Original:  9,136 chars (~2,284 tokens)');
console.log('Prompt Optimizado: variable según patrón');
console.log('Target objetivo:   <3,000 chars (~750 tokens)');
console.log('Mejora esperada:   ~67% reducción + conocimiento contextual');
console.log('');
