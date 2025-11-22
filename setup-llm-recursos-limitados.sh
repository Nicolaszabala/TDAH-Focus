#!/bin/bash

###############################################################################
# Script de Setup: LLM Local con Recursos Limitados
# Para servidores con 5-6GB RAM y 1 vCPU
###############################################################################

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

###############################################################################
# 1. Verificar recursos
###############################################################################
print_header "1. Verificando Recursos del Sistema"

TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
AVAILABLE_RAM=$(free -g | awk '/^Mem:/{print $7}')
TOTAL_CPU=$(nproc)

print_info "RAM Total: ${TOTAL_RAM}GB"
print_info "RAM Disponible: ${AVAILABLE_RAM}GB"
print_info "CPUs: ${TOTAL_CPU}"

if [ "$TOTAL_RAM" -lt 5 ]; then
    print_error "Necesitas al menos 5GB de RAM. Tienes: ${TOTAL_RAM}GB"
    print_warning "Recomendación: Usa Groq API (gratis, no usa RAM local)"
    print_info "Ve: SETUP_GROQ_RAPIDO.md"
    exit 1
fi

if [ "$TOTAL_CPU" -lt 1 ]; then
    print_error "Necesitas al menos 1 CPU"
    exit 1
fi

print_warning "ADVERTENCIA: Con ${TOTAL_CPU} CPU, las respuestas serán LENTAS (10-30 segundos)"
print_info "Alternativa recomendada: Groq API (respuestas en <1 segundo, gratis)"
echo ""
read -p "¿Continuar de todas formas? [y/N]: " CONTINUE

if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
    print_info "Cancelado. Considera usar Groq API (ve SETUP_GROQ_RAPIDO.md)"
    exit 0
fi

###############################################################################
# 2. Instalar Ollama
###############################################################################
print_header "2. Instalando Ollama"

if command -v ollama &> /dev/null; then
    OLLAMA_VERSION=$(ollama --version 2>&1 | head -n1)
    print_success "Ollama ya instalado: $OLLAMA_VERSION"
else
    print_info "Descargando e instalando Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    print_success "Ollama instalado"
fi

# Iniciar servicio
print_info "Iniciando servicio Ollama..."
sudo systemctl start ollama 2>/dev/null || ollama serve &
sleep 3

print_success "Ollama corriendo"

###############################################################################
# 3. Seleccionar modelo según RAM
###############################################################################
print_header "3. Selección de Modelo"

echo "Modelos recomendados para ${TOTAL_RAM}GB RAM y ${TOTAL_CPU} CPU:"
echo ""
echo "1) Phi-3-Mini (3.8GB RAM, ~15-25 seg/respuesta) ⭐ RECOMENDADO"
echo "   - Calidad: Excelente"
echo "   - Contexto: 128K tokens"
echo "   - Creador: Microsoft"
echo ""
echo "2) Qwen2.5 1.5B (1.5GB RAM, ~8-15 seg/respuesta)"
echo "   - Calidad: Buena"
echo "   - Contexto: 32K tokens"
echo "   - Más rápido pero menos potente"
echo ""
echo "3) TinyLlama 1.1B (637MB RAM, ~5-10 seg/respuesta)"
echo "   - Calidad: Básica"
echo "   - Contexto: 2K tokens"
echo "   - El más rápido pero limitado"
echo ""
echo "4) Ninguno - Usar Groq API en su lugar (RECOMENDADO)"
echo "   - 0GB RAM, <1 seg/respuesta, modelo 8B"
echo ""

read -p "Selecciona opción [1-4]: " MODEL_CHOICE

case $MODEL_CHOICE in
    1)
        MODEL_NAME="phi3:mini"
        MODEL_SIZE="3.8GB"
        ;;
    2)
        MODEL_NAME="qwen2.5:1.5b"
        MODEL_SIZE="1.5GB"
        ;;
    3)
        MODEL_NAME="tinyllama"
        MODEL_SIZE="637MB"
        ;;
    4)
        print_info "Excelente elección. Ve a SETUP_GROQ_RAPIDO.md para instrucciones"
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

###############################################################################
# 4. Descargar modelo
###############################################################################
print_header "4. Descargando Modelo: $MODEL_NAME"

print_info "Tamaño aproximado: $MODEL_SIZE"
print_warning "Esto puede tomar 10-30 minutos según tu conexión..."

ollama pull $MODEL_NAME

print_success "Modelo descargado: $MODEL_NAME"

