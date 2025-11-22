#!/bin/bash

###############################################################################
# Script de Setup Automatizado: LLM en Oracle Cloud
# Uso: ./setup-oracle-llm.sh
###############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar si el script se está ejecutando en Oracle Cloud
check_environment() {
    print_header "1. Verificando Entorno"

    # Check sistema operativo
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "Sistema: Linux"
    else
        print_error "Este script está diseñado para Linux"
        exit 1
    fi

    # Check recursos
    TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
    TOTAL_CPU=$(nproc)
    TOTAL_DISK=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')

    print_info "RAM Total: ${TOTAL_RAM}GB"
    print_info "CPUs: ${TOTAL_CPU}"
    print_info "Disco Disponible: ${TOTAL_DISK}GB"

    # Verificar requisitos mínimos
    if [ "$TOTAL_RAM" -lt 8 ]; then
        print_error "Necesitas al menos 8GB de RAM. Tienes: ${TOTAL_RAM}GB"
        exit 1
    fi

    if [ "$TOTAL_DISK" -lt 50 ]; then
        print_error "Necesitas al menos 50GB de espacio. Tienes: ${TOTAL_DISK}GB"
        exit 1
    fi

    print_success "Recursos suficientes para deployment"
}

# Instalar Docker si no está instalado
install_docker() {
    print_header "2. Verificando Docker"

    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker ya instalado: $DOCKER_VERSION"
        return
    fi

    print_info "Instalando Docker..."

    # Actualizar sistema
    sudo apt-get update -qq

    # Instalar Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh

    # Agregar usuario actual al grupo docker
    sudo usermod -aG docker $USER

    print_success "Docker instalado correctamente"
    print_warning "Necesitas hacer logout/login para que el grupo docker surta efecto"
    print_warning "O ejecuta: newgrp docker"
}

# Seleccionar modelo
select_model() {
    print_header "3. Selección de Modelo"

    echo "Selecciona el modelo según tu RAM disponible:"
    echo ""
    echo "1) Llama 3.2 3B Instruct (8GB RAM mínimo)"
    echo "2) Llama 3.1 8B Instruct (16GB RAM recomendado) ⭐ RECOMENDADO"
    echo "3) Mistral 7B v0.3 (16GB RAM)"
    echo "4) Personalizado (ingresar manualmente)"
    echo ""

    read -p "Opción [1-4]: " MODEL_CHOICE

    case $MODEL_CHOICE in
        1)
            MODEL_ID="meta-llama/Llama-3.2-3B-Instruct"
            MAX_TOTAL_TOKENS=8192
            ;;
        2)
            MODEL_ID="meta-llama/Llama-3.1-8B-Instruct"
            MAX_TOTAL_TOKENS=16384
            ;;
        3)
            MODEL_ID="mistralai/Mistral-7B-Instruct-v0.3"
            MAX_TOTAL_TOKENS=8192
            ;;
        4)
            read -p "Ingresa el model ID de Hugging Face: " MODEL_ID
            read -p "Max total tokens [16384]: " MAX_TOTAL_TOKENS
            MAX_TOTAL_TOKENS=${MAX_TOTAL_TOKENS:-16384}
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac

    print_success "Modelo seleccionado: $MODEL_ID"
    print_info "Max tokens: $MAX_TOTAL_TOKENS"
}

# Configurar firewall
configure_firewall() {
    print_header "4. Configurando Firewall"

    # Puerto para el LLM
    LLM_PORT=${LLM_PORT:-8080}

    print_info "Configurando puerto $LLM_PORT..."

    # iptables
    if command -v iptables &> /dev/null; then
        sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport $LLM_PORT -j ACCEPT

        # Intenta hacer persistente
        if command -v netfilter-persistent &> /dev/null; then
            sudo netfilter-persistent save
        elif command -v iptables-save &> /dev/null; then
            sudo sh -c "iptables-save > /etc/iptables/rules.v4"
        fi

        print_success "Firewall configurado (puerto $LLM_PORT abierto)"
    else
        print_warning "iptables no encontrado, omitiendo configuración de firewall"
    fi

    print_warning "IMPORTANTE: Debes abrir el puerto $LLM_PORT en Oracle Cloud Console:"
    print_info "  1. Ve a: Networking → Virtual Cloud Networks → Tu VCN → Security Lists"
    print_info "  2. Agrega Ingress Rule:"
    print_info "     - Source CIDR: 0.0.0.0/0"
    print_info "     - IP Protocol: TCP"
    print_info "     - Destination Port: $LLM_PORT"
    echo ""
    read -p "Presiona Enter cuando hayas configurado el Security List..."
}

