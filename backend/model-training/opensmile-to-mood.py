import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import opensmile
import joblib

# Step 1: Load the CREMA-D dataset
def load_crema_d(dataset_path):
    """
    Load audio files and labels from the CREMA-D dataset.
    """
    audio_files = []
    labels = []

    # Map CREMA-D emotion codes to labels
    emotion_map = {
        "ANG": "anger",
        "DIS": "disgust",
        "FEA": "fear",
        "HAP": "happy",
        "NEU": "neutral",
        "SAD": "sad"
    }

    for root, dirs, files in os.walk(dataset_path):
        for file in files:
            if file.endswith(".wav"):
                # Extract emotion code from filename (e.g., "1001_DFA_ANG_XX.wav")
                emotion_code = file.split("_")[2]
                if emotion_code in emotion_map:
                    audio_files.append(os.path.join(root, file))
                    labels.append(emotion_map[emotion_code])

    return audio_files, labels

# Step 2: Extract features using OpenSmile
def extract_features(audio_files):
    """
    Extract features from audio files using OpenSmile.
    """
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.GeMAPS,  # Use GeMAPS feature set
        feature_level=opensmile.FeatureLevel.Functionals,  # Extract functionals (summary statistics)
    )

    features = []
    for file in audio_files:
        features.append(smile.process_file(file).to_numpy().flatten())

    return np.array(features)

# Step 3: Train a model
def train_model(features, labels):
    """
    Train a Random Forest classifier for emotion classification.
    """
    # Split the data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

    # Train a Random Forest classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate the model
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))

    return model

# Step 4: Main function
def main():
    # Load the CREMA-D dataset
    dataset_path = "path/to/CREMA-D"  # Replace with the path to your CREMA-D dataset
    audio_files, labels = load_crema_d(dataset_path)

    # Extract features using OpenSmile
    print("Extracting features...")
    features = extract_features(audio_files)

    # Train the model
    print("Training model...")
    model = train_model(features, labels)

    # Save the model (optional)
    joblib.dump(model, "emotion_classifier.pkl")
    print("Model saved as emotion_classifier.pkl")

if __name__ == "__main__":
    main()