###############################################################################
# 5. Probar modelo
###############################################################################
print_header "5. Probando Modelo"

print_info "Enviando prompt de prueba..."

TEST_RESPONSE=$(ollama run $MODEL_NAME "Di hola en una frase" 2>&1 | head -n5)

if [ $? -eq 0 ]; then
    print_success "¡Modelo funcionando!"
    echo ""
    echo "Respuesta de prueba:"
    echo "-------------------"
    echo "$TEST_RESPONSE"
    echo "-------------------"
else
    print_error "Error al probar modelo"
    exit 1
fi

###############################################################################
# 6. Benchmark rápido
###############################################################################
print_header "6. Benchmark de Velocidad"

print_info "Midiendo velocidad de respuesta..."
START_TIME=$(date +%s)

ollama run $MODEL_NAME "¿Qué es el TDAH? Responde en 50 palabras" > /tmp/ollama_test.txt

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

print_info "Tiempo de respuesta: ${DURATION} segundos"

if [ $DURATION -lt 10 ]; then
    print_success "Velocidad: Rápida"
elif [ $DURATION -lt 20 ]; then
    print_warning "Velocidad: Media (aceptable)"
else
    print_warning "Velocidad: Lenta"
    print_info "Considera usar Groq API para respuestas instantáneas"
fi

###############################################################################
# 7. Configurar API REST
###############################################################################
print_header "7. Configurando API REST"

print_info "Ollama expone API REST en puerto 11434"

