import os
from google.cloud import speech_v1p1beta1 as speech

def transcribe_audio(audio_path):
    # Set up Google Cloud client
    client = speech.SpeechClient.from_service_account_json(
        os.getenv("GOOGLE_CLOUD_CREDENTIALS")
    )

    # Read the audio file
    with open(audio_path, "rb") as audio_file:
        content = audio_file.read()

    # Configure the audio file
    audio = speech.RecognitionAudio(content=content)
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
    )

    # Transcribe the audio
    response = client.recognize(config=config, audio=audio)

    # Extract transcription
    transcription = ""
    for result in response.results:
        transcription += result.alternatives[0].transcript

    return transcription