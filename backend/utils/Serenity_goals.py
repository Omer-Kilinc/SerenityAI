from transformers import pipeline
import re

emotion_pipeline = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=None)

# Function to split text into sentences (without using NLTK)
def split_sentences(text):
    sentences = re.split(r'(?<=[.!?]) +', text)  # Splits at `.`, `!`, `?` followed by a space
    return sentences

# Function to analyze emotions for each sentence
def analyze_text_emotions(text):
    sentences = split_sentences(text)
    emotion_totals = {}
    sentence_count = 0

    for sentence in sentences:
        results = emotion_pipeline(sentence)[0]

        if not emotion_totals:
            emotion_totals = {result['label']: 0 for result in results}

        for result in results:
            emotion_totals[result['label']] += result['score']

        sentence_count += 1

    averaged_emotions = {emotion: round(score / sentence_count, 4) for emotion, score in emotion_totals.items()} if sentence_count > 0 else {}
    top_emotion = max(averaged_emotions, key=averaged_emotions.get) if averaged_emotions else None

    wellbeing_score = 50
    if averaged_emotions:
        wellbeing_score += (
            (averaged_emotions.get("joy", 0) * 50) +
            (averaged_emotions.get("love", 0) * 20) +
            (averaged_emotions.get("surprise", 0) * 10) -
            (averaged_emotions.get("sadness", 0) * 30) -
            (averaged_emotions.get("anger", 0) * 25) -
            (averaged_emotions.get("fear", 0) * 20)
        )
        wellbeing_score = max(0, min(100, round(wellbeing_score)))
    
    return averaged_emotions, top_emotion, wellbeing_score