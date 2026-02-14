# ✅ Setup de Groq en TU Servidor Oracle Cloud

## 🚨 IMPORTANTE
Este documento es para que implementes Groq en **tu servidor real** `ubuntu@vnic-n8n`.

El ambiente actual de demostración tiene problemas de red con Node.js, pero tu servidor real no debería tenerlos.

---

## 📋 Pasos Completos

### Paso 1: Conéctate a tu Servidor

```bash
# En tu computadora local
ssh ubuntu@vnic-n8n
```

###Paso 2: Ve al Directorio del Backend

```bash
cd ~/TDAH-Focus/adhd-chatbot-backend
# O donde tengas el backend
```

### Paso 3: Instala groq-sdk

```bash
npm install groq-sdk
```

### Paso 4: Configura tu API Key

```bash
# Si no tienes .env, créalo desde .env.example
cp .env.example .env

# Edita .env
nano .env

# Agrega al final (reemplaza con TU clave):
GROQ_API_KEY=gsk_TU_CLAVE_AQUI

# Guarda: Ctrl+X, Y, Enter
```

### Paso 5: Crea el Servicio de Groq

Crea `services/llmService-groq.js`:

```javascript
/**
 * LLM Service usando Groq SDK
 */

const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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

    console.log('📞 Calling Groq API...');
    const startTime = Date.now();

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
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

    console.log(`✅ Groq responded in ${responseTime}ms`);
    console.log(`📊 Tokens used: ${response.usage?.total_tokens || 0}`);

    const generatedText = response.choices[0].message.content;

    return {
      response: generatedText.trim(),
      model: 'llama-3.1-8b-instant',
      tokensUsed: response.usage?.total_tokens || 0,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('❌ Groq API error:', error.message);

    if (error.status === 401 || error.status === 403) {
      throw new Error('API key de Groq inválida. Verifica GROQ_API_KEY en .env');
    }

    if (error.status === 429) {
      throw new Error('Límite de rate excedido. Groq tier gratuito: 6000 tokens/min');
    }

    throw new Error('No se pudo conectar a Groq API: ' + error.message);
  }
}

async function healthCheck() {
  try {
    await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'test' }],
      max_tokens: 5
    });
    return true;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
}

module.exports = {
  generateResponse,
  healthCheck
};
```

### Paso 6: Haz Backup del Servicio Actual

```bash
# Backup de Hugging Face
cp services/llmService.js services/llmService-huggingface-backup.js
```

### Paso 7: Reemplaza el Servicio

```bash
# Reemplaza con Groq
cp services/llmService-groq.js services/llmService.js
```

### Paso 8: Reinicia el Servidor

#### Si usas PM2:
```bash
pm2 restart all
pm2 logs
```

#### Si usas npm directamente:
```bash
# Detén el servidor actual
pkill -f "node server.js"

# Inicia de nuevo
npm start
```

#### Si usas nohup:
```bash
# Detén el servidor
pkill -f "node server.js"

# Inicia en background
nohup npm start > ~/backend.log 2>&1 &

# Ve los logs
tail -f ~/backend.log
```

### Paso 9: Prueba la Integración

```bash
# Test simple
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, ¿qué es el TDAH?"}' | jq '.'

# Deberías ver una respuesta en ~1 segundo
```

### Paso 10: Verifica desde tu App

En tu app React Native, haz una pregunta al chatbot y verifica:
- ✅ Respuesta más rápida (<2 segundos vs 3-5 antes)
- ✅ Respuestas más largas y detalladas
- ✅ Mejor calidad de respuestas

---

## 🔧 Troubleshooting

### Error: "API key de Groq inválida"

```bash
# Verifica que la clave esté en .env
grep GROQ_API_KEY .env

# Debe mostrar:
# GROQ_API_KEY=gsk_TU_CLAVE_AQUI
```

### Error: "Cannot find module 'groq-sdk'"

```bash
# Instala el paquete
npm install groq-sdk

# Verifica instalación
npm list groq-sdk
```

### Error: "Connection error" o "EAI_AGAIN"

Esto es un problema de DNS. Soluciones:

```bash
# Opción 1: Configura DNS de Google
sudo nano /etc/resolv.conf

# Agrega estas líneas al inicio:
nameserver 8.8.8.8
nameserver 8.8.4.4

# Guarda y reinicia el servidor

# Opción 2: Verifica que puedas acceder a Groq
curl -I https://api.groq.com

# Debería retornar: HTTP/1.1 200 OK
```

### Server no inicia

```bash
# Ver logs detallados
npm start

# O si está en background:
tail -100 ~/backend.log

# Busca errores de sintaxis o módulos faltantes
```

### Respuestas lentas

Si las respuestas tardan >5 segundos:

```bash
# 1. Verifica conexión a internet
ping -c 3 8.8.8.8

# 2. Prueba Groq directamente (reemplaza con tu clave)
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer gsk_TU_CLAVE_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }' | jq '.'

# Debería responder en <1 segundo
```

---

## 🎯 Verificación Final

### ✅ Checklist

- [ ] groq-sdk instalado (`npm list groq-sdk`)
- [ ] GROQ_API_KEY en .env
- [ ] llmService.js reemplazado
- [ ] Servidor reiniciado
- [ ] Prueba con curl exitosa
- [ ] Prueba desde app móvil exitosa
- [ ] Respuestas en <2 segundos
- [ ] Logs muestran "✅ Groq responded in XXms"

### 📊 Comparación Antes/Después

| Métrica | Antes (HF) | Después (Groq) |
|---------|------------|----------------|
| Velocidad | 2-5 seg | <1 seg |
| Max tokens salida | 450 | 1500 |
| Modelo | Llama 1B | Llama 8B |
| Calidad | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE: Regenera tu API Key

Como compartiste tu clave en este chat, es recomendable regenerarla:

1. Ve a: https://console.groq.com/keys
2. Click en los 3 puntos al lado de tu clave actual
3. Click "Revoke"
4. Click "Create API Key"
5. Copia la nueva clave
6. Actualiza tu `.env` con la nueva clave
7. Reinicia el servidor

### Protege tu .env

```bash
# Verifica que .env NO esté en git
cat .gitignore | grep .env

# Debería mostrar .env en la lista
```

---

## 💡 Próximos Pasos

Una vez que Groq funcione:

1. **Monitorea uso**: https://console.groq.com/dashboard
2. **Si excedes tier gratuito**: Upgrade a tier de pago (~$0.20/mes)
3. **Si quieres RAG**: Implementa sistema de libros especializados (ve `rag-setup/`)

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa logs**: `tail -100 ~/backend.log`
2. **Prueba curl**: Verifica que Groq responda directamente
3. **Verifica .env**: Asegúrate que la clave esté correcta
4. **Reinicia servidor**: A veces resolver problemas temporales

---

## 🎉 ¡Listo!

Si todo funcionó:
- ✅ App 5x más rápida
- ✅ Respuestas 3x más largas
- ✅ Modelo 8x más potente
- ✅ **Costo: $0/mes** (para uso normal)

Disfruta tu nuevo chatbot mejorado! 🚀
