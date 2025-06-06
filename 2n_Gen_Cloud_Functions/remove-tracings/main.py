import functions_framework
from google.cloud import firestore
from datetime import datetime

db = firestore.Client()

@functions_framework.http
def delete_daily_tracing(request):
    today = datetime.now().date()
    users_ref = db.collection('users')
    users = users_ref.stream()

    for user in users:
        print(f"Looking for {user.to_dict().get('name', user.id)}'s collections to be removed.")
        user_ref = users_ref.document(user.id)
        collections = user_ref.collections()

        for col in collections:
            col_name = col.id
            print(f"Collection found: {col_name}.")
            col_date = None
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                try:
                    col_date = datetime.strptime(col_name, fmt).date()
                    break
                except ValueError:
                    continue

            if not col_date:
                continue

            if col_date < today:
                for doc in col.stream():
                    col.document(doc.id).delete()

    return ('Old tracing documents deleted', 200)