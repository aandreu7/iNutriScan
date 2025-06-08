import functions_framework
from google.cloud import firestore
from datetime import datetime

# Initialize Firestore client
db = firestore.Client()

@functions_framework.http
def delete_daily_tracing(request):
    # Get today's date
    today = datetime.now().date()

    # Get reference to the 'users' collection
    users_ref = db.collection('users')
    users = users_ref.stream()

    # Iterate through all user documents
    for user in users:
        print(f"Looking for {user.to_dict().get('name', user.id)}'s collections to be removed.")
        user_ref = users_ref.document(user.id)
        collections = user_ref.collections()

        # Iterate through each user's subcollections
        for col in collections:
            col_name = col.id
            print(f"Collection found: {col_name}.")
            col_date = None

            # Try to parse collection name as a date in accepted formats
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                try:
                    col_date = datetime.strptime(col_name, fmt).date()
                    break
                except ValueError:
                    continue

            # Skip collections with non-date names
            if not col_date:
                continue

             # If the collection's date is before today, delete all its documents
            if col_date < today:
                for doc in col.stream():
                    col.document(doc.id).delete()

    # Return confirmation response
    return ('Old tracing documents deleted', 200)