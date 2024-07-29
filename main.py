from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class LoginRequest(BaseModel):
    phone_number: str
    password: str

@app.post("/login")
async def login(request: LoginRequest):
    if request.phone_number == "9150210429" and request.password == "password123":
        return {"message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
