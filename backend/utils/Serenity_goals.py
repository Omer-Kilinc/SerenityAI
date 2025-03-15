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
    
    # Determine the emotion with the highest value
    top_emotion = max(averaged_emotions, key=averaged_emotions.get) if averaged_emotions else None

    wellbeing_score = 50
    if averaged_emotions:
        wellbeing_score += (
            (averaged_emotions.get("joy", 0) * 50) +  # Joy increases score up to 100
            (averaged_emotions.get("love", 0) * 20) +  # Love provides a positive boost
            (averaged_emotions.get("surprise", 0) * 10) -  # Surprise has a minor effect
            (averaged_emotions.get("sadness", 0) * 30) -  # Sadness decreases score
            (averaged_emotions.get("anger", 0) * 25) -  # Anger has a strong negative impact
            (averaged_emotions.get("fear", 0) * 20)  # Fear has a moderate negative effect
        )
        wellbeing_score = max(0, min(100, round(wellbeing_score)))  # Ensure score is between 0 and 100

    # return averaged_emotions

    print(averaged_emotions)
    print(top_emotion)
    print(wellbeing_score)

analyze_text_emotions("Today was one of those days that felt longer than it actually was. I woke up late, rushed through my morning routine, and barely made it to my meeting on time. I hate feeling unprepared, and I could tell my presentation wasn’t as smooth as I wanted it to be. That kind of set the tone for the rest of the day—just slightly off balance, like I was always playing catch-up. At lunch, I finally had a moment to breathe. I grabbed a sandwich from my favorite café and sat outside for a bit. It was nice, just watching people go about their day, but I couldn’t shake this weird feeling of frustration. I don’t know if it was because of my rough start or just one of those moods that come out of nowhere. In the evening, I went for a walk to clear my head. The sky had that soft golden glow before sunset, and for a moment, everything felt peaceful. I ran into an old friend I hadn’t seen in years, and we stood there talking for way longer than I expected. It reminded me how nice it is to just slow down and connect with people. Now, I’m sitting here, writing this, and I feel a little better. It wasn’t a perfect day, but I guess not every day has to be. Some days just exist in the in-between—not great, not terrible, just a mix of small frustrations and quiet moments. And maybe that’s okay.")