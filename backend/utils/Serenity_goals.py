from transformers import pipeline

# ✅ Load a better multi-label emotion model
print("Loading AI model for improved multi-emotion analysis...")
emotion_pipeline = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)

# 📌 Function to Analyze ALL Emotions (Fixes Single-Emotion Bias)
def analyze_emotions(text):
    results = emotion_pipeline(text)[0]  # Get all emotion scores

    print("\n🔍 **Emotion Analysis:**")
    for result in results:
        emotion = result['label']
        score = result['score']
        print(f"{emotion.capitalize()}: {score:.2f}")

# 📌 Main Loop for User Input
if __name__ == "__main__":
    print("\n💬 AI Emotion Journal")
    journal_entry = input("✍️ Enter your journal entry: ")

    # Analyze the text
    analyze_emotions(journal_entry)