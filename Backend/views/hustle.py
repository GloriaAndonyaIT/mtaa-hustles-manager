from flask import Flask, request, jsonify, Blueprint
from datetime import datetime

from models import db, Hustle

hustle_bp = Blueprint('hustle', __name__)

# CREATE HUSTLE
@hustle_bp.route("/hustles", methods=["POST"])
def create_hustle():
    data = request.get_json()

    title = data.get("title")
    hustle_type = data.get("type")
    description = data.get("description")
    date_str = data.get("date")
    user_id = data.get("user_id")

    if not title or not hustle_type or not description or not date_str or not user_id:
        return jsonify({"error": "Title, type, description, date, and user_id are required"}), 400

    # Parse date
    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    new_hustle = Hustle(title=title, type=hustle_type, description=description, date=date, user_id=user_id)
    db.session.add(new_hustle)
    db.session.commit()

    return jsonify({"success": "Hustle created successfully"}), 201

# GET HUSTLE BY ID
@hustle_bp.route("/hustles/<int:hustle_id>", methods=["GET"])
def get_hustle(hustle_id):
    hustle = Hustle.query.get(hustle_id)

    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404

    return jsonify({
        "id": hustle.id,
        "title": hustle.title,
        "type": hustle.type,
        "description": hustle.description,
        "date": hustle.date.isoformat(),
        "user_id": hustle.user_id
    }), 200

# GET ALL HUSTLES
@hustle_bp.route("/hustles", methods=["GET"])
def get_all_hustles():
    hustles = Hustle.query.all()
    result = []

    for hustle in hustles:
        result.append({
            "id": hustle.id,
            "title": hustle.title,
            "type": hustle.type,
            "description": hustle.description,
            "date": hustle.date.isoformat(),
            "user_id": hustle.user_id
        })

    return jsonify(result), 200

# UPDATE HUSTLE
@hustle_bp.route("/hustles/<int:hustle_id>", methods=["PUT"])
def update_hustle(hustle_id):
    data = request.get_json()
    hustle = Hustle.query.get(hustle_id)

    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404

    title = data.get("title")
    hustle_type = data.get("type")
    description = data.get("description")
    date_str = data.get("date")

    if title:
        hustle.title = title
    if hustle_type:
        hustle.type = hustle_type
    if description:
        hustle.description = description
    if date_str:
        try:
            hustle.date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    db.session.commit()

    return jsonify({"success": "Hustle updated successfully"}), 200

# DELETE HUSTLE
@hustle_bp.route("/hustles/<int:hustle_id>", methods=["DELETE"])
def delete_hustle(hustle_id):
    hustle = Hustle.query.get(hustle_id)

    if not hustle:
        return jsonify({"error": "Hustle not found"}), 404

    db.session.delete(hustle)
    db.session.commit()

    return jsonify({"success": "Hustle deleted successfully"}), 200
