import joblib
import pandas as pd
import opensmile
import os

# Get the absolute path to the models directory
models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'utils/models'))

# Load the custom model and preprocessing components
model = joblib.load(os.path.join(models_dir, 'emotion_model.pkl'))
scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
feature_cols = joblib.load(os.path.join(models_dir, 'feature_cols.pkl'))

def extract_opensmile_features(audio_file):
    """Extract OpenSmile features from audio file."""
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.eGeMAPSv02,
        feature_level=opensmile.FeatureLevel.Functionals,
    )
    features = smile.process_file(audio_file)
    return features.iloc[0].to_dict()

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
    emotion_probs = model.predict_proba(features_scaled)[0]
    emotion_labels = model.classes_
    emotion_probs_dict = {emotion_labels[i]: float(emotion_probs[i]) for i in range(len(emotion_labels))}
    
    return emotion_probs_dict

def analyze_voice_tone(audio_file):
    """Analyze voice tone using OpenSmile features."""
    # Extract OpenSmile features
    opensmile_features = extract_opensmile_features(audio_file)
    
    # Predict emotion using the custom model
    emotion_probs = predict_emotion(opensmile_features)
    
    # Return the emotion probabilities as tone analysis
    return emotion_probs