from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from utils.transcription import transcribe_audio
from utils.voice_tone_analysis import analyze_voice_tone

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route("/")
def index():
    return "Multi-Modal Journaling Backend"

@app.route("/analyze-voice", methods=["POST"])
def analyze_voice():
    # Check if audio file is provided
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    # Save the audio file temporarily
    audio_path = "temp_audio.wav"
    audio_file.save(audio_path)

    try:
        # Step 1: Transcribe audio to text (optional, if needed)
        #transcription = transcribe_audio(audio_path)

        # Step 2: Analyze voice tone (acoustic properties)
        tone_analysis = analyze_voice_tone(audio_path)

        # Return results
        return jsonify({
        #    "transcription": transcription,  # Optional
            "tone_analysis": tone_analysis  # Acoustic analysis
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Clean up: Delete the temporary audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)

if __name__ == "__main__":
    app.run(debug=True)