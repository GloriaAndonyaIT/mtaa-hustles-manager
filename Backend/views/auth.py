from flask import Flask, request, jsonify, Blueprint, current_app
from werkzeug.security import  check_password_hash
from models import db, User, TokenBlocklist
from flask_jwt_extended import create_access_token,get_jwt_identity, jwt_required, get_jwt
from datetime import datetime
from datetime import timezone

auth_bp = Blueprint('auth', __name__)



@auth_bp.route("/login", methods=["POST"])
def login():
    email = request.json.get("email", None)
    password = request.json.get("password", None)

    if not email or not password:
        return jsonify({"error": "email and password are required to login"}), 400
     
    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token)     

    else:
        return jsonify({"error": "User does not exists"}), 400
    


#  fetching logged in user
@auth_bp.route("/current_user", methods=["GET"])
@jwt_required()
def fetch_current_user():
    current_user_id = get_jwt_identity()

    user = User.query.get(current_user_id)

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




# Logout
@auth_bp.route("/logout", methods=["DELETE"])
@jwt_required()
def modify_token():
    jti = get_jwt()["jti"]
    now = datetime.now(timezone.utc)

    new_blocked_token =TokenBlocklist(jti=jti, created_at=now)
    db.session.add(new_blocked_token)
    db.session.commit()
    return jsonify({"success": "Successfully logged out"}), 200