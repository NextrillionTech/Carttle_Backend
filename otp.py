import pyrebase
import firebase_admin
from firebase_admin import credentials, auth

# Firebase configuration
config = {
   {
  "project_info": {
    "project_number": "943272033714",
    "project_id": "carttle-506da",
    "storage_bucket": "carttle-506da.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:943272033714:android:c5e3c7d2abaeda8ec138ab",
        "android_client_info": {
          "package_name": "com.app.carttle"
        }
      },
      "oauth_client": [],
      "api_key": [
        {
          "current_key": "AIzaSyAV7rvPbaEUhWZ7OcEwotjx9StYPq7nNOg"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
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

# Function to verify OTP
def verify_otp(verification_id, verification_code):
    try:
        user = auth_pyrebase.verify_verification_code(verification_id, verification_code)
        print("OTP verified successfully!")
        return user
    except Exception as e:
        print(f"Error verifying OTP: {e}")

# Example usage
phone_number = "+91 9689831772"  # Replace with the actual phone number
verification_id = send_otp(phone_number)

# Wait for the user to input the verification code they received
verification_code = input("Enter the OTP sent to your phone: ")
user = verify_otp(verification_id, verification_code)

if user:
    print("User authenticated successfully!")
