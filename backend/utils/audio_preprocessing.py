import librosa
import soundfile as sf

def preprocess_audio(audio_file, target_sr):
    """Preprocess audio by converting to mono and resampling."""
    audio, sampling_rate = sf.read(audio_file)
    
    # Convert to mono if stereo
    if len(audio.shape) > 1:
        audio = audio.mean(axis=1)
    
    # Resample if needed
    if sampling_rate != target_sr:
        print(f"Resampling from {sampling_rate}Hz to {target_sr}Hz")
        audio = librosa.resample(audio, orig_sr=sampling_rate, target_sr=target_sr)
    
    return audio, target_sr