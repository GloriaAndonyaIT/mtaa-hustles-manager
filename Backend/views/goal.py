from flask import request, jsonify, Blueprint
from models import db, Goal, User, Hustle
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_

goal_bp = Blueprint('goal', __name__)

def get_current_user():
    """Helper function to get current user from JWT"""
    try:
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id) if current_user_id else None
    except Exception as e:
        print(f"Error getting current user: {str(e)}")
        return None

# CREATE GOAL
@goal_bp.route("/goals", methods=["POST"])
@jwt_required()
def create_goal():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    # Validate required fields
    required_fields = ["title", "description", "due_date"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing_fields
        }), 400

    try:
        # Parse and validate data
        due_date = datetime.fromisoformat(data["due_date"])
        status = data.get("status", "pending").lower()
        hustle_id = data.get("hustle_id")

        # Validate status
        valid_statuses = ["pending", "in_progress", "completed", "cancelled"]
        if status not in valid_statuses:
            return jsonify({
                "error": "Invalid status",
                "valid_statuses": valid_statuses
            }), 400

        # Validate hustle if provided
        if hustle_id:
            hustle = Hustle.query.get(hustle_id)
            if not hustle:
                return jsonify({"error": "Hustle not found"}), 404
            if not current_user.is_admin and hustle.user_id != current_user.id:
                return jsonify({"error": "Hustle does not belong to you"}), 403

        # Create new goal
        new_goal = Goal(
            title=data["title"],
            description=data["description"],
            due_date=due_date,
            status=status,
            user_id=current_user.id,
            hustle_id=hustle_id
        )

        db.session.add(new_goal)
        db.session.commit()

        return jsonify({
            "success": "Goal created successfully",
            "goal": new_goal.to_dict()
        }), 201

    except ValueError as e:
        return jsonify({
            "error": "Invalid date format",
            "message": "Use ISO format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS",
            "details": str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to create goal",
            "message": str(e)
        }), 500

# GET GOAL BY ID
@goal_bp.route("/goals/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_goal(goal_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    goal = Goal.query.get(goal_id)
    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    # Check permissions
    if not current_user.is_admin and goal.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify(goal.to_dict()), 200

# GET ALL GOALS (with filters)
@goal_bp.route("/goals", methods=["GET"])
@jwt_required()
def get_all_goals():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    # Get query parameters
    status = request.args.get('status')
    hustle_id = request.args.get('hustle_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')

    # Base query
    if current_user.is_admin:
        query = Goal.query
    else:
        query = Goal.query.filter_by(user_id=current_user.id)

    # Apply filters
    if status:
        query = query.filter(Goal.status.ilike(status))
    if hustle_id:
        query = query.filter_by(hustle_id=hustle_id)
    if start_date:
        try:
            start_date = datetime.fromisoformat(start_date)
            query = query.filter(Goal.due_date >= start_date)
        except ValueError:
            return jsonify({"error": "Invalid start date format"}), 400
    if end_date:
        try:
            end_date = datetime.fromisoformat(end_date)
            query = query.filter(Goal.due_date <= end_date)
        except ValueError:
            return jsonify({"error": "Invalid end date format"}), 400
    if search:
        query = query.filter(
            or_(
                Goal.title.ilike(f"%{search}%"),
                Goal.description.ilike(f"%{search}%")
            )
        )

    # Execute query
    goals = query.order_by(Goal.due_date.asc()).all()
    
    return jsonify({
        "goals": [goal.to_dict() for goal in goals],
        "count": len(goals)
    }), 200

# UPDATE GOAL
@goal_bp.route("/goals/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    goal = Goal.query.get(goal_id)
    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    # Check permissions
    if not current_user.is_admin and goal.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    try:
        # Update fields
        if 'title' in data:
            goal.title = data['title']
        if 'description' in data:
            goal.description = data['description']
        if 'status' in data:
            goal.status = data['status'].lower()
        if 'due_date' in data:
            goal.due_date = datetime.fromisoformat(data['due_date'])
        if 'hustle_id' in data:
            if data['hustle_id']:
                hustle = Hustle.query.get(data['hustle_id'])
                if not hustle:
                    return jsonify({"error": "Hustle not found"}), 404
                if not current_user.is_admin and hustle.user_id != current_user.id:
                    return jsonify({"error": "Hustle does not belong to you"}), 403
            goal.hustle_id = data['hustle_id']

        db.session.commit()
        return jsonify({
            "success": "Goal updated successfully",
            "goal": goal.to_dict()
        }), 200

    except ValueError as e:
        db.session.rollback()
        return jsonify({
            "error": "Invalid data format",
            "message": str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to update goal",
            "message": str(e)
        }), 500

# DELETE GOAL
@goal_bp.route("/goals/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    goal = Goal.query.get(goal_id)
    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    # Check permissions
    if not current_user.is_admin and goal.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    try:
        db.session.delete(goal)
        db.session.commit()
        return jsonify({"success": "Goal deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to delete goal",
            "message": str(e)
        }), 500