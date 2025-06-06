import functions_framework
from flask import Request, jsonify
import os
import requests

# Environment variables
EXTRACT_FOOD_URL = os.environ.get("EXTRACT_FOOD_FROM_IMAGE_URL")
SPOONACULAR_API_KEY = os.environ["SPOONACULAR_API_KEY"]
SPOONACULAR_SEARCH_URL = "https://api.spoonacular.com/recipes/complexSearch"

@functions_framework.http
def get_recipe(request: Request):
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "Missing 'image' in request"}), 400

        image_base64 = data['image']

        # 1. Calls extract_food_from_image
        resp = requests.post(EXTRACT_FOOD_URL, json={"image": image_base64})
        if resp.status_code != 200:
            return jsonify({"error": "Error calling extract_food_from_image cloud function", "details": resp.text}), 500
        food_items = resp.json().get("food_items", [])

        # Spoonacular API setup
        params = {
            "includeIngredients": food_items,
            "number": 1,
            "addRecipeInformation": True,
            "apiKey": SPOONACULAR_API_KEY
        }
        
        # 2. Consults spoonacular
        response = requests.get(SPOONACULAR_SEARCH_URL, params=params)
        if response.status_code != 200:
            return jsonify({"error": f"Spoonacular API error: {response.text}"}), 500

        data = response.json()
        results = data.get("results", [])
        if not results:
            return jsonify({"recipe": None, "message": "No recipes found"}), 200

        recipe = results[0]
        result = {
            "id": recipe.get("id"),
            "title": recipe.get("title"),
            "image": recipe.get("image"),
            "summary": recipe.get("summary")
        }

        return jsonify({"recipe": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500