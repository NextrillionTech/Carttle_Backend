import pyrebase
import firebase_admin
from firebase_admin import credentials, auth

# Firebase configuration
config = {
    "apiKey": "AIzaSyAV7rvPbaEUhWZ7OcEwotjx9StYPq7nNOg",
    "authDomain": "carttle-506da.firebaseapp.com",
    "databaseURL": "https://carttle-506da.firebaseio.com",
    "storageBucket": "carttle-506da.appspot.com",
    "messagingSenderId": "943272033714",
    "appId": "1:943272033714:android:c5e3c7d2abaeda8ec138ab",
    "measurementId": "G-MEASUREMENT_ID"
}

# Initialize Pyrebase
firebase = pyrebase.initialize_app(config)
auth_pyrebase = firebase.auth()

# Initialize Firebase Admin SDK
cred = credentials.Certificate("carttle-506da-firebase-adminsdk-qp6ev-a2a9764c79.json")
firebase_admin.initialize_app(cred)

# Function to send OTP
def send_otp(phone_number):
    try:
        verification_id = auth_pyrebase.send_verification_code(phone_number)
        print(f"Verification code sent to {phone_number}")
        return verification_id
    except Exception as e:
        print(f"Error sending verification code: {e}")
        return None

# Function to verify OTP
def verify_otp(verification_id, verification_code):
    try:
        user = auth_pyrebase.verify_verification_code(verification_id, verification_code)
        print("OTP verified successfully!")
        return user
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return None

# Example usage
def main():
    phone_number = "+91 9689831772"  # Replace with the actual phone number
    verification_id = send_otp(phone_number)
    
    if not verification_id:
        print("Failed to send OTP")
        return
    
    # Wait for the user to input the verification code they received
    verification_code = input("Enter the OTP sent to your phone: ")
    user = verify_otp(verification_id, verification_code)
    
    if user:
        print("User authenticated successfully!")
    else:
        print("Failed to verify OTP")

if __name__ == "__main__":
    main()
