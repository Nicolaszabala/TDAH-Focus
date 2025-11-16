#!/usr/bin/env python3
"""
Generador de Ruido Rosa y Marrón para TDAH Focus App
Basado en el método refinado de Paul Kellet para ruido rosa
Genera archivos MP3 de alta calidad para reproducción en loop
"""

import numpy as np
from scipy.io import wavfile
import subprocess
import sys

def generate_white_noise(duration_seconds, sample_rate=44100):
    """Genera ruido blanco"""
    num_samples = int(duration_seconds * sample_rate)
    return np.random.uniform(-1, 1, num_samples)

def generate_pink_noise(duration_seconds, sample_rate=44100):
    """
    Genera ruido rosa usando el método de Paul Kellet
    Pink noise: -3dB/octava (energía igual por octava)
    """
    num_samples = int(duration_seconds * sample_rate)
    white_noise = np.random.uniform(-1, 1, num_samples)

    # Paul Kellet's refined method - 7 generators
    b0, b1, b2, b3, b4, b5, b6 = 0, 0, 0, 0, 0, 0, 0
    pink_noise = np.zeros(num_samples)

    for i in range(num_samples):
        white = white_noise[i]

        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980

        pink_noise[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
        b6 = white * 0.115926

    # Normalizar a -3dB para evitar clipping
    pink_noise = pink_noise / np.max(np.abs(pink_noise)) * 0.7

    return pink_noise

def generate_brown_noise(duration_seconds, sample_rate=44100):
    """
    Genera ruido marrón (Brownian noise)
    Brown noise: -6dB/octava (frecuencias graves predominantes)
    """
    num_samples = int(duration_seconds * sample_rate)
    white_noise = np.random.uniform(-1, 1, num_samples)

    # Integración acumulativa (random walk)
    brown_noise = np.zeros(num_samples)
    last_out = 0

    for i in range(num_samples):
        white = white_noise[i]
        last_out = (last_out + (0.02 * white)) / 1.02
        brown_noise[i] = last_out * 3.5  # Amplificación

    # Normalizar a -3dB
    brown_noise = brown_noise / np.max(np.abs(brown_noise)) * 0.7

    return brown_noise

def apply_fade(audio, sample_rate, fade_duration_ms=100):
    """Aplica fade in/out para loop perfecto sin clicks"""
    fade_samples = int((fade_duration_ms / 1000.0) * sample_rate)

    # Fade in (inicio)
    fade_in = np.linspace(0, 1, fade_samples)
    audio[:fade_samples] *= fade_in

    # Fade out (final)
    fade_out = np.linspace(1, 0, fade_samples)
    audio[-fade_samples:] *= fade_out

    return audio

def normalize_audio(audio, target_db=-3.0):
    """Normaliza el audio a un nivel específico en dB"""
    current_max = np.max(np.abs(audio))
    target_amplitude = 10 ** (target_db / 20.0)
    return audio * (target_amplitude / current_max)

def save_as_wav(audio, filename, sample_rate=44100):
    """Guarda audio como WAV (16-bit)"""
    # Convertir a int16
    audio_int16 = (audio * 32767).astype(np.int16)
    wavfile.write(filename, sample_rate, audio_int16)
    print(f"✅ Creado: {filename}")

def convert_wav_to_mp3(wav_filename, mp3_filename, bitrate='192k'):
    """Convierte WAV a MP3 usando ffmpeg"""
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', wav_filename,
            '-codec:a', 'libmp3lame',
            '-b:a', bitrate,
            '-ar', '44100',
            mp3_filename
        ], check=True, capture_output=True)
        print(f"✅ Convertido a MP3: {mp3_filename}")

        # Eliminar WAV temporal
        import os
        os.remove(wav_filename)

        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error convirtiendo a MP3: {e}")
        print("   Asegúrate de tener ffmpeg instalado: https://ffmpeg.org/")
        return False
    except FileNotFoundError:
        print("❌ ffmpeg no encontrado. Instalalo con:")
        print("   - macOS: brew install ffmpeg")
        print("   - Ubuntu/Debian: sudo apt-get install ffmpeg")
        print("   - Windows: descarga desde https://ffmpeg.org/download.html")
        return False

def main():
    print("🎵 Generador de Ruido Rosa y Marrón para TDAH Focus App")
    print("=" * 60)

    # Configuración
    duration_seconds = 30  # 30 segundos (suficiente para loop)
    sample_rate = 44100

    print(f"\n📊 Configuración:")
    print(f"   Duración: {duration_seconds} segundos")
    print(f"   Sample Rate: {sample_rate} Hz")
    print(f"   Fade In/Out: 100ms")
    print(f"   Normalización: -3dB\n")

    # Generar Ruido Rosa
    print("🔊 Generando ruido rosa...")
    pink_noise = generate_pink_noise(duration_seconds, sample_rate)
    pink_noise = apply_fade(pink_noise, sample_rate)
    pink_noise = normalize_audio(pink_noise, -3.0)

    wav_pink = "pink_noise_temp.wav"
    mp3_pink = "pink_noise.mp3"
    save_as_wav(pink_noise, wav_pink, sample_rate)

    # Generar Ruido Marrón
    print("\n🔊 Generando ruido marrón...")
    brown_noise = generate_brown_noise(duration_seconds, sample_rate)
    brown_noise = apply_fade(brown_noise, sample_rate)
    brown_noise = normalize_audio(brown_noise, -3.0)

    wav_brown = "brown_noise_temp.wav"
    mp3_brown = "brown_noise.mp3"
    save_as_wav(brown_noise, wav_brown, sample_rate)

    # Convertir a MP3
    print("\n🎵 Convirtiendo a MP3...")
    pink_success = convert_wav_to_mp3(wav_pink, mp3_pink, '192k')
    brown_success = convert_wav_to_mp3(wav_brown, mp3_brown, '192k')

    # Resumen
    print("\n" + "=" * 60)
    if pink_success and brown_success:
        print("✅ ¡Archivos generados exitosamente!")
        print(f"\n📁 Archivos creados:")
        print(f"   - {mp3_pink}")
        print(f"   - {mp3_brown}")
        print(f"\n📦 Mueve estos archivos a:")
        print(f"   adhd-focus-app/assets/sounds/")
        print("\n🔬 Fundamento científico:")
        print("   Ruido Rosa: Energía igual por octava (-3dB/octava)")
        print("   Ruido Marrón: Frecuencias graves predominantes (-6dB/octava)")
        print("   Beneficio TDAH: Nigg et al. (2024) - g=0.249, p<.0001")
    else:
        print("⚠️  Archivos WAV generados, pero conversión MP3 falló")
        print("   Puedes usar los archivos WAV directamente o convertir manualmente")

    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Generación cancelada por usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
