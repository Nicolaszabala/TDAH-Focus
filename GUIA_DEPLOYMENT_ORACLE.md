# 🚀 Guía: Desplegar Modelo Hugging Face en Oracle Cloud

## 📋 ÍNDICE
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Requisitos Previos](#requisitos-previos)
3. [Opción 1: Text Generation Inference (TGI)](#opción-1-tgi-recomendado)
4. [Opción 2: vLLM (Alternativa Rápida)](#opción-2-vllm)
5. [Opción 3: Ollama (Más Simple)](#opción-3-ollama)
6. [Configuración de RAG para Libros](#configuración-de-rag)
7. [Actualización del Código](#actualización-del-código)
8. [Preguntas Frecuentes](#faq)

---

## 🎯 RESUMEN EJECUTIVO

### Tu Situación Actual
- **Modelo**: Llama 3.2 1B Instruct (via Hugging Face Router)
- **Límites**: 450 tokens salida, 500 chars entrada, 20 req/min
- **Problema**: Modelo muy pequeño, límites restrictivos, no puedes usar contexto extenso

### Lo Que Lograrás
- ✅ Modelo propio **sin límites de tokens**
- ✅ **RAG (Retrieval Augmented Generation)** con tus libros especializados
- ✅ Modelo más grande y poderoso (7B-13B parámetros)
- ✅ Control total sobre parámetros y prompts
- ✅ **Costos**: $0 (Oracle Cloud Free Tier)

### Recursos Necesarios de Oracle Cloud

| Componente | Modelo Recomendado | RAM Mínima | GPU/CPU | Disco |
|------------|-------------------|------------|---------|-------|
| **Pequeño** | Llama 3.2 3B | 8 GB | 4 vCPU | 100 GB |
| **Mediano** | Llama 3.1 8B | 16 GB | 8 vCPU | 150 GB |
| **Grande** | Mistral 7B v0.3 | 16 GB | 8 vCPU | 150 GB |

**Oracle Cloud Free Tier** incluye:
- 2 AMD VM.Standard.E2.1.Micro (1 GB RAM cada una) - **NO suficiente**
- 4 Arm-based Ampere A1 cores + 24 GB RAM - **✅ PERFECTO**

---

## 📦 REQUISITOS PREVIOS

### 1. Verifica tu Instancia Oracle Cloud

```bash
# SSH a tu instancia Oracle Cloud
ssh -i ~/.ssh/oracle_key opc@<TU_IP_ORACLE>

# Verifica recursos disponibles
free -h
nproc
df -h
```

**Necesitas**:
- ✅ Al menos 16 GB RAM (para modelo 7B-8B)
- ✅ Al menos 100 GB de disco
- ✅ 4+ vCPUs

### 2. Instala Docker (si no lo tienes)

```bash
# Actualiza sistema
sudo apt-get update
sudo apt-get upgrade -y

# Instala Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agrega usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verifica instalación
docker --version
```

### 3. Configura Firewall de Oracle Cloud

1. Ve a: **Networking → Virtual Cloud Networks → Tu VCN → Security Lists**
2. Agrega regla de entrada (Ingress):
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port**: `8080` (o el puerto que elijas)
   - **Description**: "LLM Inference Server"

3. En tu instancia, configura iptables:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

---

## 🔥 OPCIÓN 1: Text Generation Inference (TGI) - RECOMENDADO

**Ventajas**:
- ✅ Desarrollado por Hugging Face (oficial)
- ✅ Altamente optimizado para producción
- ✅ Soporte para streaming
- ✅ API compatible con OpenAI
- ✅ Quantización automática (reduce RAM)

**Desventajas**:
- ⚠️ Requiere más configuración inicial

### Paso 1: Elige tu Modelo

Recomendaciones según RAM disponible:

| RAM | Modelo Recomendado | Parámetros | Contexto |
|-----|-------------------|------------|----------|
| 8 GB | `meta-llama/Llama-3.2-3B-Instruct` | 3B | 128K tokens |
| 16 GB | `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K tokens |
| 16 GB | `mistralai/Mistral-7B-Instruct-v0.3` | 7B | 32K tokens |
| 24 GB | `meta-llama/Llama-3.1-8B-Instruct` (sin quant) | 8B | 128K tokens |

**Para TDAH (mejor rendimiento)**: `meta-llama/Llama-3.1-8B-Instruct`

### Paso 2: Descarga el Modelo (Opcional pero Recomendado)

```bash
# Crea directorio para modelos
mkdir -p ~/models
cd ~/models

# Instala Hugging Face CLI
pip install huggingface-hub[cli]

# Descarga el modelo (requiere token de HF)
huggingface-cli login
huggingface-cli download meta-llama/Llama-3.1-8B-Instruct --local-dir ./llama-3.1-8b

# Esto puede tomar 30-60 minutos dependiendo de tu conexión
```

### Paso 3: Lanza TGI con Docker

#### Opción A: Descarga automática (más simple)

```bash
docker run -d \
  --name tgi-llama \
  -p 8080:80 \
  --gpus all \  # Si tienes GPU, sino elimina esta línea
  -v /home/opc/models:/data \
  ghcr.io/huggingface-text-generation-inference/text-generation-inference:latest \
  --model-id meta-llama/Llama-3.1-8B-Instruct \
  --max-input-length 4096 \
  --max-total-tokens 8192 \
  --max-batch-prefill-tokens 8192 \
  --quantize bitsandbytes-nf4
```

#### Opción B: Modelo pre-descargado (más rápido)

```bash
docker run -d \
  --name tgi-llama \
  -p 8080:80 \
  -v /home/opc/models/llama-3.1-8b:/data \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id /data \
  --max-input-length 4096 \
  --max-total-tokens 8192 \
  --quantize bitsandbytes-nf4
```

### Paso 4: Verifica que Funciona

```bash
# Espera 2-3 minutos a que cargue el modelo
docker logs -f tgi-llama

# Deberías ver: "Connected" y "Ready"

# Prueba con curl
curl http://localhost:8080/generate \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{
    "inputs": "¿Qué es el TDAH?",
    "parameters": {
      "max_new_tokens": 500,
      "temperature": 0.7
    }
  }'
```

### Paso 5: Parámetros Importantes de TGI

```bash
# Para aumentar límites de tokens
--max-input-length 8192        # Máximo de tokens de entrada
--max-total-tokens 16384        # Input + Output total
--max-batch-prefill-tokens 8192 # Procesamiento en batch

# Para reducir uso de RAM (quantización)
--quantize bitsandbytes-nf4     # Reduce RAM en ~50%
--quantize bitsandbytes         # Reduce RAM en ~25%

# Sin quantizar (requiere más RAM pero mejor calidad)
# Simplemente omite --quantize
```

---

## ⚡ OPCIÓN 2: vLLM (Alternativa Más Rápida)

**Ventajas**:
- ✅ Más rápido que TGI (hasta 24x)
- ✅ API compatible con OpenAI
- ✅ Excelente throughput

**Desventajas**:
- ⚠️ Requiere configuración más avanzada
- ⚠️ Principalmente optimizado para GPU (funciona con CPU pero más lento)

### Instalación con Docker

```bash
docker run -d \
  --name vllm-llama \
  -p 8080:8000 \
  --ipc=host \
  -v /home/opc/models:/root/.cache/huggingface \
  vllm/vllm-openai:latest \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --max-model-len 8192 \
  --dtype auto \
  --api-key tu-clave-secreta-aqui
```

### Prueba vLLM

```bash
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-clave-secreta-aqui" \
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "messages": [
      {"role": "user", "content": "¿Qué es el TDAH?"}
    ],
    "max_tokens": 500
  }'
```

---

## 🎈 OPCIÓN 3: Ollama (Más Simple pero Limitado)

**Ventajas**:
- ✅ Instalación súper simple (1 comando)
- ✅ Gestión automática de modelos
- ✅ Buena documentación

**Desventajas**:
- ⚠️ No tiene API compatible con OpenAI nativamente
- ⚠️ Menos optimizado para producción
- ⚠️ Menor control sobre parámetros

### Instalación

```bash
# Instala Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Descarga un modelo
ollama pull llama3.1:8b

# O un modelo más grande
ollama pull llama3.1:70b  # Requiere 48+ GB RAM

# Corre el servidor
ollama serve
```

### Usa Ollama con API REST

```bash
# Genera respuesta
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "¿Qué es el TDAH?",
  "stream": false,
  "options": {
    "num_predict": 500
  }
}'

# Chat format
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "messages": [
    {"role": "user", "content": "¿Qué es el TDAH?"}
  ],
  "stream": false
}'
```

---

## 📚 CONFIGURACIÓN DE RAG (Retrieval Augmented Generation)

Para alimentar tu LLM con libros especializados de TDAH.

### Opción A: Chroma DB (Recomendado para Producción)

#### 1. Instala Chroma con Docker

```bash
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  -v /home/opc/chroma-data:/chroma/chroma \
  chromadb/chroma:latest
```

#### 2. Procesa tus Libros PDF/TXT

Crea un script Python para procesar libros:

```bash
# En tu máquina local o en Oracle Cloud
pip install chromadb sentence-transformers pypdf langchain
```

Crea `process_books.py`:

```python
import chromadb
from chromadb.config import Settings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, TextLoader
import os

# Conecta a ChromaDB
client = chromadb.HttpClient(host='localhost', port=8000)

# Crea colección
collection = client.get_or_create_collection(
    name="adhd_knowledge",
    metadata={"description": "ADHD specialized books and resources"}
)

# Text splitter para chunks
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

# Procesa PDFs
book_dir = "./books"  # Directorio con tus libros
for filename in os.listdir(book_dir):
    if filename.endswith(".pdf"):
        loader = PyPDFLoader(os.path.join(book_dir, filename))
        pages = loader.load_and_split(text_splitter=text_splitter)

        # Extrae texto y metadata
        texts = [page.page_content for page in pages]
        metadatas = [{"source": filename, "page": i} for i in range(len(pages))]
        ids = [f"{filename}_{i}" for i in range(len(pages))]

        # Añade a ChromaDB
        collection.add(
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )

        print(f"✅ Procesado: {filename} ({len(pages)} chunks)")

print(f"\n📊 Total documentos en base: {collection.count()}")
```

Ejecuta:

```bash
# Coloca tus libros PDF en ./books/
mkdir books
# Copia tus PDFs a ./books/

# Procesa
python process_books.py
```

#### 3. Crea Servicio de RAG

Crea `rag_service.py`:

```python
import chromadb
import requests

# Cliente ChromaDB
chroma_client = chromadb.HttpClient(host='localhost', port=8000)
collection = chroma_client.get_collection(name="adhd_knowledge")

# Cliente LLM (TGI/vLLM en Oracle Cloud)
LLM_API_URL = "http://<TU_IP_ORACLE>:8080/v1/chat/completions"

def search_knowledge(query, n_results=3):
    """Busca en la base de conocimiento"""
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results['documents'][0]  # Top 3 chunks

def generate_response(user_message, context_docs):
    """Genera respuesta con contexto de libros"""

    # Construye contexto desde documentos
    context = "\n\n".join([f"Fuente {i+1}:\n{doc}" for i, doc in enumerate(context_docs)])

    # Prompt enriquecido
    system_prompt = f"""Eres un asistente especializado en TDAH.
Usa el siguiente contexto de libros especializados para responder:

{context}

Responde la pregunta del usuario basándote en este contexto.
Si la información no está en el contexto, indica que no lo sabes con certeza."""

    # Llama a LLM
    response = requests.post(
        LLM_API_URL,
        json={
            "model": "meta-llama/Llama-3.1-8B-Instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 1000,  # SIN LÍMITES!
            "temperature": 0.7
        }
    )

    return response.json()['choices'][0]['message']['content']

# Ejemplo de uso
if __name__ == "__main__":
    query = "¿Cuáles son las mejores técnicas de organización para TDAH?"

    # 1. Busca en base de conocimiento
    docs = search_knowledge(query)

    # 2. Genera respuesta con contexto
    response = generate_response(query, docs)

    print(response)
```

### Opción B: Qdrant (Alternativa más rápida)

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -v /home/opc/qdrant-data:/qdrant/storage \
  qdrant/qdrant
```

Similar a Chroma pero con mejor rendimiento para búsquedas a gran escala.

---

## 🔧 ACTUALIZACIÓN DEL CÓDIGO

### 1. Actualiza `llmService.js`

Crea nuevo archivo `/home/user/TDAH-Focus/adhd-chatbot-backend/services/llmService-oracle.js`:

```javascript
const axios = require('axios');

// URL de tu servidor Oracle Cloud
const ORACLE_LLM_URL = process.env.ORACLE_LLM_URL || 'http://<TU_IP_ORACLE>:8080/v1/chat/completions';
const ORACLE_API_KEY = process.env.ORACLE_API_KEY || 'tu-clave-secreta';

// URL del servicio RAG (si lo implementaste)
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://<TU_IP_ORACLE>:5000/search';

async function searchKnowledge(query) {
  try {
    const response = await axios.post(RAG_SERVICE_URL, {
      query: query,
      n_results: 3
    }, { timeout: 5000 });

    return response.data.documents || [];
  } catch (error) {
    console.warn('RAG search failed, continuing without context:', error.message);
    return [];
  }
}

async function generateResponse(prompt, useRAG = true) {
  try {
    let systemPrompt = `Eres un asistente especializado en TDAH.
Responde en español de forma clara, empática y práctica.
Tus respuestas deben ser útiles para personas con TDAH.`;

    // Si RAG está habilitado, busca contexto
    if (useRAG) {
      const knowledgeDocs = await searchKnowledge(prompt);

      if (knowledgeDocs.length > 0) {
        const context = knowledgeDocs.map((doc, i) =>
          `Fuente ${i+1}: ${doc}`
        ).join('\n\n');

        systemPrompt += `\n\nContexto de libros especializados:\n${context}\n\nUsa este contexto para enriquecer tu respuesta.`;
      }
    }

    // Llama a tu LLM en Oracle Cloud
    const response = await axios.post(
      ORACLE_LLM_URL,
      {
        model: "meta-llama/Llama-3.1-8B-Instruct", // Ajusta según tu modelo
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,        // ¡SIN LÍMITES! (ajusta según necesites)
        temperature: 0.72,
        top_p: 0.92,
        frequency_penalty: 0.4,
        presence_penalty: 0.2,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ORACLE_API_KEY}`
        },
        timeout: 30000  // 30 segundos
      }
    );

    // Extrae respuesta
    const assistantMessage = response.data.choices[0].message.content;

    return {
      response: assistantMessage.trim(),
      model: 'oracle-llm',
      tokensUsed: response.data.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('Error calling Oracle LLM:', error.message);

    // Manejo de errores específicos
    if (error.code === 'ECONNREFUSED') {
      throw new Error('No se pudo conectar al servidor LLM en Oracle Cloud. Verifica que esté corriendo.');
    }

    if (error.response?.status === 401) {
      throw new Error('Error de autenticación con el servidor LLM. Verifica ORACLE_API_KEY.');
    }

    if (error.response?.status === 503) {
      throw new Error('El modelo está cargando. Intenta de nuevo en 30 segundos.');
    }

    throw error;
  }
}

