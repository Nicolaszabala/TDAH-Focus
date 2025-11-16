/**
 * LLM Diagnosis Script
 * Tests the chatbot responses to identify quality issues
 */

const { buildPrompt } = require('./services/promptBuilder');
const axios = require('axios');

// Test configuration
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.2-1B-Instruct';

// Test cases
const testCases = [
  {
    name: 'Parálisis Ejecutiva',
    message: 'Me siento abrumado y no sé por dónde empezar',
    context: {
      tasks: [
        { isMandatory: true, completed: false },
        { isMandatory: true, completed: false },
        { isMandatory: false, completed: false }
      ],
      pomodoroSessions: 0,
      hasPendingTasks: true
    }
  },
  {
    name: 'Pérdida de Foco',
    message: 'No puedo concentrarme, me distraigo con todo',
    context: {
      tasks: [{ isMandatory: true, completed: false }],
      pomodoroSessions: 1,
      hasPendingTasks: true
    }
  },
  {
    name: 'Procrastinación',
    message: 'Sigo posponiendo las tareas importantes',
    context: {
      tasks: [
        { isMandatory: true, completed: false },
        { isMandatory: true, completed: false }
      ],
      pomodoroSessions: 0,
      hasPendingTasks: true
    }
  }
];

async function testLLM(apiKey) {
  console.log('\n=== DIAGNÓSTICO DE CALIDAD DEL LLM ===\n');
  console.log(`Modelo: ${HF_MODEL}`);
  console.log(`API: ${HF_API_URL}\n`);

  for (const testCase of testCases) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`TEST: ${testCase.name}`);
    console.log(`${'='.repeat(80)}\n`);
    console.log(`Mensaje del usuario: "${testCase.message}"\n`);

    // Build the prompt
    const prompt = buildPrompt(testCase.message, testCase.context);

    console.log('--- PROMPT GENERADO (primeros 500 caracteres) ---');
    console.log(prompt.substring(0, 500) + '...\n');

    try {
      console.log('📤 Enviando solicitud a Hugging Face...');

      const response = await axios.post(
        HF_API_URL,
        {
          model: HF_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 400,
          temperature: 0.75,
          top_p: 0.92,
          frequency_penalty: 0.2,
          presence_penalty: 0.2,
          stop: ['\n\n\n', '###', 'Usuario:', 'User:'],
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const generatedText = response.data?.choices?.[0]?.message?.content;

      console.log('✅ RESPUESTA RECIBIDA:\n');
      console.log('--- INICIO DE RESPUESTA ---');
      console.log(generatedText);
      console.log('--- FIN DE RESPUESTA ---\n');

      // Quality analysis
      console.log('--- ANÁLISIS DE CALIDAD ---');
      console.log(`Longitud: ${generatedText.length} caracteres`);
      console.log(`Palabras: ${generatedText.split(/\s+/).length}`);
      console.log(`Idioma detectado: ${detectLanguage(generatedText)}`);
      console.log(`Contiene emojis: ${/[\u{1F300}-\u{1F9FF}]/u.test(generatedText) ? 'Sí' : 'No'}`);
      console.log(`Estructura (párrafos): ${generatedText.split('\n\n').length}`);
      console.log(`Menciona herramientas app: ${mentionsAppTools(generatedText) ? 'Sí' : 'No'}`);
      console.log(`Tono empático: ${hasEmpatheticTone(generatedText) ? 'Sí' : 'No'}`);
      console.log(`Coherencia: ${assessCoherence(generatedText)}`);

    } catch (error) {
      console.error('❌ ERROR:', error.message);

      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

function detectLanguage(text) {
  const spanishWords = ['el', 'la', 'de', 'que', 'es', 'en', 'por', 'para', 'con', 'tu', 'te', 'siento'];
  const englishWords = ['the', 'is', 'are', 'you', 'your', 'can', 'have', 'this', 'that', 'with'];

  const lowerText = text.toLowerCase();
  const spanishCount = spanishWords.filter(word => lowerText.includes(word)).length;
  const englishCount = englishWords.filter(word => lowerText.includes(word)).length;

  if (spanishCount > englishCount) return 'Español';
  if (englishCount > spanishCount) return 'Inglés';
  return 'Indeterminado';
}

function mentionsAppTools(text) {
  const tools = ['pomodoro', 'concentración', 'tarea', 'temporizador', 'sonoro', 'ambiente'];
  return tools.some(tool => text.toLowerCase().includes(tool));
}

function hasEmpatheticTone(text) {
  const empatheticPhrases = [
    'entiendo', 'comprendo', 'es normal', 'válido', 'común',
    'no estás solo', 'tu cerebro', 'natural', 'está bien'
  ];
  return empatheticPhrases.some(phrase => text.toLowerCase().includes(phrase));
}

function assessCoherence(text) {
  // Simple heuristics for coherence
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());

  if (sentences.length < 3) return 'Baja (muy corto)';

  // Check for repetitive patterns
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const diversity = uniqueWords.size / words.length;

  if (diversity < 0.4) return 'Baja (repetitivo)';
  if (diversity > 0.7) return 'Alta';
  return 'Media';
}

// Run tests
const apiKey = process.env.HUGGING_FACE_API_KEY;

if (!apiKey || apiKey === 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
  console.error('\n❌ ERROR: HUGGING_FACE_API_KEY no configurado');
  console.error('Por favor, configura tu API key de Hugging Face:');
  console.error('  export HUGGING_FACE_API_KEY="tu_key_aquí"');
  console.error('  O crea un archivo .env con: HUGGING_FACE_API_KEY=tu_key_aquí\n');
  process.exit(1);
}

testLLM(apiKey).catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  process.exit(1);
});
