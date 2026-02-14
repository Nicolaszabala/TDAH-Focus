/**
 * LLM Service usando Groq API con axios (solución para problemas de DNS)
 */

const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function generateResponse(prompt, options = {}) {
  try {
    const {
      maxTokens = 1500,
      temperature = 0.72,
      topP = 0.92,
      model = 'llama-3.1-8b-instant'
    } = options;

    console.log('Calling Groq API...');
    const startTime = Date.now();

    const response = await axios.post(
      GROQ_API_URL,
      {
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
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000  // 30 segundos
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✅ Groq API response time: ${responseTime}ms`);
    console.log(`Tokens used: ${response.data.usage.total_tokens}`);

    const generatedText = response.data.choices[0].message.content;

    return {
      response: generatedText.trim(),
      model: model,
      tokensUsed: response.data.usage.total_tokens,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('Error calling Groq API:', error.message);

    // Manejo de errores específicos
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('API key de Groq inválida. Verifica GROQ_API_KEY en .env');
      }

      if (error.response.status === 429) {
        throw new Error('Límite de rate excedido. Groq tier gratuito: 6000 tokens/min');
      }
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'EAI_AGAIN') {
      throw new Error('No se pudo conectar a Groq API. Verifica conexión a internet.');
    }

    throw error;
  }
}

async function healthCheck() {
  try {
    await axios.get('https://api.groq.com', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('Groq health check failed:', error.message);
    return false;
  }
}

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
