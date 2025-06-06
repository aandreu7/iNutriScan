import functions_framework
import base64
import os
from flask import Request, jsonify
import google.generativeai as genai
import ast

@functions_framework.http
def extract_food(request: Request):
    try:
        print("Request received")
        data = request.get_json()
        if not data or 'image' not in data:
            print("Message does not have any data")
            return jsonify({"error": "Missing 'image' in request"}), 400
        print("Message has data", data)

        image_base64 = data['image']
        #image_bytes = base64.b64decode(image_base64)
        
        print("Base64 string has been extracted:", image_base64)
        print("Configuring GenAI")

        genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

        # Prompt de instrucciones
        PROMPT = (
            "Your task is to return only the specific names of foods that are clearly visible in the image. "
            "Do not explain. Do not add context. Do not say things like 'It looks like'. "
            "Just return a clean list of food names, such as: ['Pizza', 'Sushi'].\n"
            "Using the classical list format: [ 'item1', 'item2', ... ].\n"
            "If no food is visible, return empty list '[]'."
        )

        model = genai.GenerativeModel("gemini-1.5-flash")

        print("GenAI call incoming")

        response = model.generate_content(
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {"text": PROMPT},
                        {"inline_data": {"mime_type":"image/jpeg", "data": image_base64}}
                    ]
                }
            ]
        )

        text = response.candidates[0].content.parts[0].text.strip()
        food_items = ast.literal_eval(text)

        print("Server is going to return:", food_items)
        return jsonify({"food_items": food_items}), 200

    except Exception as e:
        print("An error has occured:", str(e))
        return jsonify({"error": str(e)}), 500
    