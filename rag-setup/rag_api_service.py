#!/usr/bin/env python3
"""
Servicio API REST para RAG (Retrieval Augmented Generation)
Consume ChromaDB y tu LLM en Oracle Cloud para responder con contexto

Uso:
    python rag_api_service.py --llm-url http://TU_IP:8080 --port 5000

Endpoints:
    POST /search         - Busca en base de conocimiento
    POST /generate       - Genera respuesta con RAG
    GET  /health         - Health check
    GET  /stats          - Estadísticas
"""

import os
import argparse
import sys
from typing import List, Dict, Optional

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
except ImportError:
    print("❌ Flask no instalado. Ejecuta: pip install flask flask-cors")
    sys.exit(1)

try:
    import chromadb
except ImportError:
    print("❌ ChromaDB no instalado. Ejecuta: pip install chromadb")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("❌ Requests no instalado. Ejecuta: pip install requests")
    sys.exit(1)


app = Flask(__name__)
CORS(app)  # Permitir CORS para requests desde backend Node.js

# Configuración global
config = {
    'chroma_host': 'localhost',
    'chroma_port': 8000,
    'llm_url': 'http://localhost:8080/v1/chat/completions',
    'llm_api_key': None,
    'model_id': 'meta-llama/Llama-3.1-8B-Instruct'
}

# Cliente ChromaDB global
chroma_client = None
collection = None


def init_chromadb():
    """Inicializa conexión a ChromaDB"""
    global chroma_client, collection

    try:
        chroma_client = chromadb.HttpClient(
            host=config['chroma_host'],
            port=config['chroma_port']
        )

        # Test connection
        chroma_client.heartbeat()

        # Obtener colección
        collection = chroma_client.get_or_create_collection(
            name="adhd_knowledge",
            metadata={
                "description": "ADHD specialized books and resources",
                "language": "es"
            }
        )

        print(f"✅ Conectado a ChromaDB")
        print(f"   📊 Documentos: {collection.count()}")

    except Exception as e:
        print(f"❌ Error conectando a ChromaDB: {e}")
        print("\n💡 Verifica que ChromaDB esté corriendo:")
        print("   docker ps | grep chromadb")
        sys.exit(1)


def search_knowledge(query: str, n_results: int = 3) -> List[Dict]:
    """
    Busca en la base de conocimiento

    Args:
        query: Consulta de búsqueda
        n_results: Número de resultados

    Returns:
        Lista de documentos relevantes
    """
    if collection is None:
        raise RuntimeError("ChromaDB no inicializado")

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )

        documents = []
        for doc, metadata, distance in zip(
            results['documents'][0],
            results['metadatas'][0],
            results['distances'][0]
        ):
            documents.append({
                'text': doc,
                'metadata': metadata,
                'relevance': 1 - distance  # Convertir distancia a score de relevancia
            })

        return documents

    except Exception as e:
        print(f"Error en búsqueda: {e}")
        return []