# Test API
API_TEST=$(curl -s http://localhost:11434/api/version)

if [ $? -eq 0 ]; then
    print_success "API REST funcionando en http://localhost:11434"
else
    print_error "API REST no responde"
    exit 1
fi

###############################################################################
# 8. Generar configuración para backend
###############################################################################
print_header "8. Generando Configuración"

CONFIG_FILE="$HOME/ollama-config.txt"

cat > $CONFIG_FILE <<EOF
# ============================================
# Configuración Ollama para TDAH Focus App
# ============================================

Modelo: $MODEL_NAME
API Endpoint: http://localhost:11434/api/generate
Formato: Ollama API (NO compatible con OpenAI)

# ============================================
# Ejemplo de uso en Node.js:
# ============================================

const axios = require('axios');

async function generateResponse(prompt) {
  const response = await axios.post('http://localhost:11434/api/generate', {
    model: '$MODEL_NAME',
    prompt: prompt,
    stream: false,
    options: {
      num_predict: 500,    // Max tokens
      temperature: 0.7,
      top_p: 0.9
    }
  });

  return response.data.response;
}

# ============================================
# Para integración con tu backend:
# ============================================

1. Crea archivo: adhd-chatbot-backend/services/llmService-ollama.js
2. Copia el código de ejemplo arriba
3. En routes/chat.js, cambia:
   const llmService = require('./services/llmService-ollama');

# ============================================
# Comandos útiles:
# ============================================

# Ver modelos instalados
ollama list

# Eliminar modelo
ollama rm $MODEL_NAME

# Ver logs
journalctl -u ollama -f

# Reiniciar servicio
sudo systemctl restart ollama

# ============================================
# Notas importantes:
# ============================================

⚠️  Velocidad esperada: ${DURATION} segundos/respuesta
⚠️  RAM en uso: ~$MODEL_SIZE
⚠️  CPU: ${TOTAL_CPU} core(s) - LIMITANTE

💡 Para mejor rendimiento:
   - Usa Groq API (respuestas en <1 seg, gratis)
   - O upgrade a instancia con más CPUs

EOF

print_success "Configuración guardada en: $CONFIG_FILE"
echo ""
cat $CONFIG_FILE

###############################################################################
# 9. Crear servicio de integración
###############################################################################
print_header "9. Creando Servicio de Integración"

BACKEND_DIR="$HOME/TDAH-Focus/adhd-chatbot-backend"

if [ ! -d "$BACKEND_DIR" ]; then
    print_warning "Backend no encontrado en $BACKEND_DIR"
    print_info "Puedes copiar manualmente el código del archivo de configuración"
else
    OLLAMA_SERVICE="$BACKEND_DIR/services/llmService-ollama.js"

    cat > $OLLAMA_SERVICE <<'SERVICEFILE'
/**
 * LLM Service usando Ollama local
 *
 * ADVERTENCIA: Con 1 CPU, las respuestas serán LENTAS (10-30 segundos)
 * Considera usar Groq API en su lugar para mejor experiencia
 */

const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'MODEL_PLACEHOLDER';

async function generateResponse(prompt, options = {}) {
  try {
    const {
      maxTokens = 500,
      temperature = 0.72,
      topP = 0.92
    } = options;

    console.log(`Calling Ollama (${OLLAMA_MODEL})...`);
    const startTime = Date.now();

    const response = await axios.post(OLLAMA_API_URL, {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        num_predict: maxTokens,
        temperature: temperature,
        top_p: topP,
        stop: ['\n\n\n\n', '###', 'Usuario:', 'User:']
      }
    }, {
      timeout: 60000  // 60 segundos (respuestas lentas con 1 CPU)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`✅ Ollama response time: ${responseTime}ms`);

    return {
      response: response.data.response.trim(),
      model: OLLAMA_MODEL,
      responseTime: responseTime
    };

  } catch (error) {
    console.error('Error calling Ollama:', error.message);

    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar a Ollama. ¿Está corriendo? (sudo systemctl start ollama)');
    }

    if (error.code === 'ETIMEDOUT') {
      throw new Error('Timeout llamando a Ollama. El modelo puede estar demasiado lento para 1 CPU.');
    }

    throw error;
  }
}

async function healthCheck() {
  try {
    const response = await axios.get('http://localhost:11434/api/version', {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateResponse,
  healthCheck
};
SERVICEFILE

    # Reemplazar placeholder con modelo real
    sed -i "s/MODEL_PLACEHOLDER/$MODEL_NAME/g" $OLLAMA_SERVICE

    print_success "Servicio creado: $OLLAMA_SERVICE"

    # Actualizar .env
    ENV_FILE="$BACKEND_DIR/.env"
    if [ -f "$ENV_FILE" ]; then
        if ! grep -q "OLLAMA_MODEL" "$ENV_FILE"; then
            echo "" >> "$ENV_FILE"
            echo "# Ollama Configuration" >> "$ENV_FILE"
            echo "OLLAMA_API_URL=http://localhost:11434/api/generate" >> "$ENV_FILE"
            echo "OLLAMA_MODEL=$MODEL_NAME" >> "$ENV_FILE"
            print_success ".env actualizado"
        fi
    fi
fi

###############################################################################
# 10. Instrucciones finales
###############################################################################
print_header "✅ Setup Completado"

echo -e "${GREEN}🎉 Ollama instalado y configurado con éxito${NC}"
echo ""
echo "📍 Configuración:"
echo "   - Modelo: $MODEL_NAME"
echo "   - RAM en uso: ~$MODEL_SIZE"
echo "   - API: http://localhost:11434"
echo "   - Velocidad: ~${DURATION} seg/respuesta"
echo ""
echo "📝 Próximos Pasos:"
echo ""
echo "1️⃣  Prueba el modelo manualmente:"
echo "   ollama run $MODEL_NAME \"¿Qué es el TDAH?\""
echo ""
echo "2️⃣  Integra con tu backend:"
echo "   - Edita: adhd-chatbot-backend/routes/chat.js"
echo "   - Cambia: const llmService = require('./services/llmService-ollama');"
echo ""
echo "3️⃣  Reinicia tu backend:"
echo "   cd adhd-chatbot-backend"
echo "   npm start"
echo ""
echo "4️⃣  Prueba el endpoint:"
echo "   curl http://localhost:3000/api/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Hola, ¿qué es el TDAH?\"}'"
echo ""
print_warning "IMPORTANTE: Con ${TOTAL_CPU} CPU, las respuestas serán LENTAS"
echo ""
echo "💡 Alternativa más rápida (GRATIS):"
echo "   - Groq API: Respuestas en <1 segundo"
echo "   - Modelo 8B (vs tu actual ${MODEL_NAME})"
echo "   - Sin usar recursos locales"
echo "   - Ve: SETUP_GROQ_RAPIDO.md"
echo ""
echo "📚 Documentación:"
echo "   - Configuración: $CONFIG_FILE"
echo "   - Ollama docs: https://ollama.ai/docs"
echo ""
echo "🔧 Comandos útiles:"
echo "   ollama list                    # Ver modelos instalados"
echo "   ollama ps                      # Ver modelos en ejecución"
echo "   sudo systemctl status ollama   # Estado del servicio"
echo ""
print_success "Setup completado exitosamente"

###############################################################################
# Fin del script
###############################################################################
