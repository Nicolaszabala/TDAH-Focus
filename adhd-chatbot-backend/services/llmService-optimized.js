const axios = require('axios');
const { getOptimizedKnowledge, detectPattern } = require('../knowledge/adhd-knowledge-base-optimized');

// Hugging Face configuration
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.2-1B-Instruct';
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

// Validate API key
if (!HF_API_KEY || HF_API_KEY === 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
  console.warn('⚠️  WARNING: HUGGING_FACE_API_KEY not properly configured!');
}

/**
 * Generate response using OPTIMIZED prompt strategy
 * Uses proper system/user message separation for better instruction following
 *
 * @param {string} userMessage - User's message
 * @param {Object} context - App context
 * @returns {Promise<string>} - Generated response
 */
async function generateOptimizedResponse(userMessage, context = {}) {
  try {
    console.log('📤 Calling Hugging Face API (optimized)...');

    // Build compact context summary
    const contextSummary = buildCompactContext(context);

    // Get pattern-specific knowledge
    const pattern = detectPattern(userMessage);
    const knowledge = getOptimizedKnowledge(userMessage);

    console.log(`   Detected pattern: ${pattern || 'general'}`);
    console.log(`   Knowledge length: ${knowledge.length} chars`);

    // CRITICAL: Separate system instructions from user query
    // This helps small models follow instructions better
    const systemMessage = buildSystemMessage(knowledge);
    const userPrompt = buildUserPrompt(userMessage, contextSummary);

    const totalLength = systemMessage.length + userPrompt.length;
    console.log(`   Total prompt: ${totalLength} chars (~${Math.ceil(totalLength / 4)} tokens)`);

    const response = await axios.post(
      HF_API_URL,
      {
        model: HF_MODEL,
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        max_tokens: 350,        // Slightly reduced for better completion
        temperature: 0.7,       // Reduced from 0.75 for more focused responses
        top_p: 0.9,             // Reduced from 0.92 for better coherence
        frequency_penalty: 0.3, // Increased slightly to reduce repetition
        presence_penalty: 0.2,
        stop: ['\n\n\n', '###', 'Usuario:', 'User:', 'CONSULTA:', 'RESPUESTA:'],
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Response received');

    const generatedText = response.data?.choices?.[0]?.message?.content;

    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error('Empty response from model');
    }

    return cleanResponse(generatedText);

  } catch (error) {
    console.error('❌ LLM API Error:', error.message);

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 503) {
        console.log('⏳ Model loading...');
        return 'El asistente está iniciando (puede tomar hasta 30 segundos). Por favor, intenta de nuevo en un momento.';
      }

      if (status === 429) {
        console.log('⚠️  Rate limit exceeded');
        return 'He recibido muchas consultas. Por favor, espera un momento antes de intentar de nuevo.';
      }

      if (status === 401 || status === 403) {
        console.error('🔒 Authentication error');
        throw new Error('API authentication failed');
      }

      console.error('API Response Error:', { status, data: JSON.stringify(data).substring(0, 200) });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'La consulta está tomando más tiempo del esperado. Por favor, intenta con una pregunta más corta.';
    }

    throw new Error('Failed to generate response from LLM');
  }
}

/**
 * Build system message with instructions and knowledge
 */
function buildSystemMessage(knowledge) {
  return `Eres un asistente especializado en TDAH adulto. SIEMPRE respondes en ESPAÑOL.

${knowledge}

INSTRUCCIONES OBLIGATORIAS:
1. Responde en ESPAÑOL (nunca inglés)
2. Extensión: 120-180 palabras
3. Tono: empático pero profesional
4. Estructura OBLIGATORIA:
   • Validación empática (1 línea)
   • Explicación breve del "por qué" (contexto TDAH)
   • 2-3 estrategias prácticas numeradas
   • Menciona UNA herramienta de la app (Pomodoro, Modo Concentración, o Ambientes Sonoros)
5. Usa emojis estratégicos: 📌 🎯 💡 ⏱️
6. Lenguaje de coaching: "podrías probar...", "una estrategia es...", "funciona bien..."
7. NUNCA diagnostiques ni reemplaces terapia profesional`;
}

/**
 * Build user prompt with context
 */
function buildUserPrompt(message, context) {
  return `CONTEXTO: ${context}

CONSULTA DEL USUARIO: "${message}"

Responde en español siguiendo la estructura obligatoria (validación + explicación + estrategias + herramienta app). 120-180 palabras.`;
}

/**
 * Build compact context summary
 */
function buildCompactContext(context) {
  const { tasks = [], pomodoroSessions = 0 } = context;

  const obligatory = tasks.filter(t => t.isMandatory && !t.completed).length;
  const optional = tasks.filter(t => !t.isMandatory && !t.completed).length;
  const completed = tasks.filter(t => t.completed && isToday(t.completedAt)).length;

  if (obligatory + optional === 0) {
    return 'Usuario sin tareas pendientes actualmente.';
  }

  const parts = [];
  if (obligatory > 0) parts.push(`${obligatory} obligatoria(s)`);
  if (optional > 0) parts.push(`${optional} opcional(es)`);

  let summary = `Tareas pendientes: ${parts.join(', ')}.`;
  if (completed > 0) summary += ` Completó ${completed} hoy.`;
  if (pomodoroSessions > 0) summary += ` ${pomodoroSessions} Pomodoro(s) completados hoy.`;

  return summary;
}

/**
 * Check if timestamp is from today
 */
function isToday(timestamp) {
  if (!timestamp) return false;
  try {
    return new Date().toDateString() === new Date(timestamp).toDateString();
  } catch {
    return false;
  }
}

/**
 * Clean and format the response
 */
function cleanResponse(text) {
  let cleaned = text.trim();

  // Remove common artifacts
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s*[-•]\s*/gm, '• ');
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/<\|.*?\|>/g, '');
  cleaned = cleaned.replace(/^(Assistant|AI|Response|Respuesta):\s*/i, '');
  cleaned = cleaned.replace(/\{.*?\}/g, '');

  // Remove incomplete sentences at end
  const sentences = cleaned.split(/([.!?]\s+)/);
  let completeSentences = [];

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if (part.match(/^[.!?]\s+$/)) {
      completeSentences.push(part);
    } else if (part.trim()) {
      if (i === sentences.length - 1 && !part.match(/[.!?]$/)) {
        // Skip incomplete final sentence
        break;
      } else {
        completeSentences.push(part);
      }
    }
  }

  cleaned = completeSentences.join('').trim();

  // Ensure it ends with punctuation
  if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
    cleaned += '.';
  }

  // Max length check
  const maxLength = 600;
  if (cleaned.length > maxLength) {
    const truncated = cleaned.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    if (lastSentenceEnd > maxLength * 0.7) {
      cleaned = cleaned.substring(0, lastSentenceEnd + 1);
    } else {
      const lastSpace = truncated.lastIndexOf(' ');
      cleaned = cleaned.substring(0, lastSpace) + '...';
    }
  }

  return cleaned;
}

/**
 * Test connection to Hugging Face API
 */
async function testConnection() {
  try {
    const testContext = { tasks: [], pomodoroSessions: 0 };
    const response = await generateOptimizedResponse('Hola', testContext);
    console.log('✅ Hugging Face API connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Hugging Face API connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  generateOptimizedResponse,
  testConnection,
  // Keep old function for backwards compatibility
  generateResponse: generateOptimizedResponse,
};
