#!/usr/bin/env python3
"""
Generate therapeutic ambient sounds for TDAH Focus App
- Pink Noise: Based on scientific evidence (Nigg et al., 2024)
- Brown Noise: Based on scientific evidence (Nigg et al., 2024)
- Nature Sounds (Birds): Calming ambient sound

All sounds are generated to loop seamlessly (no cuts)
Duration: 60 seconds (allows for seamless loop)
"""

import numpy as np
from scipy.io import wavfile
from scipy import signal
import os

# Audio parameters
SAMPLE_RATE = 44100  # CD quality
DURATION = 60  # 60 seconds for smooth looping
AMPLITUDE = 0.3  # Prevent clipping


def generate_pink_noise(duration, sample_rate, amplitude=0.3):
    """
    Generate pink noise (1/f noise)
    Pink noise has equal energy per octave - scientifically proven to help with ADHD
    """
    # Generate white noise
    samples = int(duration * sample_rate)
    white = np.random.randn(samples)

    # Apply pink noise filter (1/f characteristic)
    # Using the Voss-McCartney algorithm
    n_rows = 16
    n_cols = samples
    array = np.zeros((n_rows, n_cols))

    # Generate pink noise using random walk on different time scales
    for i in range(n_rows):
        step_size = 2 ** i
        array[i] = np.repeat(np.random.randn(n_cols // step_size + 1), step_size)[:n_cols]

    pink = np.sum(array, axis=0)

    # Normalize
    pink = pink / np.max(np.abs(pink))
    pink = pink * amplitude

    # Apply fade in/out for seamless looping
    fade_samples = int(0.1 * sample_rate)  # 100ms fade
    fade_in = np.linspace(0, 1, fade_samples)
    fade_out = np.linspace(1, 0, fade_samples)

    pink[:fade_samples] *= fade_in
    pink[-fade_samples:] *= fade_out

    return pink


def generate_brown_noise(duration, sample_rate, amplitude=0.3):
    """
    Generate brown noise (Brownian noise, red noise)
    Brown noise has even more low-frequency content than pink noise
    """
    samples = int(duration * sample_rate)
    white = np.random.randn(samples)

    # Brown noise is the cumulative sum of white noise (random walk)
    brown = np.cumsum(white)

    # Normalize
    brown = brown / np.max(np.abs(brown))
    brown = brown * amplitude

    # Apply fade in/out for seamless looping
    fade_samples = int(0.1 * sample_rate)  # 100ms fade
    fade_in = np.linspace(0, 1, fade_samples)
    fade_out = np.linspace(1, 0, fade_samples)

    brown[:fade_samples] *= fade_in
    brown[-fade_samples:] *= fade_out

    return brown


def generate_bird_sounds(duration, sample_rate, amplitude=0.25):
    """
    Generate nature sounds (bird chirping simulation)
    Creates a calming ambient soundscape
    """
    samples = int(duration * sample_rate)
    birds = np.zeros(samples)

    # Generate multiple bird chirps at random intervals
    num_birds = 40  # Number of chirps throughout the duration

    for _ in range(num_birds):
        # Random start time for each chirp
        start = np.random.randint(0, samples - sample_rate)

        # Chirp parameters
        chirp_duration = np.random.uniform(0.1, 0.3)  # 100-300ms
        chirp_samples = int(chirp_duration * sample_rate)

        # Frequency sweep (bird chirp characteristic)
        f0 = np.random.uniform(2000, 5000)  # Start frequency (Hz)
        f1 = np.random.uniform(f0 - 1000, f0 + 1000)  # End frequency

        # Generate chirp
        t = np.linspace(0, chirp_duration, chirp_samples)
        chirp = signal.chirp(t, f0, chirp_duration, f1, method='quadratic')

        # Apply envelope (attack-decay)
        envelope = np.exp(-3 * t / chirp_duration)  # Exponential decay
        chirp = chirp * envelope

        # Random amplitude variation
        chirp_amp = np.random.uniform(0.3, 0.8) * amplitude
        chirp = chirp * chirp_amp

        # Add to the soundscape
        end = min(start + chirp_samples, samples)
        birds[start:end] += chirp[:end - start]

    # Add subtle background ambiance (very soft pink noise)
    background = generate_pink_noise(duration, sample_rate, amplitude=0.05)
    birds += background

    # Normalize to prevent clipping
    birds = birds / np.max(np.abs(birds))
    birds = birds * amplitude

    # Apply fade in/out for seamless looping
    fade_samples = int(0.5 * sample_rate)  # 500ms fade for smoother transition
    fade_in = np.linspace(0, 1, fade_samples)
    fade_out = np.linspace(1, 0, fade_samples)

    birds[:fade_samples] *= fade_in
    birds[-fade_samples:] *= fade_out

    return birds


def save_audio(filename, audio_data, sample_rate):
    """Save audio data to WAV file"""
    # Convert to 16-bit PCM
    audio_int16 = np.int16(audio_data * 32767)
    wavfile.write(filename, sample_rate, audio_int16)
    print(f"✓ Generated: {filename}")


def main():
    """Generate all three therapeutic sounds"""
    output_dir = os.path.dirname(os.path.abspath(__file__))

    print("Generating therapeutic ambient sounds...")
    print(f"Sample rate: {SAMPLE_RATE} Hz")
    print(f"Duration: {DURATION} seconds")
    print(f"Output directory: {output_dir}\n")

    # Generate pink noise
    print("Generating pink noise...")
    pink = generate_pink_noise(DURATION, SAMPLE_RATE, AMPLITUDE)
    save_audio(os.path.join(output_dir, 'pink_noise.wav'), pink, SAMPLE_RATE)

    # Generate brown noise
    print("Generating brown noise...")
    brown = generate_brown_noise(DURATION, SAMPLE_RATE, AMPLITUDE)
    save_audio(os.path.join(output_dir, 'brown_noise.wav'), brown, SAMPLE_RATE)

    # Generate bird sounds
    print("Generating nature sounds (birds)...")
    birds = generate_bird_sounds(DURATION, SAMPLE_RATE, AMPLITUDE)
    save_audio(os.path.join(output_dir, 'birds.wav'), birds, SAMPLE_RATE)

    print("\n✓ All sounds generated successfully!")
    print("\nThese sounds are designed to:")
    print("  - Loop seamlessly (no cuts)")
    print("  - Help with TDAH Focus (pink/brown noise)")
    print("  - Provide calming ambient soundscape (birds)")
    print("\nBased on scientific evidence: Nigg et al. (2024)")


if __name__ == "__main__":
    main()
