import functions_framework
from google.cloud import texttospeech
import base64

@functions_framework.http
def text_to_speech(request):
    # Parse JSON body from the request
    request_json = request.get_json()
    if not request_json or 'text' not in request_json:
        return 'No text provided', 400

    text_input = request_json['text']

    # Initialize Google Text-to-Speech client
    client = texttospeech.TextToSpeechClient()

    # Set the text input for synthesis
    synthesis_input = texttospeech.SynthesisInput(text=text_input)

    # Configure voice parameters: language and gender
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )

    # Configure audio output format (MP3)
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    # Perform the text-to-speech request
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # Encode the resulting audio content as base64 string
    audio_content = base64.b64encode(response.audio_content).decode('utf-8')

     # Return the audio content in JSON response
    return {'audio_base64': audio_content}