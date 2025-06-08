import functions_framework
import os
from flask import Flask, request, jsonify
from google.cloud import firestore
import google.generativeai as genai
import assemblyai as aai
import datetime

# Configures Generative AI client
aai.settings.api_key = os.environ['ASSEMBLYAI_API_KEY']

# Initialize Firestore client
db = firestore.Client()

# Cloud Function HTTP entry point
@functions_framework.http
def add_activity(request):
    # Extract userId from the request form data
    user_id = request.form.get('userId')
    if not user_id:
        return "Missing userId", 400

    print("Starting description processing...")

    # Ensure an audio file is provided in the request
    if 'file' not in request.files:
        return "No file (audio) part", 400
    file = request.files['file']

    # Check if file is named and not empty
    if file.filename == '':
        return "File has no name or is void", 400

    # Saves the audio file to the current working directory with the name "last_request"
    filename = file.filename
    _, ext = os.path.splitext(filename)
    save_path = os.path.join(os.getcwd(), f"last_request{ext}")
    file.save(save_path)
    print("File saved")

    # Transcribe audio using AssemblyAI
    try:
        config = aai.TranscriptionConfig(speech_model=aai.SpeechModel.best)
        transcript = aai.Transcriber(config=config).transcribe(save_path)
        if transcript.status == "error":
            raise RuntimeError(f"Transcription failed: {transcript.error}")
        print("Transcription:", transcript.text)
    except Exception as e:
        print("Speech-to-text failed:", str(e))
        return "Speech recognition failed", 500
    finally:
        # Clean up the saved file
        if os.path.exists(save_path):
            os.remove(save_path)

    # Retrieve physical data (age, height, weight, sex) from Firestore
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    physical_data = ""
    if user_doc.exists:
        data = user_doc.to_dict()
        age = data.get("age")
        height = data.get("height")
        weight = data.get("weight")
        sex = data.get("sex")
        info_parts = []
        if age: info_parts.append(f"Age: {age}")
        if height: info_parts.append(f"Height: {height} cm")
        if weight: info_parts.append(f"Weight: {weight} kg")
        if sex is not None: info_parts.append(f"Sex: {'male' if sex else 'female'}")
        physical_data = ", ".join(info_parts)

    # Create the prompt for Gemini AI model
    prompt_parts = [
        "You are a fitness expert.",
        "You need to make a realistic estimate of the calories the user burned performing the following activity.",
        "Take their physical data into account if it exists.",
        "Your answer must be solely and exclusively an integer number, with nothing else.",
    ]

    # Append physical data to the activity description if available
    user_input = transcript.text
    if physical_data:
        user_input += f" ({physical_data})"

    # Initialize Gemini model
    model = genai.GenerativeModel("gemini-1.5-flash")

    try:
        # Send prompt to Gemini to estimate burnt calories
        response = model.generate_content([
            {"role": "user", "parts": "\n".join(prompt_parts) + f"\nActivity: {user_input}"},
        ])
        
        print("LLM response: ", response.text)
        
        kcal_response = response.text.strip()

        # Validate that the response is a valid integer
        if not kcal_response.isdigit():
            raise ValueError("LLM did not answer with an integer number.")
        
        kcal_int = int(kcal_response)

        # Get current UTC timestamp and format date
        now = datetime.datetime.utcnow()
        today_str = now.strftime("%Y-%m-%d")  

        # Search for today's collection in Firestore for the user
        user_ref = db.collection("users").document(user_id)
        collections = user_ref.collections()
        today_collection_ref = None

        for col in collections:
            col_name = col.id  # Format: "2025-05-28T20:56:45"
            col_day = col_name.split("T")[0]
            if col_day == today_str:
                today_collection_ref = col
                break

        # Create new collection if one doesn't already exist for today
        if today_collection_ref is None:
            timestamp_full = now.strftime("%Y-%m-%dT%H:%M:%S")
            today_collection_ref = user_ref.collection(timestamp_full)

        # Access the "nutrients" document within the day's collection
        nutrients_doc_ref = today_collection_ref.document("nutrients")
        nutrients_doc = nutrients_doc_ref.get()

        if nutrients_doc.exists:
            # If nutrients doc exists, update the burnt_kcal field by adding the new kcal
            current_data = nutrients_doc.to_dict()
            current_burnt = current_data.get("burnt_kcal", 0)
            new_burnt = current_burnt + kcal_int
            nutrients_doc_ref.update({"burnt_kcal": new_burnt})
            print(f"Updated burnt_kcal from {current_burnt} to {new_burnt}")
        else:
            # If nutrients doc does not exist, create it with the new kcal value
            nutrients_doc_ref.set({"burnt_kcal": kcal_int})
            print(f"Created nutrients doc with burnt_kcal = {kcal_int}")

        # Return JSON response with estimated kcal and original activity description
        return jsonify({
            "kcal_estimated": kcal_int,
            "activity_description": transcript.text
        })

    except Exception as e:
        # Handle any errors from the Gemini API or Firestore
        print("Gemini API error:", str(e))
        return "Failed to estimate kcal with Gemini", 500