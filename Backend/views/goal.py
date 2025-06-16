from flask import request, jsonify, Blueprint
from models import db, Goal
from datetime import datetime

goal_bp = Blueprint('goal', __name__)

# CREATE GOAL
@goal_bp.route("/goals", methods=["POST"])
def create_goal():
    data = request.get_json()

    title = data.get("title")
    description = data.get("description")
    status = data.get("status")
    due_date_str = data.get("due_date")
    user_id = data.get("user_id")
    hustle_id = data.get("hustle_id")  # optional

    if not title or not description or not status or not due_date_str or not user_id:
        return jsonify({"error": "Title, description, status, due_date, and user_id are required"}), 400

    try:
        due_date = datetime.fromisoformat(due_date_str)
    except ValueError:
        return jsonify({"error": "Invalid date format. Use ISO format: YYYY-MM-DDTHH:MM:SS"}), 400

    new_goal = Goal(
        title=title,
        description=description,
        status=status,
        due_date=due_date,
        user_id=user_id,
        hustle_id=hustle_id
    )

    db.session.add(new_goal)
    db.session.commit()

    return jsonify({"success": "Goal created successfully"}), 201




# GET GOAL BY ID
@goal_bp.route("/goals/<int:goal_id>", methods=["GET"])
def get_goal(goal_id):
    goal = Goal.query.get(goal_id)

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    return jsonify({
        "id": goal.id,
        "title": goal.title,
        "description": goal.description,
        "status": goal.status,
        "due_date": goal.due_date.isoformat(),
        "user_id": goal.user_id,
        "hustle_id": goal.hustle_id
    }), 200



# GET ALL GOALS
@goal_bp.route("/goals", methods=["GET"])
def get_all_goals():
    goals = Goal.query.all()
    result = []

    for goal in goals:
        result.append({
            "id": goal.id,
            "title": goal.title,
            "description": goal.description,
            "status": goal.status,
            "due_date": goal.due_date.isoformat(),
            "user_id": goal.user_id,
            "hustle_id": goal.hustle_id
        })

    return jsonify(result), 200





# UPDATE GOAL
@goal_bp.route("/goals/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    data = request.get_json()
    goal = Goal.query.get(goal_id)

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    goal.title = data.get("title", goal.title)
    goal.description = data.get("description", goal.description)
    goal.status = data.get("status", goal.status)
    
    due_date_str = data.get("due_date")
    if due_date_str:
        try:
            goal.due_date = datetime.fromisoformat(due_date_str)
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400

    goal.hustle_id = data.get("hustle_id", goal.hustle_id)

    db.session.commit()

    return jsonify({"success": "Goal updated successfully"}), 200



# DELETE GOAL
@goal_bp.route("/goals/<int:goal_id>", methods=["DELETE"])
def delete_goal(goal_id):
    goal = Goal.query.get(goal_id)

    if not goal:
        return jsonify({"error": "Goal not found"}), 404

    db.session.delete(goal)
    db.session.commit()

    return jsonify({"success": "Goal deleted successfully"}), 200
