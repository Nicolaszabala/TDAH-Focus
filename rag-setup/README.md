# 📚 RAG Setup - TDAH Focus App

Scripts para configurar RAG (Retrieval Augmented Generation) con libros especializados en TDAH.

## 🎯 ¿Qué es esto?

Estos scripts te permiten:
1. **Procesar libros** especializados en TDAH (PDF/TXT)
2. **Crear base de conocimiento** vectorial con ChromaDB
3. **Servicio API** para consultar y generar respuestas enriquecidas

## 📋 Requisitos Previos

### 1. ChromaDB

```bash
# Lanza ChromaDB con Docker
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  -v ~/chroma-data:/chroma/chroma \
  chromadb/chroma:latest

# Verifica que esté corriendo
curl http://localhost:8000/api/v1/heartbeat
```

### 2. Python 3.8+

```bash
python --version  # Debe ser 3.8 o superior
```

### 3. Dependencias

```bash
# Instala todas las dependencias
pip install -r requirements.txt
```

## 🚀 Uso Rápido

### Paso 1: Prepara tus Libros

```bash
# Crea directorio para libros
mkdir books

# Coloca tus PDFs/TXT sobre TDAH en books/
cp ~/Downloads/libro-tdah-1.pdf books/
cp ~/Downloads/libro-tdah-2.pdf books/
```

### Paso 2: Procesa los Libros

```bash
# Procesa todos los libros
python process_adhd_books.py --books-dir ./books

# Conectar a ChromaDB remoto
python process_adhd_books.py \
  --books-dir ./books \
  --chroma-host 192.168.1.100 \
  --chroma-port 8000
```

### Paso 3: Inicia el Servicio RAG

```bash
# Asumiendo que tu LLM está en Oracle Cloud
python rag_api_service.py \
  --llm-url http://TU_IP_ORACLE:8080/v1/chat/completions \
  --port 5000

# Si tu LLM requiere API key (vLLM)
python rag_api_service.py \
  --llm-url http://TU_IP_ORACLE:8080/v1/chat/completions \
  --llm-api-key tu-clave-secreta \
  --port 5000
```

### Paso 4: Prueba el Servicio

```bash
# Health check
curl http://localhost:5000/health

# Búsqueda en base de conocimiento
curl -X POST http://localhost:5000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "técnicas de organización para TDAH", "n_results": 3}'

# Genera respuesta con RAG
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Cómo puedo mejorar mi concentración?",
    "use_rag": true,
    "max_tokens": 500
  }'
```

## 📖 Comandos Detallados

### process_adhd_books.py

```bash
# Ver estadísticas
python process_adhd_books.py --stats

# Probar búsqueda
python process_adhd_books.py --test-search "concentración TDAH"

# Limpiar base de datos (¡cuidado!)
python process_adhd_books.py --clear

# Ayuda
python process_adhd_books.py --help
```

### rag_api_service.py

```bash
# Servicio básico
python rag_api_service.py --llm-url http://IP:8080/v1/chat/completions

# Con todas las opciones
python rag_api_service.py \
  --llm-url http://IP:8080/v1/chat/completions \
  --llm-api-key mi-clave \
  --model-id meta-llama/Llama-3.1-8B-Instruct \
  --chroma-host localhost \
  --chroma-port 8000 \
  --port 5000 \
  --host 0.0.0.0

# Ayuda
python rag_api_service.py --help
```

## 🔌 Integración con Backend Node.js

### Opción 1: Llamada Directa desde llmService.js

```javascript
// adhd-chatbot-backend/services/llmService.js

const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:5000';

async function generateResponse(prompt, useRAG = true) {
  try {
    const response = await axios.post(`${RAG_SERVICE_URL}/generate`, {
      message: prompt,
      use_rag: useRAG,
      max_tokens: 1000,
      temperature: 0.7
    });

    return response.data.response;
  } catch (error) {
    console.error('RAG service error:', error.message);
    // Fallback a LLM directo sin RAG
    return generateDirectLLM(prompt);
  }
}
```

### Opción 2: Solo Búsqueda, Generación en Node.js

```javascript
// Busca contexto con RAG
async function searchKnowledge(query) {
  const response = await axios.post(`${RAG_SERVICE_URL}/search`, {
    query: query,
    n_results: 3
  });

  return response.data.documents;
}

// Genera con tu LLM Oracle Cloud
async function generateWithContext(userMessage) {
  const context = await searchKnowledge(userMessage);

  const enrichedPrompt = buildPromptWithContext(userMessage, context);

  return callOracleLLM(enrichedPrompt);
}
```

