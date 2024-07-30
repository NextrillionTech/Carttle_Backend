from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import auth, credentials
import random
import time

app = FastAPI()

# Firebase Admin SDK initialization
cred = credentials.Certificate("carttle-1104-firebase-adminsdk-3ud2p-b75eb8ccf4.json")
firebase_admin.initialize_app(cred)

# Dummy user data (replace with a real database)
fake_users_db = {
    "9150210429": {
        "phone_number": "9150210429",
        "otp": None,
        "otp_timestamp": None
    }
}

class OTPRequest(BaseModel):
    phone_number: str

class OTPVerifyRequest(BaseModel):
    phone_number: str
    otp: str

def get_user(phone_number: str):
    return fake_users_db.get(phone_number)

@app.post("/request-otp")
async def request_otp(request: OTPRequest):
    user = get_user(request.phone_number)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Firebase Phone Authentication sends OTP directly
    try:
        # Generate a random OTP for demonstration purposes
        otp = str(random.randint(100000, 999999))
        user["otp"] = otp
        user["otp_timestamp"] = time.time()
        
        # Normally, you would use the Firebase Client SDK on the client-side to send the OTP.
        # Here, we're simulating the OTP sent via SMS.
        print(f"OTP for {request.phone_number} is {otp}")
    except Exception as e:
        print(f"Failed to send OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")

    return {"message": "OTP sent successfully"}

@app.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest):
    user = get_user(request.phone_number)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate the OTP
    if request.otp != user["otp"]:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    
    return {"message": "Login successful"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
