#!/usr/bin/env python3
"""
Script para procesar libros especializados de TDAH y crear base de conocimiento
con ChromaDB para Retrieval Augmented Generation (RAG).

Uso:
    python process_adhd_books.py --books-dir ./books --chroma-host localhost
"""

import os
import argparse
import sys
from pathlib import Path
from typing import List, Dict, Tuple

try:
    import chromadb
    from chromadb.config import Settings
except ImportError:
    print("❌ ChromaDB no instalado. Ejecuta: pip install chromadb")
    sys.exit(1)

try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.document_loaders import PyPDFLoader, TextLoader
except ImportError:
    print("❌ LangChain no instalado. Ejecuta: pip install langchain pypdf")
    sys.exit(1)


class ADHDBookProcessor:
    """Procesador de libros especializados en TDAH"""

    def __init__(self, chroma_host: str = "localhost", chroma_port: int = 8000):
        """
        Inicializa el procesador

        Args:
            chroma_host: Host de ChromaDB
            chroma_port: Puerto de ChromaDB
        """
        print(f"🔗 Conectando a ChromaDB en {chroma_host}:{chroma_port}...")

        try:
            self.client = chromadb.HttpClient(host=chroma_host, port=chroma_port)
            # Test connection
            self.client.heartbeat()
            print("✅ Conexión exitosa a ChromaDB")
        except Exception as e:
            print(f"❌ Error conectando a ChromaDB: {e}")
            print("\n💡 ¿ChromaDB está corriendo? Ejecuta:")
            print("   docker run -d --name chromadb -p 8000:8000 chromadb/chroma")
            sys.exit(1)

        # Crear o obtener colección
        self.collection = self.client.get_or_create_collection(
            name="adhd_knowledge",
            metadata={
                "description": "ADHD specialized books and resources",
                "language": "es"
            }
        )

        # Text splitter para dividir documentos en chunks
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,        # Tamaño óptimo para embeddings
            chunk_overlap=200,      # Overlap para mantener contexto
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        print(f"📚 Colección: adhd_knowledge")
        print(f"📊 Documentos existentes: {self.collection.count()}")

    def load_pdf(self, file_path: str) -> List[Dict]:
        """
        Carga un archivo PDF

        Args:
            file_path: Ruta al archivo PDF

        Returns:
            Lista de documentos con texto y metadata
        """
        try:
            loader = PyPDFLoader(file_path)
            pages = loader.load_and_split(text_splitter=self.text_splitter)

            documents = []
            for i, page in enumerate(pages):
                documents.append({
                    'text': page.page_content,
                    'metadata': {
                        'source': os.path.basename(file_path),
                        'page': i + 1,
                        'type': 'pdf'
                    }
                })

            return documents

        except Exception as e:
            print(f"⚠️  Error procesando {file_path}: {e}")
            return []

    def load_txt(self, file_path: str) -> List[Dict]:
        """
        Carga un archivo TXT

        Args:
            file_path: Ruta al archivo TXT

        Returns:
            Lista de documentos con texto y metadata
        """
        try:
            loader = TextLoader(file_path, encoding='utf-8')
            docs = loader.load()

            # Split en chunks
            chunks = self.text_splitter.split_documents(docs)

            documents = []
            for i, chunk in enumerate(chunks):
                documents.append({
                    'text': chunk.page_content,
                    'metadata': {
                        'source': os.path.basename(file_path),
                        'chunk': i + 1,
                        'type': 'txt'
                    }
                })

            return documents

        except Exception as e:
            print(f"⚠️  Error procesando {file_path}: {e}")
            return []

    def process_file(self, file_path: str) -> int:
        """
        Procesa un archivo (PDF o TXT)

        Args:
            file_path: Ruta al archivo

        Returns:
            Número de chunks procesados
        """
        file_ext = Path(file_path).suffix.lower()

        if file_ext == '.pdf':
            documents = self.load_pdf(file_path)
        elif file_ext == '.txt':
            documents = self.load_txt(file_path)
        else:
            print(f"⚠️  Formato no soportado: {file_ext} (solo .pdf y .txt)")
            return 0

        if not documents:
            return 0

        # Preparar datos para ChromaDB
        texts = [doc['text'] for doc in documents]
        metadatas = [doc['metadata'] for doc in documents]
        ids = [
            f"{doc['metadata']['source']}_{doc['metadata'].get('page', doc['metadata'].get('chunk', 0))}"
            for doc in documents
        ]

        # Añadir a ChromaDB
        try:
            self.collection.add(
                documents=texts,
                metadatas=metadatas,
                ids=ids
            )
            return len(documents)
        except Exception as e:
            print(f"❌ Error añadiendo documentos a ChromaDB: {e}")
            return 0

    def process_directory(self, books_dir: str) -> Tuple[int, int]:
        """
        Procesa todos los libros en un directorio

        Args:
            books_dir: Directorio con libros

        Returns:
            Tuple (archivos_procesados, chunks_totales)
        """
        books_path = Path(books_dir)

        if not books_path.exists():
            print(f"❌ Directorio no existe: {books_dir}")
            return 0, 0

        # Buscar archivos PDF y TXT
        files = list(books_path.glob("*.pdf")) + list(books_path.glob("*.txt"))

        if not files:
            print(f"⚠️  No se encontraron archivos PDF o TXT en: {books_dir}")
            return 0, 0

        print(f"\n📖 Archivos encontrados: {len(files)}")
        print("─" * 60)

        files_processed = 0
        total_chunks = 0

        for file_path in files:
            print(f"\n📄 Procesando: {file_path.name}")

            chunks = self.process_file(str(file_path))

            if chunks > 0:
                files_processed += 1
                total_chunks += chunks
                print(f"   ✅ {chunks} chunks procesados")
            else:
                print(f"   ❌ Error procesando archivo")

        return files_processed, total_chunks

    def search_test(self, query: str, n_results: int = 3) -> None:
        """
        Prueba de búsqueda en la base de conocimiento

        Args:
            query: Consulta de búsqueda
            n_results: Número de resultados
        """
        print(f"\n🔍 Búsqueda: '{query}'")
        print("─" * 60)

        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )

        if not results['documents'][0]:
            print("No se encontraron resultados")
            return

        for i, (doc, metadata, distance) in enumerate(zip(
            results['documents'][0],
            results['metadatas'][0],
            results['distances'][0]
        )):
            print(f"\n📌 Resultado {i+1} (relevancia: {1 - distance:.2f})")
            print(f"   Fuente: {metadata.get('source', 'N/A')}")
            print(f"   Página/Chunk: {metadata.get('page', metadata.get('chunk', 'N/A'))}")
            print(f"   Texto: {doc[:200]}...")

    def get_stats(self) -> Dict:
        """Obtiene estadísticas de la colección"""
        count = self.collection.count()

        # Obtener muestra de metadatas
        if count > 0:
            sample = self.collection.get(limit=min(100, count))
            sources = set(m['source'] for m in sample['metadatas'])
        else:
            sources = set()

        return {
            'total_documents': count,
            'unique_sources': len(sources),
            'sources': sorted(sources)
        }

    def clear_collection(self) -> None:
        """Limpia la colección"""
        try:
            self.client.delete_collection(name="adhd_knowledge")
            print("✅ Colección eliminada")

            # Recrear
            self.collection = self.client.get_or_create_collection(
                name="adhd_knowledge",
                metadata={
                    "description": "ADHD specialized books and resources",
                    "language": "es"
                }
            )
            print("✅ Colección recreada (vacía)")
        except Exception as e:
            print(f"❌ Error limpiando colección: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Procesa libros especializados de TDAH para RAG",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos de uso:

  # Procesar libros en directorio ./books
  python process_adhd_books.py --books-dir ./books

  # Conectar a ChromaDB remoto
  python process_adhd_books.py --books-dir ./books --chroma-host 192.168.1.100

  # Ver estadísticas
  python process_adhd_books.py --stats

  # Probar búsqueda
  python process_adhd_books.py --test-search "técnicas de organización para TDAH"

  # Limpiar base de datos
  python process_adhd_books.py --clear
        """
    )

    parser.add_argument(
        '--books-dir',
        type=str,
        default='./books',
        help='Directorio con libros PDF/TXT (default: ./books)'
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
        '--stats',
        action='store_true',
        help='Mostrar estadísticas de la colección'
    )

    parser.add_argument(
        '--test-search',
        type=str,
        help='Probar búsqueda con query'
    )

    parser.add_argument(
        '--clear',
        action='store_true',
        help='Limpiar colección (¡PRECAUCIÓN!)'
    )

    args = parser.parse_args()

    # Inicializar procesador
    processor = ADHDBookProcessor(
        chroma_host=args.chroma_host,
        chroma_port=args.chroma_port
    )

    # Acciones
    if args.clear:
        confirm = input("⚠️  ¿Seguro que quieres eliminar toda la colección? [y/N]: ")
        if confirm.lower() == 'y':
            processor.clear_collection()
        else:
            print("Cancelado")
        return

    if args.stats:
        stats = processor.get_stats()
        print("\n📊 Estadísticas de la Base de Conocimiento")
        print("─" * 60)
        print(f"Total documentos: {stats['total_documents']}")
        print(f"Fuentes únicas: {stats['unique_sources']}")
        if stats['sources']:
            print("\nFuentes:")
            for source in stats['sources']:
                print(f"  - {source}")
        return

    if args.test_search:
        processor.search_test(args.test_search)
        return

    # Procesamiento de libros
    print("\n🚀 Iniciando procesamiento de libros...")
    print(f"📁 Directorio: {args.books_dir}")
    print()

    files_processed, total_chunks = processor.process_directory(args.books_dir)

    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DEL PROCESAMIENTO")
    print("=" * 60)
    print(f"Archivos procesados: {files_processed}")
    print(f"Chunks totales: {total_chunks}")

    stats = processor.get_stats()
    print(f"Total en base de datos: {stats['total_documents']}")

    if stats['total_documents'] > 0:
        print("\n✅ Base de conocimiento lista para usar")
        print("\n💡 Prueba una búsqueda:")
        print(f"   python {sys.argv[0]} --test-search 'técnicas organización TDAH'")
    else:
        print("\n⚠️  No se procesaron documentos")

    # Test de búsqueda automático si hay datos
    if total_chunks > 0:
        processor.search_test("¿Cómo mejorar la concentración con TDAH?", n_results=2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrumpido por el usuario")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
