from transformers import pipeline
import re

print("Loading AI model for sentence-by-sentence emotion analysis...")
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
    return averaged_emotions

