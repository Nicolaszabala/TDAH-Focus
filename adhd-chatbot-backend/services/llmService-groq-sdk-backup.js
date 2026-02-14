/**
 * LLM Service usando Groq API (GRATIS y ULTRA RÁPIDO)
 *
 * Ventajas:
 * - Llama 3.1 8B Instant (modelo potente)
 * - Respuestas en <1 segundo
 * - Gratis: 6000 tokens/min
 * - Sin usar recursos de tu servidor
 *
 * Setup:
 * 1. Obtén API key gratis: https://console.groq.com/keys
 * 2. Agrega a .env: GROQ_API_KEY=tu_clave
 * 3. Instala: npm install groq-sdk
 * 4. Usa este servicio en lugar de llmService.js
 */

const Groq = require('groq-sdk');

// Inicializar cliente Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'AGREGAR_TU_CLAVE_AQUI'
});

/**
 * Genera respuesta usando Groq API
 *
 * @param {string} prompt - El prompt del usuario
 * @param {object} options - Opciones de generación
 * @returns {Promise<string>} - Respuesta generada
 */
async function generateResponse(prompt, options = {}) {
  try {
    const {
      maxTokens = 1500,      // Aumentado de 450 a 1500
      temperature = 0.72,
      topP = 0.92,
      model = 'llama-3.1-8b-instant'  // Modelo rápido de 8B parámetros
    } = options;

    console.log('Calling Groq API...');
    const startTime = Date.now();

    const response = await groq.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: `Eres un asistente especializado en TDAH (Trastorno por Déficit de Atención e Hiperactividad).

Tus características:
- Respondes SIEMPRE en español
- Eres empático, comprensivo y motivador
- Das consejos prácticos y aplicables
- Usas listas cuando es apropiado
- Tus respuestas son claras y concisas (150-300 palabras)
- Te enfocas en estrategias basadas en evidencia
- Conoces sobre la app TDAH Focus y sus funciones (Pomodoro, Modo Concentración, Ruido Rosa)

IMPORTANTE:
- NO empieces respuestas con "Claro", "Por supuesto", "Te explico"
- Empieza DIRECTO con validación o el consejo
- Usa un tono cercano pero profesional`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP,
      frequency_penalty: 0.4,
      presence_penalty: 0.2,
      stop: ['\n\n\n\n', '###', 'Usuario:', 'User:']
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✅ Groq API response time: ${responseTime}ms`);
    console.log(`Tokens used: ${response.usage.total_tokens}`);

    const generatedText = response.choices[0].message.content;

    return {
      response: generatedText.trim(),
      model: model,
      tokensUsed: response.usage.total_tokens,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('Error calling Groq API:', error);

    // Manejo de errores específicos
    if (error.status === 401) {
      throw new Error('API key de Groq inválida. Verifica GROQ_API_KEY en .env');
    }

    if (error.status === 429) {
      throw new Error('Límite de rate excedido. Groq tier gratuito: 6000 tokens/min');
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar a Groq API. Verifica conexión a internet.');
    }

    throw error;
  }
}

/**
 * Health check del servicio Groq
 *
 * @returns {Promise<boolean>} - true si el servicio está disponible
 */
async function healthCheck() {
  try {
    // Hacer una llamada simple para verificar que la API key funciona
    await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 10
    });
    return true;
  } catch (error) {
    console.error('Groq health check failed:', error.message);
    return false;
  }
}

/**
 * Obtiene información de uso y límites
 *
 * @returns {Promise<object>} - Información del servicio
 */
async function getServiceInfo() {
  return {
    provider: 'Groq',
    model: 'llama-3.1-8b-instant',
    parameters: '8B',
    contextWindow: '8K tokens',
    maxOutputTokens: '8000',
    rateLimit: '6000 tokens/min (tier gratuito)',
    pricing: 'Gratis',
    averageResponseTime: '<1 segundo',
    features: [
      'Ultra rápido',
      'Sin límites estrictos de tokens',
      'Calidad superior a modelos pequeños',
      'Sin uso de recursos locales'
    ]
  };
}

module.exports = {
  generateResponse,
  healthCheck,
  getServiceInfo
};
