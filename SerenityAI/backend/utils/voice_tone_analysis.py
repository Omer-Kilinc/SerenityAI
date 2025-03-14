import os
from ibm_watson import ToneAnalyzerV3
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

def analyze_tone(text):
    # Set up IBM Watson Tone Analyzer client
    authenticator = IAMAuthenticator(os.getenv("IBM_TONE_ANALYZER_API_KEY"))
    tone_analyzer = ToneAnalyzerV3(
        version="2023-09-21",
        authenticator=authenticator
    )
    tone_analyzer.set_service_url(os.getenv("IBM_TONE_ANALYZER_URL"))

    # Analyze tone
    tone_analysis = tone_analyzer.tone(
        {"text": text},
        content_type="application/json"
    ).get_result()

    return tone_analysis