# Seleccionar servidor de inferencia
select_inference_server() {
    print_header "5. Selección de Servidor de Inferencia"

    echo "¿Qué servidor de inferencia quieres usar?"
    echo ""
    echo "1) Text Generation Inference (TGI) - Hugging Face oficial ⭐ RECOMENDADO"
    echo "2) vLLM - Más rápido pero experimental"
    echo "3) Ollama - Más simple pero menos control"
    echo ""

    read -p "Opción [1-3]: " SERVER_CHOICE

    case $SERVER_CHOICE in
        1)
            INFERENCE_SERVER="tgi"
            ;;
        2)
            INFERENCE_SERVER="vllm"
            ;;
        3)
            INFERENCE_SERVER="ollama"
            ;;
        *)
            print_error "Opción inválida"
            exit 1
            ;;
    esac

    print_success "Servidor seleccionado: $INFERENCE_SERVER"
}

# Lanzar TGI
launch_tgi() {
    print_header "6. Lanzando Text Generation Inference"

    CONTAINER_NAME="tgi-llama"
    LLM_PORT=${LLM_PORT:-8080}

    # Verificar si ya existe
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_warning "Container $CONTAINER_NAME ya existe. ¿Quieres eliminarlo y recrear?"
        read -p "[y/N]: " RECREATE
        if [[ $RECREATE =~ ^[Yy]$ ]]; then
            docker stop $CONTAINER_NAME 2>/dev/null || true
            docker rm $CONTAINER_NAME 2>/dev/null || true
        else
            print_info "Usando container existente"
            return
        fi
    fi

    # Crear directorio para modelos
    MODELS_DIR="$HOME/llm-models"
    mkdir -p $MODELS_DIR

    print_info "Lanzando TGI con $MODEL_ID..."
    print_warning "Primera ejecución: descarga del modelo (30-60 min). Sé paciente..."

    # Detectar si hay GPU
    HAS_GPU=false
    if command -v nvidia-smi &> /dev/null; then
        HAS_GPU=true
        print_info "GPU detectada, usando aceleración"
    fi

    # Construir comando docker
    DOCKER_CMD="docker run -d \
      --name $CONTAINER_NAME \
      -p $LLM_PORT:80 \
      -v $MODELS_DIR:/data"

    if [ "$HAS_GPU" = true ]; then
        DOCKER_CMD="$DOCKER_CMD --gpus all"
    fi

    DOCKER_CMD="$DOCKER_CMD \
      ghcr.io/huggingface/text-generation-inference:latest \
      --model-id $MODEL_ID \
      --max-input-length 4096 \
      --max-total-tokens $MAX_TOTAL_TOKENS \
      --max-batch-prefill-tokens 4096 \
      --quantize bitsandbytes-nf4"

    # Ejecutar
    eval $DOCKER_CMD

    print_success "Container $CONTAINER_NAME iniciado"
    print_info "Esperando a que el modelo cargue (esto puede tomar varios minutos)..."

    # Wait for health
    MAX_RETRIES=60
    RETRY_COUNT=0
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if docker logs $CONTAINER_NAME 2>&1 | grep -q "Connected"; then
            print_success "¡Modelo cargado y listo!"
            break
        fi

        if docker logs $CONTAINER_NAME 2>&1 | grep -qi "error"; then
            print_error "Error al cargar el modelo. Revisa los logs:"
            docker logs $CONTAINER_NAME --tail 50
            exit 1
        fi

        echo -n "."
        sleep 10
        RETRY_COUNT=$((RETRY_COUNT + 1))
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        print_error "Timeout esperando que el modelo cargue. Revisa los logs:"
        docker logs $CONTAINER_NAME --tail 50
        exit 1
    fi
}

