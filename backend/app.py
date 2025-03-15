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
import Garmin_API
from google import genai
import csv
from datetime import datetime
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) 

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
        writer.writerow(["timestamp", "user_id", "content", "activities", "tone_analysis", "wellbeing_score"])


@app.route("/api/wellbeing-scores-last-7-days", methods=["GET"])
def get_wellbeing_scores_last_7_entries():
    """
    Endpoint to fetch the wellbeing scores for the last 7 entries.
    """
    try:
        # Read the journal entries from the CSV file
        with open(JOURNAL_CSV_PATH, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            entries = list(reader)
        
        # Get the last 7 entries
        last_7_entries = entries[-7:]  # Slice the last 7 entries
        
        # Extract wellbeing scores for the last 7 entries
        wellbeing_scores = []
        for entry in last_7_entries:
            wellbeing_scores.append({
                "wellbeing_score": int(entry["wellbeing_score"]),
                "date": entry["timestamp"]
            })
        
        # If there are fewer than 7 entries, pad the response with 0s for missing entries
        while len(wellbeing_scores) < 7:
            wellbeing_scores.insert(0, {"wellbeing_score": 0, "date": "N/A"})
        
        # Return the wellbeing scores for the last 7 entries
        return jsonify(wellbeing_scores), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/wellbeing-score", methods=["GET"])
def get_wellbeing_score():
    """
    Endpoint to fetch the most recent wellbeing score.
    """
    try:
        # Read the journal entries from the CSV file
        with open(JOURNAL_CSV_PATH, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            entries = list(reader)
        
        # Get the most recent entry
        if entries:
            most_recent_entry = entries[-1]  # Last entry in the list
            wellbeing_score = int(most_recent_entry["wellbeing_score"])
            return jsonify({"wellbeing_score": wellbeing_score}), 200
        else:
            return jsonify({"error": "No journal entries found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_wellbeing_score(emotions):
    """Calculate wellbeing score based on emotions."""
    wellbeing_score = 50
    if emotions:
        wellbeing_score += (
            (emotions.get("joy", 0) * 50) +
            (emotions.get("love", 0) * 20) +
            (emotions.get("surprise", 0) * 10) -
            (emotions.get("sadness", 0) * 30) -
            (emotions.get("anger", 0) * 25) -
            (emotions.get("fear", 0) * 20)
        )
        wellbeing_score = max(0, min(100, round(wellbeing_score)))
    return wellbeing_score

def analyze_emotions(text):
    """Analyze emotions from text and return the results."""
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

    wellbeing_score = calculate_wellbeing_score(averaged_emotions)

    return {
        "averaged_emotions": averaged_emotions,
        "top_emotion": top_emotion,
        "wellbeing_score": wellbeing_score
    }

@app.route("/api/journal-entries", methods=["GET"])
def get_journal_entries():
    """
    Endpoint to fetch all journal entries from the CSV file.
    """
    try:
        # Read the journal entries from the CSV file
        with open(JOURNAL_CSV_PATH, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            entries = list(reader)
        
        # Format the entries for the frontend
        formatted_entries = []
        for entry in entries:
            formatted_entries.append({
                "id": entry["timestamp"],  # Use timestamp as a unique ID
                "date": entry["timestamp"],  # Use timestamp for date
                "content": entry["content"],
                "activities": entry["activities"].split(", ") if entry["activities"] else [],  # Convert activities to list
                "wellbeing_score": int(entry["wellbeing_score"]),
                "tone_analysis": entry["tone_analysis"],
            })
        
        # Return the formatted entries
        return jsonify(formatted_entries), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/save-journal-entry", methods=["POST"])
def save_journal_entry():
    # Get data from the request
    data = request.json
    if not data or "user_id" not in data:
        return jsonify({"error": "Missing 'user_id' in request"}), 400
    
    user_id = data["user_id"]
    timestamp = datetime.now().isoformat()  # Current timestamp in ISO format

    # Handle voice journal entry
    if "audio" in request.files:
        audio_file = request.files["audio"]
        audio_path = "temp_audio.wav"
        audio_file.save(audio_path)

        try:
            # Perform transcription
            transcription = transcribe_audio(audio_path)
            
            # Perform tone analysis
            tone_analysis = analyze_voice_tone(audio_path)
            
            # Perform emotion analysis on transcribed text
            emotion_results = analyze_emotions(transcription)
            wellbeing_score = calculate_wellbeing_score(emotion_results["averaged_emotions"])
            
            # Extract activities from the transcribed text
            activities = extract_activities(transcription)
            
            # Append the entry to the CSV file
            with open(JOURNAL_CSV_PATH, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([timestamp, user_id, transcription, ", ".join(activities), str(tone_analysis), wellbeing_score])
            
            return jsonify({
                "message": "Voice journal entry saved successfully",
                "transcription": transcription,
                "tone_analysis": tone_analysis,
                "emotion_analysis": emotion_results,
                "wellbeing_score": wellbeing_score,
                "identified_activities": activities
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)
    
    # Handle text journal entry
    elif "journal_entry" in data:
        journal_entry = data["journal_entry"]
        
        try:
            # Perform emotion analysis on text
            emotion_results = analyze_emotions(journal_entry)
            wellbeing_score = calculate_wellbeing_score(emotion_results["averaged_emotions"])
            
            # Extract activities from the text
            activities = extract_activities(journal_entry)
            
            # Append the entry to the CSV file
            with open(JOURNAL_CSV_PATH, mode='a', newline='') as file:
                writer = csv.writer(file)
                writer.writerow([timestamp, user_id, journal_entry, ", ".join(activities), "", wellbeing_score])
            
            return jsonify({
                "message": "Text journal entry saved successfully",
                "emotion_analysis": emotion_results,
                "wellbeing_score": wellbeing_score,
                "identified_activities": activities
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    else:
        return jsonify({"error": "Missing 'audio' or 'journal_entry' in request"}), 400

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
    emotion_results = analyze_emotions(text)
    
    return jsonify({"emotion_analysis": emotion_results})

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

@app.route("/analyze-activity-impact", methods=["POST"])
def analyze_activity_impact():
    try:
        # Read the journal entries from the CSV file
        with open(JOURNAL_CSV_PATH, mode='r', newline='') as file:
            reader = csv.DictReader(file)
            entries = list(reader)
        
        # Calculate the baseline wellbeing score (average across all days)
        total_wellbeing = 0
        num_entries = len(entries)
        for entry in entries:
            total_wellbeing += float(entry["wellbeing_score"])
        baseline_wellbeing = total_wellbeing / num_entries if num_entries > 0 else 0
        
        # Create a dictionary to store activity impact data
        activity_impact = {}
        
        # Process each entry
        for entry in entries:
            activities = entry["activities"].split(", ") if entry["activities"] else []
            wellbeing_score = float(entry["wellbeing_score"])
            
            for activity in activities:
                if activity not in activity_impact:
                    activity_impact[activity] = {
                        "total_score": 0,
                        "count": 0
                    }
                activity_impact[activity]["total_score"] += wellbeing_score
                activity_impact[activity]["count"] += 1
        
        # Calculate the impact multiplier for each activity
        ranked_activities = []
        for activity, data in activity_impact.items():
            average_wellbeing = data["total_score"] / data["count"]
            impact_multiplier = average_wellbeing / baseline_wellbeing if baseline_wellbeing != 0 else 1
            ranked_activities.append({
                "activity": activity,
                "impact_multiplier": round(impact_multiplier, 2)
            })
        
        # Sort activities by impact multiplier (from highest to lowest)
        ranked_activities.sort(key=lambda x: x["impact_multiplier"], reverse=True)
        
        return jsonify({
            "baseline_wellbeing": round(baseline_wellbeing, 2),
            "ranked_activities": ranked_activities
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)

