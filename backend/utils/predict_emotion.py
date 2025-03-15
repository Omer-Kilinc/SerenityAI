import joblib
import pandas as pd
import opensmile

# Load the model and preprocessing components
model = joblib.load('models/emotion_model.pkl')
scaler = joblib.load('models/scaler.pkl')
feature_cols = joblib.load('models/feature_cols.pkl')

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
    emotion = model.predict(features_scaled)[0]
    emotion_probs = model.predict_proba(features_scaled)[0]
    top_emotions = [(emotion, prob) for emotion, prob in 
                    zip(model.classes_, emotion_probs)]
    top_emotions = sorted(top_emotions, key=lambda x: x[1], reverse=True)
    
    return {
        'predicted_emotion': emotion,
        'confidence': dict(top_emotions)
    }

def extract_opensmile_features(audio_file):
    """Extract OpenSmile features from audio file."""
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.eGeMAPSv02,
        feature_level=opensmile.FeatureLevel.Functionals,
    )
    features = smile.process_file(audio_file)
    return features.iloc[0].to_dict()

# Example usage
audio_file = "./harvard.wav"
opensmile_features = extract_opensmile_features(audio_file)
result = predict_emotion(opensmile_features)
print(f"Predicted emotion: {result['predicted_emotion']}")
print(f"Confidence scores: {result['confidence']}")