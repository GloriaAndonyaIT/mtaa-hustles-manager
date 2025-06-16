from flask import Flask, request, jsonify, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import secrets
from datetime import datetime, timedelta

user_bp = Blueprint('user', __name__)

# REGISTER USER
@user_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    


  #PASSWORD VALIDATION
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
     
    username_exists = User.query.filter_by(username=username).first()
    email_exists = User.query.filter_by(email=email).first()

    if username_exists:
        return jsonify({"error": "Username already exists"}), 400

    if email_exists:
        return jsonify({"error": "Email already exists"}), 400



    #PASSWORD HASHING
    hashed_password = generate_password_hash(password)
    
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"success": "User created successfully"}), 201




# USER LOGIN

@user_bp.route("/users/login", methods=["POST"])
def login_user():
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    # FIND USER BY USERNAME
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Check if password matches
    if not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Return user info (excluding password)
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    
    return jsonify({"success": "Login successful", "user": user_data}), 200

# get user by id
@user_bp.route("/users/<user_id>", methods=["GET"])
def fetch_user_by_id(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }
    return jsonify(user_data), 200

# get all users
@user_bp.route("/users", methods=["GET"])
def fetch_all_users():
    users = User.query.all()

    user_list = []
    for user in users:
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
        user_list.append(user_data)
    return jsonify(user_list), 200

# UPDATE USER PASSWORD
@user_bp.route("/users/<user_id>/password", methods=["PUT"])
def update_password(user_id):
    data = request.get_json()
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"error": "Current password and new password are required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # VERIFY CURRENT PASSWORD
    if not check_password_hash(user.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # UPDATE PASSWORD
    user.password = generate_password_hash(new_password)
    db.session.commit()
    
    return jsonify({"success": "Password updated successfully"}), 200

# PASSWORD RESET REQUEST
@user_bp.route("/users/password-reset/request", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    
   
    if not user:
        return jsonify({"success": "If the email exists, a reset link has been sent"}), 200
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_token_expires = datetime.utcnow() + timedelta(hours=1) 
    
    # Update user with reset token
    user.reset_token = reset_token
    user.reset_token_expires = reset_token_expires
    db.session.commit()
    
   
    print(f"Password reset token for {email}: {reset_token}")
    

    
    return jsonify({
        "success": "If the email exists, a reset link has been sent",
        "reset_token": reset_token 
    }), 200

# reset password with token
@user_bp.route("/users/password-reset/confirm", methods=["POST"])
def confirm_password_reset():
    data = request.get_json()
    
    reset_token = data.get("reset_token")
    new_password = data.get("new_password")
    
    if not reset_token or not new_password:
        return jsonify({"error": "Reset token and new password are required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400
    
    # Find user by reset token
    user = User.query.filter_by(reset_token=reset_token).first()
    
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400
    
    # Check if token is expired
    if user.reset_token_expires < datetime.utcnow():
        return jsonify({"error": "Reset token has expired"}), 400
    
    # # Update password and clear reset token
    # user.password = generate_password_hash(new_password)
    # user.reset_token = Non
    # user.reset_token_expires = None
    # db.session.commit()
    
    return jsonify({"success": "Password has been reset successfully"}), 200

# Optional: endpoint to check if reset token is valid
@user_bp.route("/users/password-reset/validate", methods=["POST"])
def validate_reset_token():
    data = request.get_json()
    reset_token = data.get("reset_token")
    
    if not reset_token:
        return jsonify({"error": "Reset token is required"}), 400
    
    user = User.query.filter_by(reset_token=reset_token).first()
    
    if not user or user.reset_token_expires < datetime.utcnow():
        return jsonify({"valid": False}), 200
    
    return jsonify({"valid": True}), 200




#UPDATE USER PROFILE
@user_bp.route("/users/<user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    
    username = data.get("username")
    email = data.get("email")
    
    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400
    
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Check for existing username or email
    if User.query.filter((User.username == username) & (User.id != user_id)).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter((User.email == email) & (User.id != user_id)).first():
        return jsonify({"error": "Email already exists"}), 400
    
    # Update user details
    user.username = username
    user.email = email
    db.session.commit()
    
    return jsonify({"success": "User updated successfully"}), 200


# DELETE USER
@user_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"success": "User deleted successfully"}), 200