// Función de health check
async function healthCheck() {
  try {
    const response = await axios.get(`${ORACLE_LLM_URL.replace('/v1/chat/completions', '')}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateResponse,
  searchKnowledge,
  healthCheck
};
```

### 2. Actualiza `.env`

```env
# Oracle Cloud LLM
ORACLE_LLM_URL=http://<TU_IP_ORACLE>:8080/v1/chat/completions
ORACLE_API_KEY=tu-clave-secreta-aqui

# RAG Service (opcional)
RAG_SERVICE_URL=http://<TU_IP_ORACLE>:5000/search
USE_RAG=true

# Fallback a Hugging Face si Oracle Cloud falla
HUGGING_FACE_API_KEY=TU_TOKEN_HF
ENABLE_FALLBACK=true
```

### 3. Actualiza `routes/chat.js`

```javascript
// Línea 6-10: Importa servicios
const llmServiceOracle = require('../services/llmService-oracle');
const llmServiceHF = require('../services/llmService'); // Fallback

// Línea 75-95: Modifica generateResponse
async function handleChatRequest(req, res) {
  const { message, context } = req.body;

  // ... validaciones ...

  try {
    // Intenta Oracle Cloud primero
    const useRAG = process.env.USE_RAG === 'true';
    const prompt = buildPrompt(message, context);

    const result = await llmServiceOracle.generateResponse(prompt, useRAG);

    return res.json({
      response: result.response,
      model: 'oracle-cloud',
      tokensUsed: result.tokensUsed,
      cached: false
    });

  } catch (error) {
    console.error('Oracle LLM failed:', error.message);

    // Fallback a Hugging Face si está habilitado
    if (process.env.ENABLE_FALLBACK === 'true') {
      console.log('Falling back to Hugging Face...');
      const hfResult = await llmServiceHF.generateResponse(prompt);
      return res.json({
        response: hfResult,
        model: 'huggingface-fallback',
        cached: false
      });
    }

    throw error;
  }
}
```

---

## 🧪 TESTING

### 1. Health Check

```bash
# Verifica que el servidor LLM esté corriendo
curl http://<TU_IP_ORACLE>:8080/health

# Debería retornar: {"status":"ok"} o similar
```

### 2. Prueba Directa del LLM

```bash
curl http://<TU_IP_ORACLE>:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-clave-secreta" \
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "messages": [
      {"role": "user", "content": "Explica el TDAH en 100 palabras"}
    ],
    "max_tokens": 200
  }'
```

### 3. Prueba RAG (si lo implementaste)

```bash
# Busca en base de conocimiento
python -c "
from rag_service import search_knowledge
results = search_knowledge('técnicas organización TDAH')
for i, doc in enumerate(results):
    print(f'\n--- Resultado {i+1} ---')
    print(doc[:200] + '...')
"
```

### 4. Prueba End-to-End

```bash
# Prueba tu backend actualizado
curl http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cómo puedo mejorar mi concentración con TDAH?",
    "context": {
      "hasPendingTasks": true
    }
  }'
```

---

## 📊 MONITOREO

### Docker Stats

```bash
# Monitorea uso de recursos
docker stats tgi-llama

# Ver logs
docker logs -f tgi-llama --tail 100
```

### Script de Monitoreo

Crea `monitor.sh`:

```bash
#!/bin/bash

echo "=== LLM Server Health Check ==="
echo ""

# Check container
echo "🐳 Container Status:"
docker ps | grep tgi-llama

echo ""
echo "💾 Memory Usage:"
free -h

echo ""
echo "🔥 CPU Usage:"
top -bn1 | grep "Cpu(s)"

echo ""
echo "📡 API Health:"
curl -s http://localhost:8080/health || echo "❌ API not responding"

echo ""
echo "📊 Request Stats (últimas 24h):"
# Implementa logging de requests en tu backend
# y muestra estadísticas aquí
```

---

## 🔒 SEGURIDAD

### 1. Configura HTTPS con Nginx

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Configura dominio (necesitas uno propio)
sudo certbot --nginx -d tu-dominio.com
```

### 2. Configura API Keys

```bash
# Genera clave segura
openssl rand -hex 32

# Añade a .env
ORACLE_API_KEY=<clave_generada>
```

### 3. Firewall Rules

```bash
# Solo permite acceso desde tu backend
sudo iptables -A INPUT -p tcp --dport 8080 -s <IP_TU_BACKEND> -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8080 -j DROP
```

---

## 💰 COSTOS ESTIMADOS

### Oracle Cloud Free Tier
- ✅ **Ampere A1** (4 OCPU + 24GB RAM): **GRATIS para siempre**
- ✅ 200 GB Block Storage: **GRATIS para siempre**
- ✅ Outbound Data Transfer: 10 TB/mes **GRATIS**

### Costos Adicionales (si excedes Free Tier)
- RAM adicional: ~$0.0015/GB/hora
- CPU adicional: ~$0.01/OCPU/hora
- Storage: ~$0.0255/GB/mes

**Estimación para modelo 8B con Free Tier**: **$0/mes** 🎉

---

## 🎓 RECURSOS ADICIONALES

### Modelos Especializados en Español

| Modelo | Parámetros | RAM | Especialidad |
|--------|-----------|-----|--------------|
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 16GB | Mejor general purpose |
| `microsoft/Phi-3-medium-4k-instruct` | 14B | 28GB | Razonamiento |
| `mistralai/Mixtral-8x7B-Instruct-v0.1` | 47B | 96GB | Experto multi-dominio |

### Embeddings para RAG

| Modelo | Dimensiones | Idioma | Uso RAM |
|--------|------------|---------|---------|
| `sentence-transformers/all-MiniLM-L6-v2` | 384 | EN | 1 GB |
| `hiiamsid/sentence_similarity_spanish_es` | 768 | ES | 2 GB |
| `BAAI/bge-m3` | 1024 | Multilingual | 3 GB |

### Libros y Papers Recomendados

1. **"Driven to Distraction"** - Edward M. Hallowell
2. **"Taking Charge of Adult ADHD"** - Russell A. Barkley
3. **"The ADHD Effect on Marriage"** - Melissa Orlov
4. **Papers científicos**: [PubMed ADHD Research](https://pubmed.ncbi.nlm.nih.gov/?term=adhd)

---

## ❓ FAQ

### ¿Puedo usar n8n para orquestar esto?

**Sí**, pero n8n sería más útil para:
- Automatizar procesamiento de nuevos libros
- Orquestar workflows de RAG complejos
- Integrar con otras herramientas (Notion, Google Docs, etc.)

No es necesario para el deployment básico del LLM.

### ¿Cuánto tiempo toma cargar el modelo?

- **Primera vez**: 30-60 min (descarga + carga)
- **Reinicios posteriores**: 2-5 min (solo carga)

### ¿Puedo cambiar de modelo fácilmente?

**Sí**, solo cambia:

```bash
docker stop tgi-llama
docker rm tgi-llama

# Lanza con nuevo modelo
docker run -d \
  --name tgi-llama \
  -p 8080:80 \
  ghcr.io/huggingface/text-generation-inference:latest \
  --model-id <NUEVO_MODELO> \
  --max-total-tokens 8192
```

### ¿Qué pasa si Oracle Cloud se cae?

Implementa el fallback a Hugging Face como se muestra en la sección de código. Tu app seguirá funcionando (con límites) usando el servicio cloud de HF.

### ¿Cómo escalo si tengo muchos usuarios?

1. **Horizontal**: Más instancias Oracle Cloud + Load Balancer
2. **Vertical**: Upgrade a instancia con más RAM/CPU
3. **Caché agresivo**: Aumenta `CACHE_TTL_SECONDS` a 7200 (2h)
4. **Batch processing**: Agrupa requests similares

---

## 📝 CHECKLIST DE DEPLOYMENT

- [ ] Verificar recursos Oracle Cloud (16+ GB RAM)
- [ ] Instalar Docker en instancia
- [ ] Configurar firewall (puerto 8080)
- [ ] Elegir modelo (Llama 3.1 8B recomendado)
- [ ] Lanzar TGI/vLLM con Docker
- [ ] Verificar health check del LLM
- [ ] Configurar ChromaDB para RAG
- [ ] Procesar libros especializados
- [ ] Crear servicio RAG (rag_service.py)
- [ ] Actualizar backend (llmService-oracle.js)
- [ ] Configurar variables de entorno
- [ ] Probar end-to-end
- [ ] Configurar monitoreo
- [ ] Implementar HTTPS (opcional)
- [ ] Configurar backup automático

---

## 🚀 SIGUIENTE PASO

¿Qué prefieres hacer primero?

**A)** Verificar recursos de tu instancia Oracle Cloud
**B)** Elegir modelo específico según tus necesidades
**C)** Implementar RAG con tus libros
**D)** Deployment básico sin RAG (más rápido)

Déjame saber y te guío paso a paso.
