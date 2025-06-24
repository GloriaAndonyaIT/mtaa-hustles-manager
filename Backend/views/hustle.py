from flask import Flask, request, jsonify, Blueprint
from datetime import datetime
from models import db, Hustle, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import timedelta
import logging

hustle_bp = Blueprint('hustle', __name__)

# Helper Functions
def get_current_user():
    """Helper function to get current user from JWT"""
    current_user_id = get_jwt_identity()
    return User.query.get(current_user_id)

def is_admin_user(user_id):
    """Helper function to check if user is admin"""
    user = User.query.get(user_id)
    return user and user.is_admin

# CREATE HUSTLE
# CREATE HUSTLE - QUICK FIX (Remove location temporarily)
@hustle_bp.route("/hustles", methods=["POST"])
@jwt_required()
def create_hustle():
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({"error": "Invalid user"}), 401
            
        # Validate request data
        if not request.is_json:
            return jsonify({"error": "Missing JSON in request"}), 400
            
        data = request.get_json()
        
        # Required fields
        required_fields = ["title", "type", "description", "date"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": "Missing required fields",
                "missing": missing_fields
            }), 400
        
        # Validate date format
        try:
            hustle_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            if hustle_date < datetime.now().date():
                return jsonify({"error": "Date cannot be in the past"}), 400
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        
        # For admin users, allow assigning to other users
        user_id = current_user_id
        if current_user.is_admin and "user_id" in data:
            if not User.query.get(data["user_id"]):
                return jsonify({"error": "Specified user not found"}), 404
            user_id = data["user_id"]
        
        # Create new hustle - REMOVE LOCATION FOR NOW
        new_hustle = Hustle(
            title=data["title"],
            type=data["type"],
            description=data["description"],
            date=hustle_date,
            user_id=user_id
        )
        
        db.session.add(new_hustle)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "hustle": {
                "id": new_hustle.id,
                "title": new_hustle.title,
                "type": new_hustle.type,
                "description": new_hustle.description,
                "date": new_hustle.date.isoformat(),
                "user_id": new_hustle.user_id,
                "status": "active",
                "created_at": new_hustle.created_at.isoformat() if new_hustle.created_at else None
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in create_hustle: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500

# GET HUSTLE BY ID
@hustle_bp.route("/hustles/<int:hustle_id>", methods=["GET"])
@jwt_required()
def get_hustle(hustle_id):
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    hustle = Hustle.query.get(hustle_id)

    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404

    # Check if user owns this hustle or is admin
    if not current_user.is_admin and hustle.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({
        "hustle": {
            "id": hustle.id,
            "title": hustle.title,
            "type": hustle.type,
            "description": hustle.description,
            "date": hustle.date.isoformat(),
            "status": "active",
            "user_id": hustle.user_id,
            "created_at": hustle.created_at.isoformat() if hustle.created_at else None,
            "updated_at": hustle.updated_at.isoformat() if hustle.updated_at else None
        }
    }), 200

# GET ALL HUSTLES (User sees their own, Admin sees all)
@hustle_bp.route("/hustles", methods=["GET"])
@jwt_required()
def get_all_hustles():
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    # Admin can see all hustles, regular users see only their own
    if current_user.is_admin:
        hustles = Hustle.query.order_by(Hustle.created_at.desc()).all()
    else:
        hustles = Hustle.query.filter_by(user_id=current_user.id).order_by(Hustle.created_at.desc()).all()
    
    result = []
    for hustle in hustles:
        result.append({
            "id": hustle.id,
            "title": hustle.title,
            "type": hustle.type,
            "description": hustle.description,
            "date": hustle.date.isoformat(),
            "user_id": hustle.user_id,
            "username": hustle.user.username if hustle.user else None,
            "created_at": hustle.created_at.isoformat() if hustle.created_at else None,
            "status": "active"
        })

    return jsonify({"hustles": result, "count": len(result)}), 200

# GET HUSTLES BY USER ID (Admin only)
@hustle_bp.route("/users/<int:user_id>/hustles", methods=["GET"])
@jwt_required()
def get_hustles_by_user(user_id):
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    # Only admin can view other users' hustles
    if not current_user.is_admin and user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403
    
    # Check if target user exists
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({"error": "User not found"}), 404
    
    hustles = Hustle.query.filter_by(user_id=user_id).order_by(Hustle.created_at.desc()).all()
    result = []
    
    for hustle in hustles:
        result.append({
            "id": hustle.id,
            "title": hustle.title,
            "type": hustle.type,
            "description": hustle.description,
            "date": hustle.date.isoformat(),
            "user_id": hustle.user_id,
            "username": target_user.username,
            "created_at": hustle.created_at.isoformat() if hustle.created_at else None,
            "status": "active"
        })

    return jsonify({
        "user": {
            "id": target_user.id,
            "username": target_user.username,
            "email": target_user.email
        },
        "hustles": result,
        "total_hustles": len(result)
    }), 200

# GET HUSTLE STATISTICS (Admin only)
@hustle_bp.route("/hustles/stats", methods=["GET"])
@jwt_required()
def get_hustle_stats():
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    if not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403
    
    # Get statistics
    total_hustles = Hustle.query.count()
    total_users_with_hustles = db.session.query(Hustle.user_id).distinct().count()
    
    # Get hustle types distribution
    hustle_types = db.session.query(Hustle.type, db.func.count(Hustle.id)).group_by(Hustle.type).all()
    
    # Get recent hustles (last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    recent_hustles = Hustle.query.filter(Hustle.created_at >= thirty_days_ago).count()
    
    return jsonify({
        "total_hustles": total_hustles,
        "total_users_with_hustles": total_users_with_hustles,
        "recent_hustles_30_days": recent_hustles,
        "hustle_types_distribution": [{"type": ht[0], "count": ht[1]} for ht in hustle_types]
    }), 200

# UPDATE HUSTLE
@hustle_bp.route("/hustles/<int:hustle_id>", methods=["PUT"])
@jwt_required()
def update_hustle(hustle_id):
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    hustle = Hustle.query.get(hustle_id)

    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404

    # Check if user owns this hustle or is admin
    if not current_user.is_admin and hustle.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    # Update fields if they exist in request
    if "title" in data:
        hustle.title = data["title"]
    if "type" in data:
        hustle.type = data["type"]
    if "description" in data:
        hustle.description = data["description"]
    if "date" in data:
        try:
            hustle.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    if "status" in data and current_user.is_admin:
        hustle.status = data["status"]

    hustle.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Hustle updated successfully",
        "hustle": {
            "id": hustle.id,
            "title": hustle.title,
            "type": hustle.type,
            "description": hustle.description,
            "date": hustle.date.isoformat(),
            "status": hustle.status,
            "updated_at": hustle.updated_at.isoformat()
        }
    }), 200