## 📊 API Endpoints

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "chromadb": {
    "connected": true,
    "documents": 250
  },
  "llm": {
    "connected": true,
    "url": "http://..."
  }
}
```

### GET /stats

**Response:**
```json
{
  "total_documents": 250,
  "unique_sources": 5,
  "sources": [
    "libro-tdah-1.pdf",
    "libro-tdah-2.pdf"
  ]
}
```

### POST /search

**Request:**
```json
{
  "query": "técnicas de organización",
  "n_results": 3
}
```

**Response:**
```json
{
  "documents": [
    {
      "text": "Las técnicas de organización para personas con TDAH...",
      "metadata": {
        "source": "libro-tdah-1.pdf",
        "page": 45
      },
      "relevance": 0.92
    }
  ],
  "count": 3
}
```

### POST /generate

**Request:**
```json
{
  "message": "¿Cómo mejorar la concentración?",
  "use_rag": true,
  "n_results": 3,
  "max_tokens": 500,
  "temperature": 0.7
}
```

**Response:**
```json
{
  "response": "Para mejorar la concentración con TDAH, según los libros especializados...",
  "model": "meta-llama/Llama-3.1-8B-Instruct",
  "tokens_used": 320,
  "sources_used": 3,
  "sources": [
    {
      "source": "libro-tdah-1.pdf",
      "page": 45,
      "relevance": 0.92
    }
  ]
}
```

## 🐛 Troubleshooting

### ChromaDB no responde

```bash
# Verifica que esté corriendo
docker ps | grep chromadb

# Ve los logs
docker logs chromadb

# Reinicia
docker restart chromadb
```

### Error al procesar PDFs

```bash
# Verifica que pypdf esté instalado
pip install pypdf --upgrade

# Si el PDF está corrupto, conviértelo primero
# Usa herramientas online o:
pdftk input.pdf output output.pdf
```

### LLM no responde

```bash
# Verifica que esté accesible
curl http://TU_IP:8080/health

# Verifica firewall
ping TU_IP
telnet TU_IP 8080
```

## 📚 Libros Recomendados

Busca estos libros en formato PDF/TXT:

1. **"Driven to Distraction"** - Edward M. Hallowell
2. **"Taking Charge of Adult ADHD"** - Russell A. Barkley
3. **"The ADHD Effect on Marriage"** - Melissa Orlov
4. **"Smart but Scattered"** - Peg Dawson & Richard Guare
5. **Papers científicos**: Descarga de PubMed, arXiv, etc.

## 🔒 Seguridad

### Producción

```bash
# NO expongas el servicio RAG públicamente
# Solo permite acceso desde tu backend

# Firewall
sudo ufw allow from IP_BACKEND to any port 5000
sudo ufw deny 5000

# O usa túnel SSH
ssh -L 5000:localhost:5000 user@oracle-cloud
```

### API Key

```bash
# Genera clave segura
openssl rand -hex 32

# Agrega autenticación básica al servicio RAG
# (modificar rag_api_service.py)
```

## 💰 Costos

- **ChromaDB**: Gratis (self-hosted)
- **Procesamiento libros**: Una vez (gratis)
- **Embeddings**: sentence-transformers local (gratis)
- **Llamadas LLM**: Según tu servidor Oracle Cloud (puede ser gratis con Free Tier)

**Total estimado**: $0/mes con Oracle Cloud Free Tier

## 🎓 Recursos

- [ChromaDB Docs](https://docs.trychroma.com/)
- [LangChain Docs](https://python.langchain.com/docs/get_started/introduction)
- [Sentence Transformers](https://www.sbert.net/)
- [Guía completa](../GUIA_DEPLOYMENT_ORACLE.md)

## 📝 Notas

- Los embeddings se generan automáticamente por ChromaDB
- Modelo de embeddings por defecto: `all-MiniLM-L6-v2`
- Para español: considera `hiiamsid/sentence_similarity_spanish_es`
- Chunk size: 1000 caracteres (configurable en `process_adhd_books.py`)
- Overlap: 200 caracteres (evita perder contexto)

## 🆘 Soporte

¿Problemas? Revisa:
1. Logs de ChromaDB: `docker logs chromadb`
2. Logs del servicio RAG: salida de consola
3. Guía completa: `GUIA_DEPLOYMENT_ORACLE.md`
4. Abre un issue en el repo
