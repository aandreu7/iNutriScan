import functions_framework
from flask import Request, jsonify
import os
import requests
from google.cloud import firestore
from datetime import datetime

# Initialize Firestore client
db = firestore.Client()

# Load environment variables
EXTRACT_FOOD_URL = os.environ.get("EXTRACT_FOOD_FROM_IMAGE_URL")
USDA_API_KEY = os.environ.get("USDA_API_KEY")
USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

def query_usda(food_name):
    """
    Looks for a food in USDA API and returns most important result nutrients.
    """
    params = {
        "api_key": USDA_API_KEY,
        "query": food_name,
        "pageSize": 1,
        "dataType": ["Foundation", "SR Legacy", "Branded"],
    }
    response = requests.get(USDA_SEARCH_URL, params=params)
    if response.status_code != 200:
        raise Exception(f"USDA API error: {response.status_code} - {response.text}")
    
    data = response.json()
    if not data.get("foods"):
        return None # No results found

    food = data["foods"][0] # Use the first result

    # Initialize nutrient structure with default values
    nutrients = {
        "kcal": 0,
        "protein_g": 0,
        "fat_g": 0,
        "carbohydrate_g": 0,
        "saturated_fat_g": 0,
        "fiber_g": 0,
        "cholesterol_mg": 0,
        "sugar_g": 0
    }

    # Parse each nutrient
    for nutrient in food.get("foodNutrients", []):
        name = nutrient.get("nutrientName", "").lower()
        amount = round(nutrient.get("value", 0), 1)
        unit = nutrient.get("unitName", "").lower()

        # Match relevant nutrients
        if ("energy" in name and ("kcal" in unit or "calorie" in name)):
            nutrients["kcal"] = amount
        elif "protein" in name:
            nutrients["protein_g"] = amount
        elif "fat" == name or "total lipid" in name:
            nutrients["fat_g"] = amount
        elif "saturated" in name:
            nutrients["saturated_fat_g"] = amount
        elif "carbohydrate" in name:
            nutrients["carbohydrate_g"] = amount
        elif "fiber" in name:
            nutrients["fiber_g"] = amount
        elif "cholesterol" in name:
            nutrients["cholesterol_mg"] = amount
        elif "sugar" in name:
            nutrients["sugar_g"] = amount

    return nutrients

@functions_framework.http
def extract_nutrients(request: Request):
    """
    Cloud Function entry point. Extracts foods from a base64-encoded image,
    queries nutrient info from the USDA API, and stores the totals in Firestore.
    """
    try:
        # Parse the request
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "Missing 'image' in request"}), 400
            
        user_id = data.get("user_id")
        if not user_id:
            return jsonify({"error": "Missing 'user_id' in request"}), 400

        image_base64 = data['image']

        # 1. Calls extract_food_from_image
        resp = requests.post(EXTRACT_FOOD_URL, json={"image": image_base64})
        if resp.status_code != 200:
            return jsonify({"error": "Error calling extract_food_from_image cloud function", "details": resp.text}), 500
        food_items = resp.json().get("food_items", [])
        
        # Initialize totals
        total_nutrients = {"kcal":0,"protein_g":0,"fat_g":0,"carbohydrate_g":0,"saturated_fat_g":0,"fiber_g":0,"cholesterol_mg":0,"sugar_g":0}

        if not food_items:
            return jsonify({
                "total_nutrients": total_nutrients,
                "breakdown": {},
                "message": "No foods detected"
            })

        breakdown = {}

        # 2. For each food, consult USDA and acumulate
        for food in food_items:
            nutrients = query_usda(food)
            if nutrients is None:
                # Default if no nutrient data is found
                nutrients = {"kcal":0,"protein_g":0,"fat_g":0,"carbohydrate_g":0,"saturated_fat_g":0,"fiber_g":0,"cholesterol_mg":0,"sugar_g":0}

            breakdown[food] = nutrients

            for key in total_nutrients:
                total_nutrients[key] += nutrients.get(key, 0)
            scanned_food_nutrients = {k: round(v, 1) for k, v in total_nutrients.items()}

        # 3. Store in Firestore
        user_ref = db.collection("users").document(user_id)
        existing_collections = list(user_ref.collections())
        today_date = datetime.now().date()

        updated = False

        # Check if a collection for today already exists
        for col in existing_collections:
            try:
                col_date = datetime.strptime(col.id, "%Y-%m-%dT%H:%M:%S").date()
                if col_date == today_date:
                    doc_ref = col.document("nutrients")
                    existing_data = doc_ref.get().to_dict()
                    if existing_data:
                        # If already exists, add today’s nutrients to existing values
                        for key in total_nutrients:
                            total_nutrients[key] += existing_data.get(key, 0)
                    rounded_total_nutrients = {k: round(v, 1) for k, v in total_nutrients.items()}
                    doc_ref.set(rounded_total_nutrients)
                    updated = True
                    break
            except ValueError:
                continue
        
        # If today's collection doesn't exist, create new one
        if not updated:
            timestamp = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            doc_ref = user_ref.collection(timestamp).document("nutrients")
            rounded_total_nutrients = {k: round(v, 1) for k, v in total_nutrients.items()}
            doc_ref.set(rounded_total_nutrients)   

        # Return result to client
        return jsonify({
            "total_nutrients": scanned_food_nutrients,
            "breakdown": breakdown
        })

    except Exception as e:
        # Catch and return any server-side error
        return jsonify({"error": str(e)}), 500