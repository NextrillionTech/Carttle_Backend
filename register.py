from pymongo import MongoClient
import getpass

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["login_database"]
collection = db["users"]

def register_user():
    phone_number = input("Enter phone number: ")
    password = getpass.getpass("Enter password: ")
    
    # Check if user already exists
    if collection.find_one({"phNum": phone_number}):
        print("Phone number already registered! Please choose a different phone number.")
    else:
        user_data = {
            "phNum": phone_number,
            "password": password
        }
        collection.insert_one(user_data)
        print("User registered successfully!")

def login_user():
    phone_number = input("Enter phone number: ")
    password = getpass.getpass("Enter password: ")
    
    user = collection.find_one({"phNum": phone_number, "password": password})
    
    if user:
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