# DELETE HUSTLE
@hustle_bp.route("/hustles/<int:hustle_id>", methods=["DELETE"])
@jwt_required()
def delete_hustle(hustle_id):
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    hustle = Hustle.query.get(hustle_id)

    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404

    # Check if user owns this hustle or is admin
    if not current_user.is_admin and hustle.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    db.session.delete(hustle)
    db.session.commit()

    return jsonify({"success": True, "message": "Hustle deleted successfully"}), 200

# BULK DELETE HUSTLES (Admin only)
@hustle_bp.route("/hustles/bulk-delete", methods=["DELETE"])
@jwt_required()
def bulk_delete_hustles():
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    if not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    hustle_ids = data.get("hustle_ids", [])
    
    if not hustle_ids:
        return jsonify({"error": "No hustle IDs provided"}), 400
    
    try:
        deleted_count = Hustle.query.filter(Hustle.id.in_(hustle_ids)).delete(synchronize_session=False)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": f"Successfully deleted {deleted_count} hustles",
            "deleted_count": deleted_count
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logging.error(f"Bulk delete error: {str(e)}")
        return jsonify({"error": "Failed to delete hustles"}), 500

# ASSIGN HUSTLE TO USER (Admin only)
@hustle_bp.route("/hustles/<int:hustle_id>/assign", methods=["PUT"])
@jwt_required()
def assign_hustle_to_user(hustle_id):
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({"error": "User not found"}), 404
    
    if not current_user.is_admin:
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    new_user_id = data.get("user_id")
    
    if not new_user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    hustle = Hustle.query.get(hustle_id)
    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404
    
    new_user = User.query.get(new_user_id)
    if not new_user:
        return jsonify({"error": "Target user not found"}), 404
    
    old_user_id = hustle.user_id
    hustle.user_id = new_user_id
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": f"Hustle reassigned successfully from user {old_user_id} to user {new_user_id}",
        "hustle_id": hustle_id,
        "old_user_id": old_user_id,
        "new_user_id": new_user_id
    }), 200