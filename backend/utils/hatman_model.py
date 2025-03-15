from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import torch
import librosa
import soundfile as sf

# Load the pre-built model
model_name = "Hatman/audio-emotion-detection"
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
model = AutoModelForAudioClassification.from_pretrained(model_name)

def classify_audio(audio_file):
    """Classify audio using the Hatman/audio-emotion-detection model."""
    # Load audio
    audio, sampling_rate = sf.read(audio_file)
    # Convert to mono if stereo
    if len(audio.shape) > 1:
        audio = audio.mean(axis=1)
    
    # Resample if needed
    if sampling_rate != feature_extractor.sampling_rate:
        print(f"Resampling from {sampling_rate}Hz to {feature_extractor.sampling_rate}Hz")
        audio = librosa.resample(
            audio, 
            orig_sr=sampling_rate, 
            target_sr=feature_extractor.sampling_rate
        )
        sampling_rate = feature_extractor.sampling_rate
    
    # Process audio
    inputs = feature_extractor(audio, sampling_rate=sampling_rate, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get probabilities for all emotions
    probs = torch.softmax(outputs.logits, dim=-1)[0].numpy()
    emotion_probs = {model.config.id2label[i]: float(probs[i]) for i in range(len(probs))}
    
    return emotion_probs