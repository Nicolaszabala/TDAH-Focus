# 🚀 Plan de Acción: LLM Propio + RAG para TDAH Focus App

## 📊 RESUMEN EJECUTIVO

**Situación Actual:**
- Usas Llama 3.2 1B (muy pequeño) vía Hugging Face Router
- Límites: 450 tokens salida, 500 chars entrada, 20 req/min
- No puedes usar contexto extenso ni libros especializados

**Objetivo:**
- ✅ Modelo propio en Oracle Cloud **sin límites de tokens**
- ✅ RAG con libros especializados en TDAH
- ✅ Modelo más poderoso (7B-13B parámetros)
- ✅ **Costo: $0/mes** (Oracle Cloud Free Tier)

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### FASE 1: Deployment del LLM en Oracle Cloud (2-3 horas)

**Ubicación:** Tu instancia Oracle Cloud

**Archivos necesarios:**
- ✅ `setup-oracle-llm.sh` - Script automatizado de instalación
- ✅ `GUIA_DEPLOYMENT_ORACLE.md` - Guía completa paso a paso

**Pasos:**

1. **SSH a tu instancia Oracle Cloud**
   ```bash
   ssh -i ~/.ssh/oracle_key opc@<TU_IP_ORACLE>
   ```

2. **Copia y ejecuta el script de setup**
   ```bash
   # Desde tu máquina local, copia el script
   scp setup-oracle-llm.sh opc@<TU_IP_ORACLE>:~/

   # En Oracle Cloud
   cd ~
   chmod +x setup-oracle-llm.sh
   ./setup-oracle-llm.sh
   ```

3. **Sigue las instrucciones del script**
   - Selecciona modelo (recomendado: Llama 3.1 8B)
   - Configura firewall
   - Espera a que descargue y cargue el modelo (30-60 min)

4. **Verifica que funciona**
   ```bash
   # Health check
   curl http://localhost:8080/health

   # Prueba generación
   curl http://localhost:8080/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "meta-llama/Llama-3.1-8B-Instruct",
       "messages": [{"role": "user", "content": "Hola"}],
       "max_tokens": 100
     }'
   ```

**Resultado:** LLM corriendo en Oracle Cloud con capacidad de 16K+ tokens

---

### FASE 2: Configuración de RAG (1-2 horas)

**Ubicación:** Tu instancia Oracle Cloud O tu máquina local

**Archivos necesarios:**
- ✅ `rag-setup/process_adhd_books.py` - Procesa libros
- ✅ `rag-setup/rag_api_service.py` - Servicio API de RAG
- ✅ `rag-setup/requirements.txt` - Dependencias Python
- ✅ `rag-setup/README.md` - Documentación detallada

**Pasos:**

1. **Instala ChromaDB**
   ```bash
   docker run -d \
     --name chromadb \
     -p 8000:8000 \
     -v ~/chroma-data:/chroma/chroma \
     chromadb/chroma:latest
   ```

2. **Instala dependencias Python**
   ```bash
   cd rag-setup
   pip install -r requirements.txt
   ```

3. **Prepara tus libros**
   ```bash
   mkdir books
   # Copia tus PDFs/TXT sobre TDAH a books/
   ```

4. **Procesa los libros**
   ```bash
   python process_adhd_books.py --books-dir ./books

   # Verifica
   python process_adhd_books.py --stats
   ```

5. **Inicia servicio RAG**
   ```bash
   python rag_api_service.py \
     --llm-url http://localhost:8080/v1/chat/completions \
     --port 5000
   ```

6. **Prueba RAG**
   ```bash
   curl -X POST http://localhost:5000/generate \
     -H "Content-Type: application/json" \
     -d '{
       "message": "¿Cómo mejorar mi concentración con TDAH?",
       "use_rag": true
     }'
   ```

**Resultado:** Base de conocimiento con tus libros + API de RAG funcionando

---

### FASE 3: Actualización del Backend (30 minutos)

