import os
import requests
import time

# AssemblyAI API settings
ASSEMBLYAI_API_KEY = "b7f38fb72c5b4577b0ad6c80fcb0a448"
ASSEMBLYAI_UPLOAD_URL = "https://api.assemblyai.com/v2/upload"
ASSEMBLYAI_TRANSCRIPT_URL = "https://api.assemblyai.com/v2/transcript"

def upload_audio_to_assemblyai(audio_path):
    """Upload the audio file to AssemblyAI and return the upload URL."""
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
    }
    with open(audio_path, "rb") as audio_file:
        response = requests.post(ASSEMBLYAI_UPLOAD_URL, headers=headers, data=audio_file)
    
    if response.status_code != 200:
        raise Exception(f"Failed to upload audio: {response.text}")
    
    return response.json()["upload_url"]

def transcribe_audio(audio_path):
    """Transcribe audio using AssemblyAI."""
    # Step 1: Upload the audio file to AssemblyAI
    audio_url = upload_audio_to_assemblyai(audio_path)
    
    # Step 2: Submit the transcription request
    headers = {
        "authorization": ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
    }
    data = {
        "audio_url": audio_url,
        "language_code": "en",  # Optional: Specify language (default is English)
    }
    response = requests.post(ASSEMBLYAI_TRANSCRIPT_URL, headers=headers, json=data)
    
    if response.status_code != 200:
        raise Exception(f"Failed to submit transcription request: {response.text}")
    
    transcript_id = response.json()["id"]
    
    # Step 3: Poll for transcription completion
    while True:
        response = requests.get(f"{ASSEMBLYAI_TRANSCRIPT_URL}/{transcript_id}", headers=headers)
        status = response.json()["status"]
        
        if status == "completed":
            return response.json()["text"]
        elif status == "failed":
            raise Exception("Transcription failed")
        else:
            time.sleep(5)  # Wait 5 seconds before polling again