from flask import Flask, request, jsonify
import os
import re
from dotenv import load_dotenv
from transformers import pipeline
from utils.transcription import transcribe_audio
from utils.opensmile_analysis import analyze_voice_tone
import Garmin_API

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Load AI model for text-based emotion detection
print("Loading AI model for sentence-by-sentence emotion analysis...")
emotion_pipeline = pipeline("text-classification", model="joeddav/distilbert-base-uncased-go-emotions-student", return_all_scores=True)

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

    averaged_emotions = {emotion: score / sentence_count for emotion, score in emotion_totals.items()} if sentence_count > 0 else {}
    return averaged_emotions

# Route for analyzing voice
@app.route("/analyze-voice", methods=["POST"])
def analyze_voice():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    audio_path = "temp_audio.wav"
    audio_file.save(audio_path)

    try:
        transcription = transcribe_audio(audio_path)
        tone_analysis = analyze_voice_tone(audio_path)
        emotion_results = analyze_text_emotions(transcription)

        return jsonify({
            "transcription": transcription,
            "tone_analysis": tone_analysis,
            "emotion_analysis": emotion_results
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

# Route for text-based emotion analysis
@app.route("/analyze-text", methods=["POST"])
def analyze_text():
    data = request.json
    if "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    
    text = data["text"]
    emotion_results = analyze_text_emotions(text)
    
    return jsonify({"emotion_analysis": emotion_results})

# Route for Gemini Based Garmin Watch Analysis
@app.route("/analyze-Garmin", methods=["POST"])
def analyze_Garmin():

    data = request.json   # json should be {'requestType' : int , 'Custom' : 'somestring'}

    if data['requestType'] == 1:
        return jsonify({'Sleep' : Garmin_API.GetSleepReply()})
    
    elif data['requestType'] == 2:
        return jsonify({'Heart Rate' : Garmin_API.GetBPMReply()})
    
    elif data['requestType'] == 3:
        return jsonify({'Activity' : Garmin_API.GetActivityReply()})
    
    elif data['requestType'] == 4:
        return jsonify({'Stress Level' : Garmin_API.GetStressReply()})
    
    else:
        if data['Custom Query'] != '' :
            return jsonify({'Custom': Garmin_API.CustomReply(data['Custom Query'])})
        else:
            return jsonify({'Error': 'No String Provided For Query'})
            
    
# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)