**Ubicación:** Tu backend Node.js (`adhd-chatbot-backend`)

**Archivos a modificar:**
- `services/llmService.js` - Cambiar a usar Oracle Cloud LLM
- `.env` - Agregar configuración de Oracle

**Pasos:**

1. **Opción A: Reemplazar completamente HF por Oracle (Simple)**

   Edita `services/llmService.js`:
   ```javascript
   // Línea 4-5: Cambia URLs
   const ORACLE_LLM_URL = process.env.ORACLE_LLM_URL || 'http://<TU_IP>:8080/v1/chat/completions';
   const MODEL_ID = 'meta-llama/Llama-3.1-8B-Instruct';

   // Línea 31: Aumenta max_tokens
   max_tokens: 2000,  // ¡Sin límites!
   ```

   Actualiza `.env`:
   ```env
   ORACLE_LLM_URL=http://<TU_IP_ORACLE>:8080/v1/chat/completions
   ```

2. **Opción B: Dual (Oracle + RAG con fallback a HF)**

   Crea `services/llmService-oracle.js` (archivo de ejemplo en guía)

   Edita `routes/chat.js` para usar nuevo servicio con RAG

3. **Elimina límites de mensajes**

   En `routes/chat.js` línea 47:
   ```javascript
   // ANTES:
   if (userMessage.length > 500) { ... }

   // DESPUÉS (opcional, aumenta o elimina):
   if (userMessage.length > 5000) {  // 10x más
     return res.status(400).json({
       error: 'Message too long',
       message: 'Máximo 5000 caracteres.'
     });
   }
   ```

4. **Prueba localmente**
   ```bash
   cd adhd-chatbot-backend
   npm start

   # En otra terminal
   curl http://localhost:3000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Explica el TDAH en detalle"}'
   ```

**Resultado:** Backend usando tu LLM en Oracle Cloud sin límites

---

### FASE 4: Deploy y Monitoreo (15 minutos)

**Pasos:**

1. **Actualiza variables de entorno en Render.com**
   - Ve a tu servicio en Render
   - Agrega: `ORACLE_LLM_URL=http://<IP_ORACLE>:8080/v1/chat/completions`
   - (Opcional) `RAG_SERVICE_URL=http://<IP_ORACLE>:5000`

2. **Asegura que Oracle Cloud permita conexiones**
   - Security List en Oracle Cloud Console
   - Permite puerto 8080 (LLM) y 5000 (RAG)

3. **Commit y push cambios**
   ```bash
   git add .
   git commit -m "Integración con LLM en Oracle Cloud + RAG"
   git push origin claude/deploy-huggingface-oracle-01YPVuu3rwKKmvzGTStgYN3D
   ```

4. **Monitorea**
   ```bash
   # En Oracle Cloud
   ~/monitor-llm.sh  # Script creado por setup-oracle-llm.sh

   # Logs del LLM
   docker logs -f tgi-llama
   ```

**Resultado:** App en producción con LLM propio + RAG

---

## 📋 CHECKLIST COMPLETO

### Pre-requisitos
- [ ] Acceso SSH a instancia Oracle Cloud
- [ ] Mínimo 16GB RAM en instancia
- [ ] Puertos 8080 y 5000 disponibles
- [ ] Libros especializados en TDAH (PDF/TXT)

### Fase 1: LLM en Oracle Cloud
- [ ] Docker instalado en Oracle Cloud
- [ ] Script `setup-oracle-llm.sh` ejecutado
- [ ] Modelo descargado y cargado (30-60 min)
- [ ] Health check exitoso: `curl http://localhost:8080/health`
- [ ] Prueba de generación exitosa
- [ ] Firewall configurado (Security List)

### Fase 2: RAG
- [ ] ChromaDB corriendo: `docker ps | grep chromadb`
- [ ] Dependencias Python instaladas: `pip install -r requirements.txt`
- [ ] Libros copiados a directorio `books/`
- [ ] Libros procesados: `python process_adhd_books.py`
- [ ] Servicio RAG corriendo: `rag_api_service.py`
- [ ] Prueba de búsqueda exitosa
- [ ] Prueba de generación con RAG exitosa

