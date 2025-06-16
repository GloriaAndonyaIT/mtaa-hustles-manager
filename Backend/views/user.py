from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
import secrets
from datetime import datetime, timedelta
from flask_mail import Message, Mail

user_bp = Blueprint('user', __name__)

def get_mail():
    """Helper function to get mail instance from current app"""
    return current_app.extensions['mail']

# REGISTER USER
@user_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Basic field validation
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    # Password validation
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    
    # Email format validation
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Check for existing username/email
    username_exists = User.query.filter_by(username=username).first()
    email_exists = User.query.filter_by(email=email).first()

    if username_exists:
        return jsonify({"error": "Username already exists"}), 400

    if email_exists:
        return jsonify({"error": "Email already exists"}), 400

    try:
        # Hash password and create user
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password)
        
        # Add user to database
        db.session.add(new_user)
        db.session.commit()
        
        # Send welcome email after successful user creation
        mail = get_mail()
        msg = Message(
            subject="Welcome to Mtaa Hustles Manager",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Hello {username},\n\nThank you for registering on Mtaa Hustle Manager. Start your hustle management!\n\nBest regards,\nMtaa Hustle Manager Team"
        )
        mail.send(msg)
        
        return jsonify({"success": "User created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")  # For debugging
        return jsonify({"error": "Failed to register user or send welcome email"}), 500


# USER LOGIN
@user_bp.route("/users/login", methods=["POST"])
def login_user():
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    # Find user by username
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


# Email verification
@user_bp.route("/users/verify-email", methods=["POST"])
def verify_email():
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        # Generate verification token
        verification_token = secrets.token_urlsafe(32)
        
        # Update user with verification token
        user.verification_token = verification_token
        db.session.commit()
        
        # Send verification email
        mail = get_mail()
        msg = Message(
            subject="Email Verification",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Please verify your email by clicking the link: "
                 f"http://localhost:5000/users/verify-email/{verification_token}"
        )
        mail.send(msg)
        
        return jsonify({"success": "Verification email sent"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Email verification error: {str(e)}")
        return jsonify({"error": "Failed to send verification email"}), 500


# Email verification by token
@user_bp.route("/users/verify-email/<token>", methods=["GET"])
def verify_email_token(token):
    user = User.query.filter_by(verification_token=token).first()
    
    if not user:
        return jsonify({"error": "Invalid or expired verification token"}), 400
    
    try:
        # Mark user as verified
        user.is_verified = True
        user.verification_token = None
        db.session.commit()
        
        return jsonify({"success": "Email verified successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Email verification token error: {str(e)}")
        return jsonify({"error": "Failed to verify email"}), 500


# Get user by ID
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


# Get all users
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


# Update user password
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
    
    # Verify current password
    if not check_password_hash(user.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    try:
        # Update password
        user.password = generate_password_hash(new_password)
        db.session.commit()
        
        return jsonify({"success": "Password updated successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Password update error: {str(e)}")
        return jsonify({"error": "Failed to update password"}), 500


# Password reset request
@user_bp.route("/users/password-reset/request", methods=["POST"])
def request_password_reset():
    data = request.get_json()
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({"success": "If the email exists, a reset link has been sent"}), 200
    
    try:
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        # Update user with reset token
        user.reset_token = reset_token
        user.reset_token_expires = reset_token_expires
        db.session.commit()
        
        # In production, send email here instead of printing
        print(f"Password reset token for {email}: {reset_token}")
        
        return jsonify({
            "success": "If the email exists, a reset link has been sent",
            "reset_token": reset_token  # Remove this in production
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Password reset request error: {str(e)}")
        return jsonify({"error": "Failed to process password reset request"}), 500


# Reset password with token
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
    
    try:
        # Update password and clear reset token
        user.password = generate_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        db.session.commit()
        
        return jsonify({"success": "Password has been reset successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Password reset confirm error: {str(e)}")
        return jsonify({"error": "Failed to reset password"}), 500


# Update user profile
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
    
    try:
        # Update user details
        user.username = username
        user.email = email
        db.session.commit()
        
        # Send profile update notification email
        mail = get_mail()
        msg = Message(
            subject="Alert! Profile Update",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Hello {user.username},\n\nYour profile has been updated successfully.\n\nBest regards,\nMtaa Hustle Manager Team"
        )
        mail.send(msg)
        
        return jsonify({"success": "User updated successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"User update error: {str(e)}")
        return jsonify({"error": "Failed to update user profile"}), 500


# Delete user
@user_bp.route("/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"success": "User deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"User deletion error: {str(e)}")
        return jsonify({"error": "Failed to delete user"}), 500


# Delete user email (this endpoint seems unusual - consider if it's really needed)
@user_bp.route("/users/<user_id>/delete-email", methods=["DELETE"])
def delete_user_email(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if not user.email:
        return jsonify({"error": "User has no email to delete"}), 400
    
    try:
        # Send notification before deleting email
        mail = get_mail()
        msg = Message(
            subject="Alert! Email Deleted",
            recipients=[user.email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Hello {user.username},\n\nYour email has been deleted successfully.\n\nBest regards,\nMtaa Hustle Manager Team"
        )
        mail.send(msg)
        
        # Clear the user's email
        user.email = None
        db.session.commit()
        
        return jsonify({"success": "Email deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        print(f"Email deletion error: {str(e)}")
        return jsonify({"error": "Failed to send email deletion notification"}), 500