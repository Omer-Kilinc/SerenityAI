import torch
import soundfile as sf
import librosa
import joblib
import pandas as pd
import opensmile
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification
import logging

# Define label mapping
LABEL_MAPPING = {
    "Angry": "angry",
    "Disgusted": "disgust",
    "Fearful": "fearful",
    "Happy": "happy",
    "Neutral": "neutral",
    "Sad": "sad",
    "Surprised": "surprised",
    "Suprised": "surprised",  # Handle typo
    "Calm": "calm",
}

# Load the first model (Hatman/audio-emotion-detection)
model_name = "Hatman/audio-emotion-detection"
feature_extractor = AutoFeatureExtractor.from_pretrained(model_name)
model_1 = AutoModelForAudioClassification.from_pretrained(model_name)

# Load the second model (OpenSmile + RandomForest)
model_2 = joblib.load('models/emotion_model.pkl')
scaler = joblib.load('models/scaler.pkl')
feature_cols = joblib.load('models/feature_cols.pkl')

# Function to classify audio using the first model
def classify_audio(audio_file):
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
        outputs = model_1(**inputs)
    
    # Get probabilities for all emotions
    probs = torch.softmax(outputs.logits, dim=-1)[0].numpy()
    emotion_probs = {model_1.config.id2label[i]: float(probs[i]) for i in range(len(probs))}
    
    return emotion_probs

# Function to predict emotion using the second model
def predict_emotion(opensmile_features):
    """Predict emotion from OpenSmile features."""
    # Convert to DataFrame and ensure all required features are present
    features_df = pd.DataFrame([opensmile_features])
    missing_cols = set(feature_cols) - set(features_df.columns)
    for col in missing_cols:
        features_df[col] = 0
    
    # Select only the required features and in the correct order
    features_df = features_df[feature_cols]
    
    # Scale features
    features_scaled = scaler.transform(features_df)
    
    # Predict
    emotion_probs = model_2.predict_proba(features_scaled)[0]
    emotion_labels = model_2.classes_
    emotion_probs_dict = {emotion_labels[i]: float(emotion_probs[i]) for i in range(len(emotion_labels))}
    
    return emotion_probs_dict

# Function to extract OpenSmile features
def extract_opensmile_features(audio_file):
    """Extract OpenSmile features from audio file."""
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.eGeMAPSv02,
        feature_level=opensmile.FeatureLevel.Functionals,
    )
    features = smile.process_file(audio_file)
    return features.iloc[0].to_dict()

# Function to combine and average the results
def combine_results(result_1, result_2, label_mapping):
    """Combine and average the results from both models using standardized labels."""
    # Initialize combined results
    combined_results = {}
    
    # Standardize and combine results from the first model
    for emotion, score in result_1.items():
        standardized_emotion = label_mapping.get(emotion, emotion)  # Use mapping or fallback to original
        combined_results[standardized_emotion] = combined_results.get(standardized_emotion, 0) + score / 2
    
    # Standardize and combine results from the second model
    for emotion, score in result_2.items():
        standardized_emotion = label_mapping.get(emotion, emotion)  # Use mapping or fallback to original
        combined_results[standardized_emotion] = combined_results.get(standardized_emotion, 0) + score / 2
    
    return combined_results

# Example usage
audio_file = "./harvard.wav"

# Get results from both models
result_1 = classify_audio(audio_file)
opensmile_features = extract_opensmile_features(audio_file)
result_2 = predict_emotion(opensmile_features)

# Combine results using standardized labels
combined_results = combine_results(result_1, result_2, LABEL_MAPPING)

# Print the combined results
print("Combined Results:")
for emotion, confidence in combined_results.items():
    print(f"{emotion}: {confidence:.2f}")