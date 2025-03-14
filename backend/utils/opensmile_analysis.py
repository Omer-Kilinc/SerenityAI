import os
import opensmile
import numpy as np

def analyze_voice_with_opensmile(audio_path):
    """
    Analyze audio using OpenSmile to extract features for emotion recognition.
    """
    # Debugging: Confirm the file exists
    if not os.path.exists(audio_path):
        raise ValueError(f"Audio file not found: {audio_path}")

    # Initialize OpenSmile with the GeMAPS feature set (commonly used for emotion recognition)
    smile = opensmile.Smile(
        feature_set=opensmile.FeatureSet.GeMAPS,  # GeMAPS feature set for emotion analysis
        feature_level=opensmile.FeatureLevel.Functionals,  # Extract functionals (summary statistics)
    )

    # Extract features from the audio file
    features = smile.process_file(audio_path)

    # Convert features to a dictionary for easier use
    feature_dict = features.to_dict(orient="records")[0]

    return feature_dict