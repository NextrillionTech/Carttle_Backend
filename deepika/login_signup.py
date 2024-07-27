from pymongo import MongoClient
import getpass
import bcrypt
import re

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["login_database"]
registered_users_collection = db["registered_users"]
login_attempts_collection = db["login_attempts"]

def is_strong_password(password):
    # Check password length
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    
    # Check for uppercase letter
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    
    # Check for lowercase letter
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    
    # Check for digit
    if not re.search(r"\d", password):
        return False, "Password must contain at least one digit."
    
    # Check for special character
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."
    
    return True, ""

def register_user():
    name = input("Enter your name: ")
    phone_number = input("Enter phone number: ")
    location = input("Enter your location: ")
    
    while True:
        password = getpass.getpass("Enter password: ")
        is_strong, message = is_strong_password(password)
        
        if is_strong:
            break
        else:
            print("Weak password:", message)
    
    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Check if user already exists
    if registered_users_collection.find_one({"phNum": phone_number}):
        print("Phone number already registered! Please choose a different phone number.")
    else:
        user_data = {
            "name": name,
            "phNum": phone_number,
            "location": location,
            "password": hashed_password
        }
        registered_users_collection.insert_one(user_data)
        print("User registered successfully!")

def login_user():
    phone_number = input("Enter phone number: ")
    password = getpass.getpass("Enter password: ")
    
    login_attempt = {
        "phNum": phone_number,
        "password": password
    }
    login_attempts_collection.insert_one(login_attempt)
    
    user = registered_users_collection.find_one({"phNum": phone_number})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user["password"]):
        print("Login successful!")
    else:
        print("Invalid phone number or password.")

def main():
    while True:
        print("1. Register")
        print("2. Login")
        print("3. Exit")
        
        choice = input("Enter your choice: ")
        
        if choice == '1':
            register_user()
        elif choice == '2':
            login_user()
        elif choice == '3':
            break
        else:
            print("Invalid choice! Please try again.")

if __name__ == "__main__":
    main()
