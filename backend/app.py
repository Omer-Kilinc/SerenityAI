from flask import Flask, request, jsonify
import os
import re
from dotenv import load_dotenv
from transformers import pipeline
from utils.transcription import transcribe_audio
from utils.opensmile_analysis import analyze_voice_tone
from utils.audio_preprocessing import preprocess_audio
from utils.opensmile_analysis import extract_opensmile_features, predict_emotion
from utils.hatman_model import classify_audio
from utils.emotion_utils import combine_results, LABEL_MAPPING
from utils.transcription import transcribe_audio
from utils.activity_detector import extract_activities
#from utils.opensmile_analysis import analyze_voice_tone
import Garmin_API
from google import genai
import csv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Load AI model for text-based emotion detection

emotion_pipeline = pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=None)

# Ensure the data directory exists
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
os.makedirs(DATA_DIR, exist_ok=True)

# Path to the CSV file
JOURNAL_CSV_PATH = os.path.join(DATA_DIR, 'journal_entries.csv')

# Create the CSV file with headers if it doesn't exist
if not os.path.exists(JOURNAL_CSV_PATH):
    with open(JOURNAL_CSV_PATH, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["timestamp", "user_id", "journal_entry"])

@app.route("/save-journal-entry", methods=["POST"])
def save_journal_entry():
    # Get data from the request
    data = request.json
    if not data or "user_id" not in data or "journal_entry" not in data:
        return jsonify({"error": "Missing 'user_id' or 'journal_entry' in request"}), 400
    
    # Extract fields
    user_id = data["user_id"]
    journal_entry = data["journal_entry"]
    timestamp = datetime.now().isoformat()  # Current timestamp in ISO format

    # Extract activities from the journal entry
    activities = extract_activities(journal_entry)
    
    # Append the entry to the CSV file
    try:
        with open(JOURNAL_CSV_PATH, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow([timestamp, user_id, journal_entry, ", ".join(activities)])
        
        return jsonify({
            "message": "Journal entry saved successfully",
            "identified_activities": activities
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Gemini Handling For Custom Querys
def GeminiCustom(query):
    return Garmin_API.client.models.generate_content(
        model = 'gemini-2.0-pro-exp-02-05', 
        contents = query)

# Function to split text into sentences (without using NLTK)
def split_sentences(text):
    sentences = re.split(r'(?<=[.!?]) +', text)  # Splits at `.`, `!`, `?` followed by a space
    return sentences

@app.route("/analyze-text", methods=["POST"])
def analyze_text_emotions():
    data = request.json
    if "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    
    text = data["text"]
    sentences = re.split(r'(?<=[.!?]) +', text)  # Splitting text into sentences
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
    
    return jsonify({
        "averaged_emotions": averaged_emotions,
        "top_emotion": top_emotion,
        "wellbeing_score": wellbeing_score,
        "Generated Questions": GeminiCustom(f'Generate 1-5 goals for the user to improve their wellbeing score and have a better day tomorrow. The users log : {text} .')
    }), 200


    
 

# Route for analyzing voice
@app.route("/analyze-voice", methods=["POST"])
def analyze_voice():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]
    audio_path = "temp_audio.wav"
    audio_file.save(audio_path)

    try:
        # Perform transcription
        transcription = transcribe_audio(audio_path)
        
        # Perform emotion analysis
        result_1 = classify_audio(audio_path)
        opensmile_features = extract_opensmile_features(audio_path)
        result_2 = predict_emotion(opensmile_features)
        combined_emotions = combine_results(result_1, result_2, LABEL_MAPPING)
        
        return jsonify({
            "transcription": transcription,
            "audio_emotion_analysis": combined_emotions,
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

# Route for Gemini Generate Questions Based on Log
@app.route("/generate-questions", methods=["POST"])
def generateQuestions():
    data = request.json
    if "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400
    
    text = data["text"]
    
    return jsonify({"Generated Questions": GeminiCustom(f'Generate 1-5 follow up questions about the users log to further the understanding of the clients emotions, activities throughout the day and stress levels. Keep the questions engaging and brief. The users log : {text} .')})

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
            return jsonify({'Custom': GeminiCustom(data['Custom Query'])})
        else:
            return jsonify({'Error': 'No String Provided For Query'})
            
    
# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)