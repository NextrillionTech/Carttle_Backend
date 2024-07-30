import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate("carttle-1104-firebase-adminsdk-3ud2p-b75eb8ccf4.json")
firebase_admin.initialize_app(cred)
