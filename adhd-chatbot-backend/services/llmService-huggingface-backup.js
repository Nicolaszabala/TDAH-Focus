const axios = require('axios');

// Hugging Face configuration - Using new Router API (Nov 2024+)
const HF_API_URL = 'https://router.huggingface.co/v1/chat/completions';
const HF_MODEL = 'meta-llama/Llama-3.2-1B-Instruct'; // Chat-compatible model
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY; // API key desde variable de entorno (ver .env.example)

/**
 * Generate response using Hugging Face Inference API
 * @param {string} prompt - Formatted prompt with context
 * @returns {Promise<string>} - Generated response text
 */
async function generateResponse(prompt) {
  try {
    console.log('📤 Calling Hugging Face API...');

    const response = await axios.post(
      HF_API_URL,
      {
        model: HF_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente especializado en TDAH adulto. Respondes SIEMPRE en español con empatía y consejos prácticos basados en evidencia. NO repitas información técnica literal, sino que la usas para dar respuestas naturales y útiles.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 450,        // Aumentado para respuestas completas con listas
        temperature: 0.72,      // Ligeramente más creativo para respuestas naturales
        top_p: 0.92,            // Balance entre coherencia y variedad
        frequency_penalty: 0.4, // Evita repetición de frases
        presence_penalty: 0.2,  // Mantiene coherencia temática
        stop: ['\n\n\n\n', '###', 'Usuario:', 'User:', '---', '<|'], // Stop tokens más específicos
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }
    );

    console.log('✅ Response received from Hugging Face');

    // Chat completions API format: { choices: [{ message: { content: "..." } }] }
    const generatedText = response.data?.choices?.[0]?.message?.content;

    if (!generatedText || generatedText.trim().length === 0) {
      throw new Error('Empty response from model');
    }

    return cleanResponse(generatedText);

  } catch (error) {
    console.error('❌ LLM API Error:', error.message);

    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (status === 503) {
        // Model is loading (cold start)
        console.log('⏳ Model is loading, estimated wait: ~20 seconds');
        return 'El asistente está iniciando (puede tomar hasta 30 segundos). Por favor, intenta de nuevo en un momento.';
      }

      if (status === 429) {
        // Rate limit exceeded
        console.log('⚠️  Rate limit exceeded');
        return 'He recibido muchas consultas. Por favor, espera un momento antes de intentar de nuevo.';
      }

      if (status === 401 || status === 403) {
        // Authentication error
        console.error('🔒 Authentication error - check HUGGING_FACE_API_KEY');
        throw new Error('API authentication failed');
      }

      if (status === 410) {
        // Gone - API endpoint deprecated
        console.error('🚫 API endpoint deprecated - update HF_API_URL');
        throw new Error('API endpoint no longer supported');
      }

      console.error('API Response Error:', {
        status,
        data: JSON.stringify(data).substring(0, 200),
      });
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'La consulta está tomando más tiempo del esperado. Por favor, intenta con una pregunta más corta.';
    }

    // Generic error - will trigger fallback in route handler
    throw new Error('Failed to generate response from LLM');
  }
}

/**
 * Clean and format the generated response
 * @param {string} text - Raw generated text
 * @returns {string} - Cleaned text
 */
