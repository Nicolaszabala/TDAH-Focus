# 🎯 Opciones para Recursos Limitados (5.8GB RAM, 1 CPU)

Tu servidor tiene recursos limitados. Aquí están tus **3 mejores opciones**, ordenadas por recomendación:

---

## 🥇 OPCIÓN 1: Groq API (RECOMENDADA) ⭐

### Por qué es la mejor opción:

| Aspecto | Tu Servidor | Groq API |
|---------|-------------|----------|
| **RAM usada** | 3-4GB | 0GB |
| **Velocidad** | 10-30 segundos | <1 segundo |
| **Modelo** | 1-3B parámetros | 8B parámetros |
| **Costo** | $0 | $0 (tier gratuito) |
| **Setup** | 30-60 min | **5 minutos** |
| **Mantenimiento** | Alto | Ninguno |

### Límites del tier gratuito:
- ✅ 6000 tokens/minuto (suficiente para ~12 respuestas/min)
- ✅ 14,400 requests/día
- ✅ Modelo: Llama 3.1 8B Instant

### Setup en 5 minutos:

```bash
# 1. Obtén API key gratis
# https://console.groq.com/keys

# 2. Instala SDK
cd adhd-chatbot-backend
npm install groq-sdk

# 3. Agrega a .env
echo "GROQ_API_KEY=gsk_TU_CLAVE" >> .env

# 4. Usa el servicio
cp services/llmService-groq.js services/llmService.js

# 5. Reinicia
npm start
```

**Documentación completa:** `SETUP_GROQ_RAPIDO.md`

---

## 🥈 OPCIÓN 2: Ollama Local (Phi-3-Mini)

### Cuándo elegir esta opción:
- ❌ No quieres depender de servicios externos
- ❌ Necesitas que funcione sin internet
- ⚠️ Aceptas respuestas lentas (15-25 segundos)

### Especificaciones:

| Modelo | RAM | Tiempo/Respuesta | Calidad |
|--------|-----|------------------|---------|
| **Phi-3-Mini** | 3.8GB | 15-25 seg | Buena |
| Qwen2.5 1.5B | 1.5GB | 8-15 seg | Aceptable |
| TinyLlama | 637MB | 5-10 seg | Básica |

### Setup automático:

```bash
# Ejecuta script de instalación
./setup-llm-recursos-limitados.sh

# Selecciona opción 1: Phi-3-Mini
# El script hace todo automáticamente
```

**Tiempo:** 30-60 minutos (incluye descarga de modelo)

### Ventajas:
- ✅ Todo local, sin dependencias externas
- ✅ Sin límites de requests
- ✅ Privacidad total

### Desventajas:
- ❌ **MUY LENTO** con 1 CPU (15-25 segundos/respuesta)
- ❌ Usa 3.8GB RAM (deja poco margen)
- ❌ Peor calidad que Groq (3.8B vs 8B)

---

## 🥉 OPCIÓN 3: Upgrade Oracle Cloud (Gratis)

### Oracle Cloud Free Tier incluye:

**Instancia Ampere A1** (GRATIS para siempre):
- 4 OCPUs ARM
- 24GB RAM
- 200GB Storage

**Capacidad:**
- ✅ Llama 3.1 8B (con quantización)
- ✅ ChromaDB para RAG
- ✅ Respuestas en 2-5 segundos
- ✅ Contexto: 128K tokens

### Cómo hacer upgrade:

1. **Termina tu instancia actual**
   ```bash
   # En Oracle Cloud Console
   Compute → Instances → Terminar instancia actual
   ```

2. **Crea instancia Ampere A1**
   ```
   Shape: VM.Standard.A1.Flex
   OCPUs: 4
   RAM: 24GB
   Boot Volume: 200GB
   ```

3. **Ejecuta setup completo**
   ```bash
   ./setup-oracle-llm.sh
   # Selecciona Llama 3.1 8B
   ```

**Tiempo:** 2-3 horas (incluye descarga de modelo)

### Ventajas:
- ✅ **GRATIS** (Oracle Free Tier)
- ✅ Modelo potente (8B parámetros)
- ✅ Velocidad aceptable (2-5 seg)
- ✅ Permite RAG con libros especializados
- ✅ Sin límites de requests

### Desventajas:
- ⚠️ Requiere recrear instancia
- ⚠️ Migración de datos (n8n, etc.)
- ⚠️ Setup más complejo

---

## 📊 Comparación Completa

| | Groq API ⭐ | Ollama Local | Upgrade Oracle |
|---|---|---|---|
| **Costo** | $0 | $0 | $0 |
| **Setup** | 5 min | 30-60 min | 2-3 horas |
| **Velocidad** | <1 seg | 15-25 seg | 2-5 seg |
| **Modelo** | 8B | 3.8B | 8B |
| **RAM usada** | 0GB | 3.8GB | 16GB |
| **Dependencia externa** | Sí | No | No |
| **Límites** | 6000 tok/min | Ninguno | Ninguno |
| **RAG posible** | Sí* | No** | Sí |
| **Internet requerido** | Sí | No | No*** |

*RAG externo o en laptop
**No hay RAM suficiente
***Solo para requests de usuarios

---

## 🎯 Mi Recomendación por Escenario