# Lanzar vLLM
launch_vllm() {
    print_header "6. Lanzando vLLM"

    CONTAINER_NAME="vllm-server"
    LLM_PORT=${LLM_PORT:-8080}

    # Generar API key
    API_KEY=$(openssl rand -hex 16)

    # Crear directorio para modelos
    MODELS_DIR="$HOME/.cache/huggingface"
    mkdir -p $MODELS_DIR

    print_info "Lanzando vLLM con $MODEL_ID..."

    docker run -d \
      --name $CONTAINER_NAME \
      -p $LLM_PORT:8000 \
      --ipc=host \
      -v $MODELS_DIR:/root/.cache/huggingface \
      vllm/vllm-openai:latest \
      --model $MODEL_ID \
      --max-model-len 8192 \
      --dtype auto \
      --api-key $API_KEY

    print_success "vLLM iniciado"
    print_warning "Tu API Key es: $API_KEY"
    print_info "Guárdala en lugar seguro"

    echo "$API_KEY" > $HOME/vllm-api-key.txt
    chmod 600 $HOME/vllm-api-key.txt
    print_info "API Key guardada en: $HOME/vllm-api-key.txt"
}

# Lanzar Ollama
launch_ollama() {
    print_header "6. Lanzando Ollama"

    print_info "Instalando Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh

    print_success "Ollama instalado"

    # Mapear modelo a formato Ollama
    OLLAMA_MODEL=""
    case $MODEL_ID in
        *"Llama-3.1-8B"*)
            OLLAMA_MODEL="llama3.1:8b"
            ;;
        *"Llama-3.2-3B"*)
            OLLAMA_MODEL="llama3.2:3b"
            ;;
        *"Mistral-7B"*)
            OLLAMA_MODEL="mistral:7b"
            ;;
        *)
            print_error "Modelo no compatible con Ollama. Usa TGI o vLLM."
            exit 1
            ;;
    esac

    print_info "Descargando modelo $OLLAMA_MODEL (esto puede tomar tiempo)..."
    ollama pull $OLLAMA_MODEL

    print_success "Modelo descargado"
    print_info "Ollama corre en puerto 11434"

    # Iniciar servicio
    sudo systemctl start ollama 2>/dev/null || ollama serve &

    print_success "Ollama listo"
}

# Testing
test_llm() {
    print_header "7. Probando LLM"

    LLM_PORT=${LLM_PORT:-8080}

    if [ "$INFERENCE_SERVER" = "ollama" ]; then
        TEST_URL="http://localhost:11434/api/generate"
        TEST_PAYLOAD='{"model":"'$OLLAMA_MODEL'","prompt":"Di hola en una palabra","stream":false}'
    else
        TEST_URL="http://localhost:$LLM_PORT/generate"
        TEST_PAYLOAD='{"inputs":"Di hola en una palabra","parameters":{"max_new_tokens":10}}'
    fi

    print_info "Enviando request de prueba a $TEST_URL..."

    RESPONSE=$(curl -s -X POST "$TEST_URL" \
      -H "Content-Type: application/json" \
      -d "$TEST_PAYLOAD" \
      --connect-timeout 10 \
      --max-time 30)

    if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
        print_success "¡LLM respondió correctamente!"
        print_info "Respuesta: $RESPONSE"
    else
        print_error "Error al probar el LLM"
        print_info "Response: $RESPONSE"
    fi
}

# Generar configuración para backend
generate_env_config() {
    print_header "8. Generando Configuración para Backend"

    # Obtener IP pública
    PUBLIC_IP=$(curl -s ifconfig.me)
    LLM_PORT=${LLM_PORT:-8080}

    CONFIG_FILE="$HOME/oracle-llm.env"

    cat > $CONFIG_FILE <<EOF
# Oracle Cloud LLM Configuration
# Generado: $(date)

# URL del LLM (usa esta en tu backend)
ORACLE_LLM_URL=http://$PUBLIC_IP:$LLM_PORT/v1/chat/completions

# API Key (solo para vLLM)
$([ "$INFERENCE_SERVER" = "vllm" ] && echo "ORACLE_API_KEY=$(cat $HOME/vllm-api-key.txt)" || echo "# ORACLE_API_KEY=no-requerido")

# Modelo
MODEL_ID=$MODEL_ID

# Configuración
MAX_TOTAL_TOKENS=$MAX_TOTAL_TOKENS
INFERENCE_SERVER=$INFERENCE_SERVER

# Instrucciones de uso:
# 1. Copia estas variables a tu archivo .env del backend
# 2. Actualiza llmService.js para usar ORACLE_LLM_URL
# 3. Reinicia tu backend
EOF

    print_success "Configuración guardada en: $CONFIG_FILE"
    echo ""
    cat $CONFIG_FILE
    echo ""
}

