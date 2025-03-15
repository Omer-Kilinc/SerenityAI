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