### 1. Solo quiero que funcione YA
→ **Groq API** (5 minutos, gratis, ultra rápido)

### 2. Quiero solución a largo plazo con RAG
→ **Upgrade Oracle Cloud** (gratis, potente, permite RAG)

### 3. No puedo/quiero usar APIs externas
→ **Ollama Local** (pero acepta que será lento)

### 4. Tengo múltiples servidores/servicios
→ **Groq API** + **Upgrade Oracle Cloud separado**
   - Groq para la app principal (rápido)
   - Oracle Cloud nuevo para RAG y experimentación

---

## 📝 Decisión Rápida

### ¿Cuál es tu prioridad #1?

**A) Velocidad de respuesta**
→ Groq API (respuestas instantáneas)

**B) Privacidad/Control total**
→ Upgrade Oracle Cloud

**C) Sin cambios en infraestructura**
→ Ollama Local (acepta lentitud)

**D) Respuestas enriquecidas con libros**
→ Groq API + RAG en laptop/otro servidor

---

## 🚀 Próximo Paso Según tu Elección

### Elegiste Groq API:
```bash
# Lee e implementa:
cat SETUP_GROQ_RAPIDO.md

# Tiempo: 5 minutos
# Resultado: App 5x más rápida con modelo 8B
```

### Elegiste Ollama Local:
```bash
# Ejecuta:
./setup-llm-recursos-limitados.sh

# Tiempo: 30-60 minutos
# Resultado: LLM local (lento pero funcional)
```

### Elegiste Upgrade Oracle Cloud:
```bash
# 1. Termina instancia actual en Oracle Console
# 2. Crea nueva Ampere A1 (4 OCPU, 24GB)
# 3. Ejecuta:
./setup-oracle-llm.sh

# Tiempo: 2-3 horas
# Resultado: LLM potente + capacidad para RAG
```

---

## ❓ FAQ

### ¿Puedo combinar opciones?

**Sí**, de hecho es recomendable:

**Producción:** Groq API (rápido, confiable)
**Desarrollo/RAG:** Oracle Cloud upgraded (experimentación)

### ¿Groq es confiable para producción?

Sí, Groq es usado por muchas startups:
- Uptime: >99.9%
- Velocidad: <1 segundo consistente
- Gratis hasta escala considerable

Si creces, puedes migrar fácilmente.

### ¿Qué pasa con mi n8n actual?

**Con Groq/Ollama:** n8n no se afecta (mismo servidor)

**Con Upgrade Oracle:** Necesitas:
1. Backup de n8n
2. Recrear instancia
3. Restaurar n8n

O mejor: **Crea segunda instancia** para LLM, mantén actual para n8n.

### ¿Cuánto mejora Groq vs mi LLM actual?

| Métrica | HF Router Actual | Groq API | Mejora |
|---------|------------------|----------|--------|
| Velocidad | 2-5 seg | <1 seg | **5x más rápido** |
| Modelo | 1B | 8B | **8x más parámetros** |
| Max tokens | 450 | 8000 | **17x más** |
| Calidad | Básica | Excelente | ⬆️⬆️⬆️ |

### ¿Puedo probar Groq sin comprometer mi setup actual?

**Sí**, Groq no afecta tu setup:

```bash
# Crea servicio nuevo (no sobreescribe actual)
# llmService-groq.js es separado de llmService.js

# Prueba con curl antes de cambiar código
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer TU_CLAVE" \
  -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"test"}]}'
```

---

## 📞 Archivos de Ayuda

| Opción | Archivo de Ayuda |
|--------|------------------|
| **Groq API** | `SETUP_GROQ_RAPIDO.md` |
| **Ollama Local** | `setup-llm-recursos-limitados.sh` |
| **Upgrade Oracle** | `GUIA_DEPLOYMENT_ORACLE.md` |
| **RAG** | `rag-setup/README.md` |
| **Plan Completo** | `PLAN_DE_ACCION.md` |

---

## 💡 Consejo Final

**Para tu caso específico (5.8GB RAM, 1 CPU):**

1. **Hoy:** Implementa Groq API (5 minutos)
   - Tendrás app funcional y rápida
   - Sin cambios en infraestructura
   - Gratis

2. **Próxima semana:** Evalúa si quieres RAG
   - Si sí: Considera upgrade Oracle Cloud
   - Si no: Quédate con Groq (es excelente)

3. **Futuro:** Si creces mucho
   - Groq tiene tier de pago súper barato
   - O migra a servidor propio en ese momento

**No intentes correr modelos grandes en 1 CPU**
- Será frustrantemente lento
- Mala experiencia de usuario
- Groq es gratis y 20x más rápido

---

## ✅ Siguiente Acción

**Recomendación:** Groq API

```bash
# 1. Lee la guía
cat SETUP_GROQ_RAPIDO.md

# 2. Obtén API key (30 segundos)
# https://console.groq.com/keys

# 3. Implementa (5 minutos)
cd adhd-chatbot-backend
npm install groq-sdk
echo "GROQ_API_KEY=tu_clave" >> .env

# 4. Prueba
npm start
```

**¿Prefieres otra opción?** Lee el archivo correspondiente de la tabla arriba.

**¿Dudas?** Todos los archivos tienen secciones de troubleshooting y FAQ.

¡Suerte! 🚀