# Crear script de monitoreo
create_monitoring_script() {
    print_header "9. Creando Script de Monitoreo"

    MONITOR_SCRIPT="$HOME/monitor-llm.sh"

    cat > $MONITOR_SCRIPT <<'EOF'
#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== 🔍 Monitor LLM en Oracle Cloud ==="
echo ""

# Container status
echo -e "${YELLOW}🐳 Container Status:${NC}"
docker ps --filter "name=tgi-llama" --filter "name=vllm-server" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${YELLOW}💾 Uso de Memoria:${NC}"
free -h

echo ""
echo -e "${YELLOW}🔥 CPU Load:${NC}"
uptime

echo ""
echo -e "${YELLOW}💿 Disco:${NC}"
df -h / | awk 'NR==2 {print "Usado: " $3 " / " $2 " (" $5 ")"}'

echo ""
echo -e "${YELLOW}📊 Container Stats:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5

echo ""
echo -e "${YELLOW}🌐 API Health Check:${NC}"
if curl -s http://localhost:8080/health &>/dev/null; then
    echo -e "${GREEN}✅ API respondiendo correctamente${NC}"
else
    echo -e "${RED}❌ API no responde${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Últimos logs (10 líneas):${NC}"
docker logs --tail 10 tgi-llama 2>/dev/null || docker logs --tail 10 vllm-server 2>/dev/null || echo "No logs disponibles"
EOF

    chmod +x $MONITOR_SCRIPT

    print_success "Script de monitoreo creado: $MONITOR_SCRIPT"
    print_info "Ejecuta: $MONITOR_SCRIPT"
}

# Instrucciones finales
final_instructions() {
    print_header "✅ DEPLOYMENT COMPLETADO"

    PUBLIC_IP=$(curl -s ifconfig.me)
    LLM_PORT=${LLM_PORT:-8080}

    echo -e "${GREEN}🎉 ¡Tu LLM está corriendo en Oracle Cloud!${NC}"
    echo ""
    echo "📍 Detalles del Deployment:"
    echo "   - Modelo: $MODEL_ID"
    echo "   - URL: http://$PUBLIC_IP:$LLM_PORT"
    echo "   - Max Tokens: $MAX_TOTAL_TOKENS"
    echo "   - Servidor: $INFERENCE_SERVER"
    echo ""
    echo "📝 Próximos Pasos:"
    echo ""
    echo "1️⃣  Copia la configuración a tu backend:"
    echo "   cat $HOME/oracle-llm.env"
    echo ""
    echo "2️⃣  Actualiza tu backend para usar el nuevo LLM:"
    echo "   - Edita: adhd-chatbot-backend/services/llmService.js"
    echo "   - Cambia HF_API_URL por ORACLE_LLM_URL"
    echo ""
    echo "3️⃣  Monitorea el servidor:"
    echo "   $HOME/monitor-llm.sh"
    echo ""
    echo "4️⃣  Ver logs en tiempo real:"
    echo "   docker logs -f tgi-llama"
    echo ""
    echo "5️⃣  Para implementar RAG (Retrieval Augmented Generation):"
    echo "   - Lee: GUIA_DEPLOYMENT_ORACLE.md (Sección RAG)"
    echo "   - Instala ChromaDB"
    echo "   - Procesa tus libros especializados"
    echo ""
    print_warning "IMPORTANTE: Asegúrate de abrir el puerto $LLM_PORT en Oracle Cloud Console (Security List)"
    echo ""
    echo -e "${BLUE}📚 Documentación completa: GUIA_DEPLOYMENT_ORACLE.md${NC}"
    echo ""
}

###############################################################################
# MAIN
###############################################################################

main() {
    echo -e "${BLUE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   🚀 Oracle Cloud LLM Deployment Script      ║
    ║   Para TDAH Focus App                        ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
EOF
    echo -e "${NC}"

    # Default port
    LLM_PORT=8080

    # Ejecutar pasos
    check_environment
    install_docker
    select_model
    configure_firewall
    select_inference_server

    case $INFERENCE_SERVER in
        tgi)
            launch_tgi
            ;;
        vllm)
            launch_vllm
            ;;
        ollama)
            launch_ollama
            ;;
    esac

    sleep 5  # Esperar a que se estabilice

    test_llm
    generate_env_config
    create_monitoring_script
    final_instructions

    print_success "Setup completado exitosamente"
}

# Ejecutar
main
