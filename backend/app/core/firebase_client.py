
import firebase_admin
from firebase_admin import credentials, firestore

# TODO: Install the firebase-admin dependency: pip install firebase-admin

# Replace with the actual path to your service account key file
cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
