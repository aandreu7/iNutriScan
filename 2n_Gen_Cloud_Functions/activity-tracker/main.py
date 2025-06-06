import json
import time
import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from flask import Request, make_response
from google.cloud import firestore

db = firestore.Client()

def activity_tracker(request: Request):
    # Handle CORS preflight request
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.set('Access-Control-Max-Age', '3600')
        return response

    try:
        # Get the access token and user_id
        request_json = request.get_json(silent=True)
        if not request_json or 'access_token' not in request_json or 'user_id' not in request_json:
            response = make_response("Missing 'access_token' or 'user_id' in request body", 400)
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response

        access_token = request_json['access_token']
        user_id = request_json['user_id']

        creds = Credentials(token=access_token)
        fitness_service = build('fitness', 'v1', credentials=creds)

        # Get current time and midnight (00:00) of today in local time
        now = datetime.datetime.now()
        midnight = datetime.datetime.combine(now.date(), datetime.time.min)

        # Convert both to milliseconds since epoch
        start_time_millis = int(midnight.timestamp() * 1000)
        end_time_millis = int(time.time() * 1000)

        request_body = {
            "aggregateBy": [
                {"dataTypeName": "com.google.step_count.delta"},
                {"dataTypeName": "com.google.distance.delta"},
                {"dataTypeName": "com.google.calories.expended"},
                {"dataTypeName": "com.google.heart_rate.bpm"}
            ],
            "bucketByTime": {"durationMillis": 86400000},
            "startTimeMillis": start_time_millis,
            "endTimeMillis": end_time_millis
        }

        response_data = fitness_service.users().dataset().aggregate(userId='me', body=request_body).execute()
        
        # Extract burnt_kcal
        burnt_kcal = 0
        for bucket in response_data.get("bucket", []):
            for dataset in bucket.get("dataset", []):
                if "calories.expended" in dataset.get("dataSourceId", ""):
                    points = dataset.get("point", [])
                    if points:
                        for point in points:
                            values = point.get("value", [])
                            if values:
                                burnt_kcal = values[0].get("fpVal", 0)
                                
        burnt_kcal = round(burnt_kcal, 1)

        # Store burnt_kcal in Firestore
        user_ref = db.collection("users").document(user_id)
        today_date = datetime.datetime.now().date()
        existing_collections = list(user_ref.collections())
        updated = False

        for col in existing_collections:
            try:
                col_date = datetime.datetime.strptime(col.id, "%Y-%m-%dT%H:%M:%S").date()
                if col_date == today_date:
                    doc_ref = col.document("nutrients")
                    doc_ref.set({"burnt_kcal": burnt_kcal}, merge=True)
                    updated = True
                    break
            except ValueError:
                continue

        if not updated:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
            doc_ref = user_ref.collection(timestamp).document("nutrients")
            doc_ref.set({"burnt_kcal": burnt_kcal})

        response = make_response(json.dumps(response_data), 200)
        response.headers['Content-Type'] = 'application/json'
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except Exception as e:
        response = make_response(f"Error: {str(e)}", 500)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response