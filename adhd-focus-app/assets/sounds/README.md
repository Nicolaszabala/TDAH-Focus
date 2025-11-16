# Archivos de Audio para Ambientes Sonoros

Este directorio debe contener los archivos de audio para los ambientes sonoros terapéuticos.

## Archivos Requeridos

Necesitas los siguientes archivos en este directorio:

1. **pink_noise.mp3** - Ruido rosa
2. **brown_noise.mp3** - Ruido marrón (brown noise)
3. **nature_ambient.mp3** - Ambiente natural (opcional)

## Opción 1: Descargar Archivos Pre-generados

Puedes descargar archivos de ruido de alta calidad de fuentes gratuitas:

### Recursos Recomendados:

**Freesound.org** (Creative Commons):
- Pink Noise: https://freesound.org/search/?q=pink+noise
- Brown Noise: https://freesound.org/search/?q=brown+noise

**mynoise.net** (Generador Online):
- Visita: https://mynoise.net/
- Genera ruido rosa o marrón
- Descarga el archivo WAV
- Convierte a MP3 con: `ffmpeg -i input.wav -codec:a libmp3lame -qscale:a 2 output.mp3`

## Opción 2: Generar con Python (Recomendado)

Usa el script incluido para generar ruido de alta calidad:

```bash
# Instalar dependencias
pip install numpy scipy

# Ejecutar el generador
python generate_noise.py
```

Esto creará automáticamente:
- `pink_noise.mp3` (30 segundos, loop perfecto)
- `brown_noise.mp3` (30 segundos, loop perfecto)

## Opción 3: Generar con Audacity (Manual)

1. Descarga Audacity (gratis): https://www.audacityteam.org/
2. Genera ruido:
   - Genera > Ruido...
   - Tipo: Pink (Rosa) o Brownian (Marrón)
   - Duración: 30 segundos
   - Amplitud: 0.5
3. Normalizar el audio: Efecto > Normalizar (-3 dB)
4. Aplicar Fade In/Out suave para loop perfecto:
   - Selecciona primeros 0.1s > Efecto > Fade In
   - Selecciona últimos 0.1s > Efecto > Fade Out
5. Exportar: Archivo > Exportar > Exportar como MP3
   - Calidad: 192 kbps (buena calidad, tamaño razonable)

## Opción 4: Usar URLs de Audio (Solo para testing)

Si necesitas probar rápidamente sin archivos locales, puedes modificar el servicio
para usar URLs remotas (NO recomendado para producción - requiere conexión):

```javascript
const SOUND_FILES = {
  pink: { uri: 'https://example.com/pink_noise.mp3' },
  brown: { uri: 'https://example.com/brown_noise.mp3' },
};
```

## Especificaciones Técnicas Recomendadas

Para mejor experiencia:

- **Formato**: MP3 (mejor compatibilidad) o M4A (menor tamaño)
- **Bitrate**: 128-192 kbps (buena calidad sin tamaño excesivo)
- **Duración**: 30-60 segundos (suficiente para loop sin patrón perceptible)
- **Sample Rate**: 44.1 kHz (estándar)
- **Canales**: Mono o Estéreo (Mono reduce tamaño)
- **Normalización**: -3 dB (evita distorsión)
- **Fade In/Out**: 100ms al inicio/final (loop sin click)

## Verificación de Archivos

Después de agregar los archivos, verifica que existan:

```bash
ls -lh assets/sounds/
```

Deberías ver:
```
pink_noise.mp3
brown_noise.mp3
nature_ambient.mp3
```

## Troubleshooting

### Error: "Cannot find module '../../assets/sounds/pink_noise.mp3'"

**Solución**: Asegúrate de que los archivos estén en la ubicación correcta y reinicia el servidor:
```bash
npx expo start -c
```

### Audio no se reproduce

1. Verifica que los archivos no estén corruptos (ábrelos con un reproductor)
2. Confirma que el formato es compatible (MP3, M4A, WAV)
3. Revisa los logs de Expo para errores de carga

## Referencias Científicas

- **Ruido Rosa**: Energía igual por octava, disminuye 3dB/octava
- **Ruido Marrón**: Frecuencias graves, disminuye 6dB/octava
- **Beneficios TDAH**: Nigg et al. (2024) - Mejora atención (g=0.249, p<.0001)

---

**Nota**: Los archivos de audio NO están incluidos en el repositorio por tamaño.
Debes generarlos o descargarlos antes de ejecutar la app.
