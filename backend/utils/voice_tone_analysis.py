import librosa
import numpy as np

def analyze_voice_tone(audio_path):
    # Load the audio file
    y, sr = librosa.load(audio_path, sr=None)

    # Extract features
    pitch = librosa.yin(y, fmin=80, fmax=400)  # Pitch (fundamental frequency)
    intensity = np.abs(y)  # Intensity (amplitude)

    # Calculate statistics
    pitch_mean = np.mean(pitch)
    pitch_std = np.std(pitch)
    intensity_mean = np.mean(intensity)
    intensity_std = np.std(intensity)

    return {
        "pitch": {
            "mean": float(pitch_mean),
            "std": float(pitch_std)
        },
        "intensity": {
            "mean": float(intensity_mean),
            "std": float(intensity_std)
        }
    }