from flask import Flask, request, jsonify, Blueprint
from models import db, Debt
from datetime import datetime
debt_bp = Blueprint('debt', __name__)
# CREATE DEBT
@debt_bp.route("/debts", methods=["POST"])
def create_debt():
    data = request.get_json()

    amount = data.get("amount")
    description = data.get("description")
    date_str = data.get("date")
    user_id = data.get("user_id")
    creditor = data.get("creditor")
    due_date_str = data.get("due_date")
    status = data.get("status", "pending")  # default to 'pending' if not provided

    # Required field check
    if not amount or not description or not date_str or not user_id or not creditor or not due_date_str or not status:
        return jsonify({"error": "All fields are required: amount, description, date, user_id, creditor, due_date, status"}), 400

    try:
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        due_date = datetime.strptime(due_date_str, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    new_debt = Debt(
        amount=amount,
        description=description,
        date=date,
        user_id=user_id,
        creditor=creditor,
        due_date=due_date,
        status=status
    )

    db.session.add(new_debt)
    db.session.commit()

    return jsonify({"success": "Debt created successfully"}), 201
# GET DEBT BY ID
@debt_bp.route("/debts/<int:debt_id>", methods=["GET"])
def get_debt(debt_id):
    debt = Debt.query.get(debt_id)
    
    if not debt:
        return jsonify({"error": "Debt not found"}), 404
    
    return jsonify({
        "id": debt.id,
        "amount": debt.amount,
        "description": debt.description,
        "date": debt.date.isoformat(),
        "user_id": debt.user_id
    }), 200
# GET ALL DEBTS
@debt_bp.route("/debts", methods=["GET"])
def get_all_debts():
    debts = Debt.query.all()
    result = []
    
    for debt in debts:
        result.append({
            "id": debt.id,
            "amount": debt.amount,
            "description": debt.description,
            "date": debt.date.isoformat(),
            "user_id": debt.user_id
        })
    return jsonify(result), 200
# UPDATE DEBT
@debt_bp.route("/debts/<int:debt_id>", methods=["PUT"])
def update_debt(debt_id):
    data = request.get_json()
    debt = Debt.query.get(debt_id)
    
    if not debt:
        return jsonify({"error": "Debt not found"}), 404

    # Update fields safely
    debt.amount = data.get("amount", debt.amount)
    debt.description = data.get("description", debt.description)

    # Convert string to Python date if 'date' is in data
    if "date" in data:
        try:
            debt.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Date format should be YYYY-MM-DD"}), 400

    db.session.commit()

    return jsonify({"success": "Debt updated successfully"}), 200
    
    return jsonify({"success": "Debt updated successfully"}), 200
# DELETE DEBT
@debt_bp.route("/debts/<int:debt_id>", methods=["DELETE"])
def delete_debt(debt_id):
    debt = Debt.query.get(debt_id)
    
    if not debt:
        return jsonify({"error": "Debt not found"}), 404
    
    db.session.delete(debt)
    db.session.commit()
    
    return jsonify({"success": "Debt deleted successfully"}), 200