function cleanResponse(text) {
  let cleaned = text.trim();

  // Remove metadata/artifacts that LLM might include
  cleaned = cleaned.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive newlines
  cleaned = cleaned.replace(/^\s*[-•]\s*/gm, '• '); // Normalize bullet points

  // Remove common LLM artifacts - EXPANDED
  cleaned = cleaned.replace(/\[.*?\]/g, ''); // Remove [tags]
  cleaned = cleaned.replace(/<\|.*?\|>/g, ''); // Remove <|special tokens|>
  cleaned = cleaned.replace(/\{.*?\}/g, ''); // Remove JSON-like {metadata}

  // Remove metadata phrases that LLM includes
  cleaned = cleaned.replace(/^(Assistant|AI|Response|Respuesta|Mi sugerencia|Sugerencia):\s*/gi, ''); // Remove prefixes
  cleaned = cleaned.replace(/^(¡Claro!?\s*)?Aquí te dejo (la )?respuesta( al usuario)?:?\s*/gi, ''); // Remove "Aquí te dejo la respuesta"
  cleaned = cleaned.replace(/^(¡Claro!?\s*)?A continuación,? (te )?(dejo|presento|muestro):?\s*/gi, ''); // Remove "A continuación te dejo"
  cleaned = cleaned.replace(/^(¡Por supuesto!?\s*)?Te (explico|cuento|digo|ayudo):?\s*/gi, ''); // Remove "Te explico:"
  cleaned = cleaned.replace(/^¡Claro!?\s+/gi, ''); // Remove standalone "¡Claro!" at start
  cleaned = cleaned.replace(/^¡Por supuesto!?\s+/gi, ''); // Remove standalone "¡Por supuesto!" at start
  cleaned = cleaned.replace(/^¡Eso es f[áa]cil!?\s+/gi, ''); // Remove "¡Eso es fácil!" at start

  // Remove markdown headers (more aggressive)
  cleaned = cleaned.replace(/^\*\*.*?\*\*:\s*/gm, ''); // **Headers**: at line start
  cleaned = cleaned.replace(/^\*\*.*?\*\*/gm, ''); // **Headers** without colon
  cleaned = cleaned.replace(/^##.*$/gm, ''); // ## Markdown headers
  cleaned = cleaned.replace(/^#.*$/gm, ''); // # Markdown headers

  // Remove incomplete markdown at the end
  cleaned = cleaned.replace(/\*\*[^*]*$/g, ''); // Incomplete ** at end
  cleaned = cleaned.replace(/\*[^*\n]*$/g, ''); // Incomplete * at end

  // Remove incomplete sentences at the end (cut-off detection)
  const sentences = cleaned.split(/([.!?]\s+)/);
  let completeSentences = [];

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    // If it's a sentence ending or whitespace, include it
    if (part.match(/^[.!?]\s+$/)) {
      completeSentences.push(part);
    } else if (part.trim()) {
      // Check if this is the last part and it doesn't end properly
      if (i === sentences.length - 1 && !part.match(/[.!?]$/)) {
        // Check if it's a very short fragment (likely cut-off)
        if (part.trim().split(/\s+/).length < 3) {
          // Skip short incomplete fragments
          break;
        } else {
          // Complete the sentence
          completeSentences.push(part.trim() + '.');
        }
      } else {
        completeSentences.push(part);
      }
    }
  }

  cleaned = completeSentences.join('').trim();

  // Remove multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Ensure it ends with punctuation
  if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
    cleaned += '.';
  }

  // Final max length check (with smart truncation)
  const maxLength = 550;
  if (cleaned.length > maxLength) {
    // Find last complete sentence within limit
    const truncated = cleaned.substring(0, maxLength);
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    if (lastSentenceEnd > maxLength * 0.6) {
      // Good sentence boundary found
      cleaned = cleaned.substring(0, lastSentenceEnd + 1);
    } else {
      // No good boundary, truncate at last complete word
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > maxLength * 0.5) {
        cleaned = cleaned.substring(0, lastSpace).trim() + '...';
      } else {
        // Last resort: just truncate
        cleaned = truncated.trim() + '...';
      }
    }
  }

  // Final cleanup: remove empty lines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');

  return cleaned;
}

/**
 * Test the connection to Hugging Face API
 * @returns {Promise<boolean>} - True if connection successful
 */
async function testConnection() {
  try {
    const testPrompt = 'Responde con "ok" si recibes esto.';
    const response = await generateResponse(testPrompt);
    console.log('✅ Hugging Face API connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Hugging Face API connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  generateResponse,
  testConnection,
};