def generate_with_llm(
    user_message: str,
    context_docs: List[Dict],
    max_tokens: int = 1000,
    temperature: float = 0.7
) -> Dict:
    """
    Genera respuesta usando LLM con contexto de RAG

    Args:
        user_message: Mensaje del usuario
        context_docs: Documentos de contexto desde RAG
        max_tokens: Máximo de tokens de salida
        temperature: Temperatura del modelo

    Returns:
        Dict con respuesta y metadata
    """
    # Construir contexto desde documentos
    if context_docs:
        context = "\n\n".join([
            f"Fuente {i+1} ({doc['metadata'].get('source', 'N/A')}, "
            f"página {doc['metadata'].get('page', doc['metadata'].get('chunk', 'N/A'))}):\n{doc['text']}"
            for i, doc in enumerate(context_docs)
        ])

        system_prompt = f"""Eres un asistente especializado en TDAH (Trastorno por Déficit de Atención e Hiperactividad).

Usa el siguiente contexto de libros especializados para responder la pregunta del usuario:

{context}

INSTRUCCIONES:
- Responde en español
- Basa tu respuesta en el contexto proporcionado
- Si la información del contexto no es suficiente, complementa con tu conocimiento general sobre TDAH
- Sé empático, práctico y claro
- Usa listas cuando sea apropiado
- Si mencionas información del contexto, puedes citar la fuente brevemente

Responde la siguiente pregunta del usuario:"""
    else:
        system_prompt = """Eres un asistente especializado en TDAH (Trastorno por Déficit de Atención e Hiperactividad).

Responde en español de forma clara, empática y práctica.
Si no tienes información específica, sé honesto al respecto."""

    # Preparar request al LLM
    headers = {
        'Content-Type': 'application/json'
    }

    if config['llm_api_key']:
        headers['Authorization'] = f"Bearer {config['llm_api_key']}"

    payload = {
        "model": config['model_id'],
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
        "top_p": 0.92,
        "frequency_penalty": 0.4,
        "presence_penalty": 0.2
    }

    try:
        response = requests.post(
            config['llm_url'],
            json=payload,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        return {
            'response': data['choices'][0]['message']['content'],
            'model': config['model_id'],
            'tokens_used': data.get('usage', {}).get('total_tokens', 0),
            'sources_used': len(context_docs)
        }

    except requests.exceptions.RequestException as e:
        print(f"Error llamando al LLM: {e}")
        raise


# === ENDPOINTS ===

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    try:
        # Verificar ChromaDB
        chroma_client.heartbeat()
        chroma_ok = True
        doc_count = collection.count()
    except:
        chroma_ok = False
        doc_count = 0

    # Verificar LLM
    try:
        llm_health_url = config['llm_url'].replace('/v1/chat/completions', '/health')
        llm_response = requests.get(llm_health_url, timeout=5)
        llm_ok = llm_response.status_code == 200
    except:
        llm_ok = False

    status = 'healthy' if (chroma_ok and llm_ok) else 'degraded'

    return jsonify({
        'status': status,
        'chromadb': {
            'connected': chroma_ok,
            'documents': doc_count
        },
        'llm': {
            'connected': llm_ok,
            'url': config['llm_url']
        }
    }), 200 if status == 'healthy' else 503


@app.route('/stats', methods=['GET'])
def stats():
    """Estadísticas de la base de conocimiento"""
    try:
        count = collection.count()

        # Obtener muestra de metadatas
        if count > 0:
            sample = collection.get(limit=min(100, count))
            sources = set(m['source'] for m in sample['metadatas'])
        else:
            sources = set()

        return jsonify({
            'total_documents': count,
            'unique_sources': len(sources),
            'sources': sorted(sources)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/search', methods=['POST'])
def search():
    """
    Busca en la base de conocimiento

    Body:
        {
            "query": "string",
            "n_results": 3  # opcional
        }

    Response:
        {
            "documents": [
                {
                    "text": "...",
                    "metadata": {...},
                    "relevance": 0.95
                }
            ],
            "count": 3
        }
    """
    try:
        data = request.get_json()

        if not data or 'query' not in data:
            return jsonify({'error': 'Missing required field: query'}), 400

        query = data['query']
        n_results = data.get('n_results', 3)

        # Validaciones
        if not isinstance(query, str) or len(query.strip()) == 0:
            return jsonify({'error': 'Query must be a non-empty string'}), 400

        if not isinstance(n_results, int) or n_results < 1 or n_results > 10:
            return jsonify({'error': 'n_results must be between 1 and 10'}), 400

        # Buscar
        documents = search_knowledge(query, n_results)

        return jsonify({
            'documents': documents,
            'count': len(documents)
        })

    except Exception as e:
        print(f"Error en /search: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/generate', methods=['POST'])
def generate():
    """
    Genera respuesta con RAG

    Body:
        {
            "message": "string",
            "use_rag": true,          # opcional, default true
            "n_results": 3,           # opcional, default 3
            "max_tokens": 1000,       # opcional, default 1000
            "temperature": 0.7        # opcional, default 0.7
        }

    Response:
        {
            "response": "...",
            "model": "meta-llama/Llama-3.1-8B-Instruct",
            "tokens_used": 450,
            "sources_used": 3,
            "sources": [...]  # si use_rag=true
        }
    """
    try:
        data = request.get_json()

        if not data or 'message' not in data:
            return jsonify({'error': 'Missing required field: message'}), 400

        message = data['message']
        use_rag = data.get('use_rag', True)
        n_results = data.get('n_results', 3)
        max_tokens = data.get('max_tokens', 1000)
        temperature = data.get('temperature', 0.7)

        # Validaciones
        if not isinstance(message, str) or len(message.strip()) == 0:
            return jsonify({'error': 'Message must be a non-empty string'}), 400

        # Buscar contexto si RAG está habilitado
        context_docs = []
        if use_rag and collection.count() > 0:
            context_docs = search_knowledge(message, n_results)

        # Generar respuesta
        result = generate_with_llm(
            user_message=message,
            context_docs=context_docs,
            max_tokens=max_tokens,
            temperature=temperature
        )

        # Añadir fuentes si se usó RAG
        if context_docs:
            result['sources'] = [
                {
                    'source': doc['metadata'].get('source'),
                    'page': doc['metadata'].get('page', doc['metadata'].get('chunk')),
                    'relevance': doc['relevance']
                }
                for doc in context_docs
            ]

        return jsonify(result)

    except Exception as e:
        print(f"Error en /generate: {e}")
        return jsonify({'error': str(e)}), 500


def main():
    parser = argparse.ArgumentParser(
        description="Servicio API REST para RAG con ChromaDB y LLM",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        '--chroma-host',
        type=str,
        default='localhost',
        help='Host de ChromaDB (default: localhost)'
    )

    parser.add_argument(
        '--chroma-port',
        type=int,
        default=8000,
        help='Puerto de ChromaDB (default: 8000)'
    )

    parser.add_argument(
        '--llm-url',
        type=str,
        required=True,
        help='URL del LLM (ej: http://IP:8080/v1/chat/completions)'
    )

    parser.add_argument(
        '--llm-api-key',
        type=str,
        help='API Key del LLM (si es necesario)'
    )

    parser.add_argument(
        '--model-id',
        type=str,
        default='meta-llama/Llama-3.1-8B-Instruct',
        help='ID del modelo (default: meta-llama/Llama-3.1-8B-Instruct)'
    )

    parser.add_argument(
        '--port',
        type=int,
        default=5000,
        help='Puerto del servicio API (default: 5000)'
    )

    parser.add_argument(
        '--host',
        type=str,
        default='0.0.0.0',
        help='Host del servicio API (default: 0.0.0.0)'
    )

    args = parser.parse_args()

    # Actualizar configuración
    config['chroma_host'] = args.chroma_host
    config['chroma_port'] = args.chroma_port
    config['llm_url'] = args.llm_url
    config['llm_api_key'] = args.llm_api_key
    config['model_id'] = args.model_id

    print("\n🚀 RAG API Service para TDAH Focus App")
    print("=" * 60)
    print(f"ChromaDB: {config['chroma_host']}:{config['chroma_port']}")
    print(f"LLM: {config['llm_url']}")
    print(f"Modelo: {config['model_id']}")
    print(f"Puerto API: {args.port}")
    print("=" * 60)

    # Inicializar ChromaDB
    init_chromadb()

    # Iniciar servidor
    print(f"\n✅ Servicio listo en http://{args.host}:{args.port}")
    print("\nEndpoints disponibles:")
    print(f"  GET  http://{args.host}:{args.port}/health")
    print(f"  GET  http://{args.host}:{args.port}/stats")
    print(f"  POST http://{args.host}:{args.port}/search")
    print(f"  POST http://{args.host}:{args.port}/generate")
    print("\nPresiona Ctrl+C para detener\n")

    app.run(
        host=args.host,
        port=args.port,
        debug=False
    )


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Servicio detenido")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
