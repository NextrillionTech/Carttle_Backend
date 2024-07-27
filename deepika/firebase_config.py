import firebase_admin
from firebase_admin import credentials, auth

def initialize_firebase():
    # Path to the service account key file
    cred = credentials.Certificate(r'C:\Users\deepi\Desktop\Nextrillion Tech\Carttle_Backend\deepika\carttle--111104-firebase-adminsdk-dfqmw-879009c579.json')
    firebase_admin.initialize_app(cred)

def verify_user_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        return uid
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None
