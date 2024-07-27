from flask import Flask, request, jsonify
from deepika.firebase_config import initialize_firebase, verify_user_token

app = Flask(__name__)

# Initialize Firebase
initialize_firebase()

@app.route('/verify-token', methods=['POST'])
def verify_token():
    data = request.json
    id_token = data.get('idToken')
    uid = verify_user_token(id_token)
    if uid:
        return jsonify({"status": "success", "uid": uid}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid token"}), 401

if __name__ == "__main__":
    app.run(debug=True)
