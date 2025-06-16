from flask import Flask, request, jsonify, Blueprint
from models import db, Goal
goal_bp = Blueprint('goal', __name__)
# CREATE GOAL
@goal_bp.route("/goals", methods=["POST"])
def create_goal():
    data = request.get_json()
    
    title = data.get("title")
    description = data.get("description")
    target_date = data.get("target_date")
    user_id = data.get("user_id")
    
    if not title or not description or not target_date or not user_id:
        return jsonify({"error": "Title, description, target_date, and user_id are required"}), 400
    
    new_goal = Goal(title=title, description=description, target_date=target_date, user_id=user_id)
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
        "target_date": goal.target_date.isoformat(),
        "user_id": goal.user_id
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
            "target_date": goal.target_date.isoformat(),
            "user_id": goal.user_id
        })
    return jsonify(result), 200
# UPDATE GOAL
@goal_bp.route("/goals/<int:goal_id>", methods=["PUT"])
def update_goal(goal_id):
    data = request.get_json()
    goal = Goal.query.get(goal_id)
    
    if not goal:
        return jsonify({"error": "Goal not found"}), 404
    
    title = data.get("title", goal.title)
    description = data.get("description", goal.description)
    target_date = data.get("target_date", goal.target_date)
    
    goal.title = title
    goal.description = description
    goal.target_date = target_date
    
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