### Fase 3: Backend
- [ ] `llmService.js` actualizado
- [ ] `.env` con `ORACLE_LLM_URL`
- [ ] Límites de tokens aumentados
- [ ] Prueba local exitosa
- [ ] (Opcional) Integración RAG implementada

### Fase 4: Producción
- [ ] Variables de entorno en Render.com
- [ ] Security Lists en Oracle Cloud
- [ ] Cambios commiteados y pusheados
- [ ] App desplegada y funcionando
- [ ] Monitoreo configurado

---

## 🎓 RECURSOS CREADOS

### Scripts de Deployment
```
setup-oracle-llm.sh              # Script automatizado de instalación LLM
GUIA_DEPLOYMENT_ORACLE.md        # Guía completa (60+ páginas)
```

### Scripts de RAG
```
rag-setup/
├── process_adhd_books.py        # Procesa libros → ChromaDB
├── rag_api_service.py           # API REST para RAG
├── requirements.txt             # Dependencias Python
└── README.md                    # Documentación RAG
```

### Documentación
```
PLAN_DE_ACCION.md                # Este archivo
GUIA_DEPLOYMENT_ORACLE.md        # Guía detallada
rag-setup/README.md              # Guía RAG
```

---

## 💰 COSTOS

### Oracle Cloud Free Tier (GRATIS para siempre)
- ✅ 4 Arm-based Ampere A1 cores
- ✅ 24 GB RAM
- ✅ 200 GB Block Storage
- ✅ 10 TB Outbound Transfer/mes

**Suficiente para:**
- Llama 3.1 8B Instruct (modelo principal)
- ChromaDB (base de conocimiento)
- RAG API Service
- Monitoreo

**Costo total estimado: $0/mes** 🎉

---

## ⚡ MEJORAS vs SITUACIÓN ACTUAL

| Aspecto | Antes (HF Router) | Después (Oracle + RAG) | Mejora |
|---------|-------------------|------------------------|--------|
| **Modelo** | Llama 3.2 1B | Llama 3.1 8B | 8x más parámetros |
| **Max Tokens Salida** | 450 | 16,000+ | 35x más |
| **Max Entrada** | 500 chars | 128K tokens | 256x más |
| **Rate Limit** | 20 req/min | Sin límite* | ∞ |
| **Contexto Libros** | ❌ No | ✅ Sí (RAG) | ✓ |
| **Calidad Respuestas** | Básica | Especializada | ↑↑↑ |
| **Control** | Ninguno | Total | ✓ |
| **Costo** | Gratis (límites) | Gratis (sin límites) | ✓ |

*Solo limitado por recursos del servidor (muy alto)

---

## 🆘 SOPORTE

### Documentación
- **Guía completa**: `GUIA_DEPLOYMENT_ORACLE.md`
- **RAG**: `rag-setup/README.md`
- **Este plan**: `PLAN_DE_ACCION.md`

### Scripts de ayuda
```bash
# Monitoreo LLM
~/monitor-llm.sh

# Stats RAG
python process_adhd_books.py --stats

# Health check RAG
curl http://localhost:5000/health

# Logs
docker logs -f tgi-llama
docker logs -f chromadb
```

### Troubleshooting común

**LLM no carga:**
```bash
# Verifica RAM disponible
free -h

# Logs
docker logs tgi-llama --tail 100

# Reinicia
docker restart tgi-llama
```

**RAG no encuentra libros:**
```bash
# Verifica ChromaDB
docker ps | grep chromadb

# Ve estadísticas
python process_adhd_books.py --stats

# Reprocesa
python process_adhd_books.py --books-dir ./books
```

