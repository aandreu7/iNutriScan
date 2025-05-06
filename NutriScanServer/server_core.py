from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import base64
import ast

app = Flask(__name__)
CORS(app)

@app.route("/scan-food", methods=["POST"])
def scan_food():
    # Ensures the image is part of the message
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    # Gets the image from the request
    image_file = request.files["image"]

    # Ensures the image is a valid file type
    extension = os.path.splitext(image_file.filename)[1].lower()
    ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg']
    if extension not in ALLOWED_EXTENSIONS:
        return jsonify({"error": "Invalid file type. Only .png, .jpg, and .jpeg are allowed"}), 400

    # Reads the image file and converts it to base64
    image_bytes = image_file.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    # Ensures the image is not too large
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
    if len(image_bytes) > MAX_FILE_SIZE:
        return jsonify({"error": "File size exceeds the limit of 20 MB"}), 400

    # Creates prompt
    prompt = (
        "Your task is to return only the specific names of foods that are clearly visible in the image. "
        "Do not explain. Do not add context. Do not say things like 'It looks like'. "
        "Just return a clean list of food names, such as: ['Pizza', 'Sushi']."
        "Using the classical list format: [ 'item1', 'item2', ... ]."
        "If no food is visible, return empty list '[]'."
    )

    # Creates Gemini Pro Vision client
    model = genai.GenerativeModel("gemini-1.5-flash")

    # Calls Gemini Pro Vision API
    try:
        response = model.generate_content(
            contents=[
                {
                    "role": "user", 
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type":"image/"+extension[1:],"data": image_base64}}
                    ]
                }
            ]
        )
    except Exception as e:
        return jsonify({"error": "Error processing the image: " + str(e)}), 500

    # Extracts food items from the response
    text = response.candidates[0].content.parts[0].text.strip()
    food_items = ast.literal_eval(text)

    # Ensures the response is valid
    if not isinstance(food_items, list) or not all(isinstance(item, str) for item in food_items):
        return jsonify({"error": "Invalid response from the model"}), 500

    # Returns response
    return jsonify({"food_items": food_items}), 200

if __name__ == '__main__':

    # Sets API keys
    load_dotenv(dotenv_path="./keys.env")
    google_api_key=os.getenv("GOOGLE_API_KEY")
    genai.configure(api_key=google_api_key)
    #os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "keys_inutriscan.json"

    # Runs the Flask application. Start the app, making it listen on all network interfaces (0.0.0.0) and port 5000
    app.run(host='0.0.0.0', port=5000) # HTTP