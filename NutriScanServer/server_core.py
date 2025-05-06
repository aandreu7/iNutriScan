from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from google.cloud import vision

app = Flask(__name__)

@app.route("/scan-food", methods=["POST"])
def scan_food():
    # Ensures the image is part of the message
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    # Reads the image from the request
    image_file = request.files["image"]

    # Ensures the image is a valid file type
    if not image_file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({"error": "Invalid file type. Only .png, .jpg, and .jpeg are allowed"}), 400

    # Reads image
    image_file = request.files["image"]
    content = image_file.read()

    # Creates Cloud Vision client
    client = vision.ImageAnnotatorClient()

    # Creates an instance of Cloud Vision Image, which includes user's image
    image = vision.Image(content=content)

    # Calls Cloud Vision API
    response = client.label_detection(image=image)

    # Ensures response
    if response.error.message:
        return jsonify({"error": response.error.message}), 500

    # Filters labels related to food
    food_labels = [
        label.description for label in response.label_annotations
        #if "food" in label.description.lower() or "dish" in label.description.lower()
    ]

    return jsonify({"food_items": food_labels})

if __name__ == '__main__':

    # Sets API keys
    #load_dotenv(dotenv_path="./keys.env")
    #google_api_key=os.getenv("GOOGLE_API_KEY")
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "keys_inutriscan.json"

    # Runs the Flask application. Start the app, making it listen on all network interfaces (0.0.0.0) and port 5000
    app.run(host='0.0.0.0', port=5000) # HTTP