**Backend no conecta:**
```bash
# Verifica firewall Oracle Cloud
# Security Lists → Ingress Rules → Puerto 8080/5000

# Verifica conectividad
telnet <TU_IP_ORACLE> 8080
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### 1. ¿Tienes acceso a tu instancia Oracle Cloud?

**SÍ** → Continúa al paso 2

**NO** → Primero:
   - Inicia sesión en Oracle Cloud Console
   - Verifica que tienes una instancia corriendo
   - Obtén la IP pública
   - Configura SSH access

### 2. ¿Qué recursos tiene tu instancia?

```bash
# SSH y verifica
ssh opc@<TU_IP>

free -h      # RAM (necesitas 16GB+)
nproc        # CPUs (necesitas 4+)
df -h        # Disco (necesitas 100GB+)
```

**Suficientes recursos** → Continúa a FASE 1

**Insuficientes** → Upgrade instancia o usa modelo más pequeño (Llama 3.2 3B)

### 3. Ejecuta FASE 1

```bash
# Copia script
scp setup-oracle-llm.sh opc@<TU_IP>:~/

# Ejecuta
ssh opc@<TU_IP>
./setup-oracle-llm.sh
```

**Sigue las instrucciones del script** y tendrás tu LLM en 1-2 horas.

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo usar n8n para esto?

**Respuesta:** n8n no es necesario para el deployment básico del LLM.

**Uso recomendado de n8n:**
- Automatizar procesamiento de nuevos libros
- Workflows complejos de RAG
- Integración con otras herramientas (Notion, Google Drive, etc.)
- Pipelines de datos

Para empezar, sigue este plan sin n8n. Puedes agregarlo después.

### ¿Qué modelo elegir?

| RAM Disponible | Modelo Recomendado | Calidad |
|----------------|-------------------|---------|
| 8 GB | Llama 3.2 3B | Buena |
| 16 GB | **Llama 3.1 8B** ⭐ | Excelente |
| 24+ GB | Llama 3.1 8B (sin quantizar) | Superior |

**Para TDAH**: Llama 3.1 8B es óptimo (buen balance calidad/recursos)

### ¿Necesito GPU?

**NO.** Todos estos modelos funcionan bien en CPU con quantización.

**Con GPU**: Más rápido, pero no necesario.

### ¿Cuánto tarda en responder?

- **Con CPU (quantizado)**: 2-5 segundos
- **Con GPU**: <1 segundo

Suficientemente rápido para chatbot.

### ¿Puedo cambiar de modelo después?

**SÍ**, muy fácil:
```bash
docker stop tgi-llama
docker rm tgi-llama
./setup-oracle-llm.sh  # Selecciona otro modelo
```

### ¿Qué pasa si Oracle Cloud se cae?

Implementa **fallback** a Hugging Face Router (código de ejemplo en guía).

Tu app seguirá funcionando con límites mientras resuelves.

---

## 🎉 RESULTADO FINAL

Al completar este plan tendrás:

✅ **LLM propio** en Oracle Cloud (Llama 3.1 8B)
✅ **Sin límites** de tokens (16K+ contexto)
✅ **RAG** con libros especializados en TDAH
✅ **Respuestas enriquecidas** basadas en literatura científica
✅ **Control total** sobre parámetros y prompts
✅ **Costo: $0/mes** (Oracle Free Tier)
✅ **Escalable** y listo para producción

**Tiempo total estimado: 4-6 horas**

**Complejidad: Media** (scripts automatizan la mayoría)

---

## 📞 ¿Listo para empezar?

**Opción A (Recomendado):** Deployment paso a paso con guía
```bash
# Lee primero
cat GUIA_DEPLOYMENT_ORACLE.md

# Luego ejecuta
./setup-oracle-llm.sh
```

**Opción B:** Solo RAG (sin cambiar LLM)
```bash
cd rag-setup
cat README.md
# Sigue instrucciones
```

**Opción C:** Necesito ayuda
- Revisa documentación detallada en `GUIA_DEPLOYMENT_ORACLE.md`
- Sección FAQ específica para tu problema
- Scripts de troubleshooting incluidos

---

**¡Éxito con tu implementación!** 🚀
