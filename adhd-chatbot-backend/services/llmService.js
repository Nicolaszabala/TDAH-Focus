/**
 * LLM Service usando Groq SDK (oficial) - Versión simplificada
 */

const Groq = require('groq-sdk');

// Inicializar cliente Groq con configuración explícita
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false,
  timeout: 30000,
  maxRetries: 2
});

async function generateResponse(prompt, options = {}) {
  try {
    const {
      maxTokens = 1500,
      temperature = 0.72,
      topP = 0.92
    } = options;

    console.log('Calling Groq API...');
    const startTime = Date.now();

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente especializado en TDAH. Respondes en español de forma clara, empática y práctica.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✅ Groq API response time: ${responseTime}ms`);

    const generatedText = response.choices[0].message.content;

    return {
      response: generatedText.trim(),
      model: 'llama-3.1-8b-instant',
      tokensUsed: response.usage?.total_tokens || 0,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('❌ Error calling Groq API:', error.message);

    if (error.status === 401) {
      throw new Error('API key de Groq inválida');
    }

    if (error.status === 429) {
      throw new Error('Límite de rate excedido');
    }

    throw new Error('No se pudo conectar a Groq API: ' + error.message);
  }
}

async function healthCheck() {
  try {
    // Intentar una llamada mínima
    await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateResponse,
  healthCheck
};
