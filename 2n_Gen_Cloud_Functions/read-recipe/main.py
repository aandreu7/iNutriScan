import functions_framework
from google.cloud import texttospeech
import base64

@functions_framework.http
def text_to_speech(request):
    request_json = request.get_json()
    if not request_json or 'text' not in request_json:
        return 'No text provided', 400

    text_input = request_json['text']

    client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=text_input)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )

    # Encode MP3 to base64 so it can be returned as a string
    audio_content = base64.b64encode(response.audio_content).decode('utf-8')

    return {'audio_base64': audio_content}

