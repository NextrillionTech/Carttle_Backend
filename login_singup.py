from pymongo import MongoClient
import getpass
import bcrypt

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["login_database"]
registered_users_collection = db["registered_users"]
login_attempts_collection = db["login_attempts"]

def register_user():
    name = input("Enter your name: ")
    phone_number = input("Enter phone number: ")
    location = input("Enter your location: ")
    password = getpass.getpass("Enter password: ")
    
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

if _name_ == "_main_":
    main()