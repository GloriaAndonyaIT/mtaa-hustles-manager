from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Hustle, Transaction, Debt, Goal
import secrets
from datetime import datetime, timedelta
from flask_mail import Message, Mail
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity, 
    create_access_token,
    create_refresh_token,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies
)

user_bp = Blueprint('user', __name__)

def get_mail():
    """Helper function to get mail instance from current app"""
    return current_app.extensions['mail']

def get_current_user():
    """Helper function to get current user from JWT"""
    try:
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id) if current_user_id else None
    except:
        return None

# REGISTER USER
@user_bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    is_admin = data.get("is_admin", False)

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
        new_user = User(
            username=username, 
            email=email, 
            password=hashed_password,
            is_admin=is_admin
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Send welcome email
        mail = get_mail()
        msg = Message(
            subject="Welcome to Mtaa Hustles Manager",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Hello {username},\n\nThank you for registering on Mtaa Hustle Manager.\n\nBest regards,\nMtaa Hustle Manager Team"
        )
        mail.send(msg)
        
        # Generate tokens for immediate login after registration
        access_token = create_access_token(identity=new_user.id)
        refresh_token = create_refresh_token(identity=new_user.id)
        
        return jsonify({
            "success": "User created successfully",
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": new_user.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Failed to register user"}), 500

# USER LOGIN WITH JWT TOKENS
@user_bp.route("/users/login", methods=["POST"])
def login_user():
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    
    if not check_password_hash(user.password, password):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Create tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    response = jsonify({
        "success": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    })
    
    # Set cookies if using cookie-based auth
    if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
    
    return response, 200

# USER LOGOUT
@user_bp.route("/users/logout", methods=["POST"])
def logout_user():
    response = jsonify({"success": "Logged out successfully"})
    
    if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
        unset_jwt_cookies(response)
    
    return response, 200

# REFRESH TOKEN
@user_bp.route("/users/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    current_user_id = get_jwt_identity()
    new_token = create_access_token(identity=current_user_id)
    
    response = jsonify({
        "success": "Token refreshed",
        "access_token": new_token
    })
    
    if current_app.config.get('JWT_TOKEN_LOCATION') == ['cookies']:
        set_access_cookies(response, new_token)
    
    return response, 200

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
        verification_token = secrets.token_urlsafe(32)
        user.verification_token = verification_token
        db.session.commit()
        
        mail = get_mail()
        msg = Message(
            subject="Email Verification",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Please verify your email by clicking: {current_app.config['FRONTEND_URL']}/verify-email/{verification_token}"
        )
        mail.send(msg)
        
        return jsonify({"success": "Verification email sent"}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Email verification error: {str(e)}")
        return jsonify({"error": "Failed to send verification email"}), 500

# Verify email with token
@user_bp.route("/users/verify-email/<token>", methods=["GET"])
def verify_email_token(token):
    user = User.query.filter_by(verification_token=token).first()
    
    if not user:
        return jsonify({"error": "Invalid or expired verification token"}), 400
    
    try:
        user.is_verified = True
        user.verification_token = None
        db.session.commit()
        
        return jsonify({"success": "Email verified successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Email verification error: {str(e)}")
        return jsonify({"error": "Failed to verify email"}), 500

# Get user profile
@user_bp.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def fetch_user_by_id(user_id):
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    if not current_user.is_admin and str(current_user.id) != str(user_id):
        return jsonify({"error": "Access denied"}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict_with_relations() if current_user.is_admin else user.to_dict()), 200

# [Include all your other existing endpoints here...]

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
        reset_token = secrets.token_urlsafe(32)
        reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        user.reset_token = reset_token
        user.reset_token_expires = reset_token_expires
        db.session.commit()
        
        mail = get_mail()
        msg = Message(
            subject="Password Reset Request",
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            body=f"Reset your password: {current_app.config['FRONTEND_URL']}/reset-password/{reset_token}"
        )
        mail.send(msg)
        
        return jsonify({"success": "Password reset link sent"}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password reset error: {str(e)}")
        return jsonify({"error": "Failed to process password reset"}), 500

# Confirm password reset
@user_bp.route("/users/password-reset/confirm", methods=["POST"])
def confirm_password_reset():
    data = request.get_json()
    
    reset_token = data.get("reset_token")
    new_password = data.get("new_password")
    
    if not reset_token or not new_password:
        return jsonify({"error": "Reset token and new password are required"}), 400
    
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400
    
    user = User.query.filter_by(reset_token=reset_token).first()
    
    if not user:
        return jsonify({"error": "Invalid or expired reset token"}), 400
    
    if user.reset_token_expires < datetime.utcnow():
        return jsonify({"error": "Reset token has expired"}), 400
    
    try:
        user.password = generate_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({"success": "Password has been reset successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password reset error: {str(e)}")
        return jsonify({"error": "Failed to reset password"}), 500