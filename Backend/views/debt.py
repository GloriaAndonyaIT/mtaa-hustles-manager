from flask import Flask, request, jsonify, Blueprint
from models import db, Debt
debt_bp = Blueprint('debt', __name__)
# CREATE DEBT
@debt_bp.route("/debts", methods=["POST"])
def create_debt():
    data = request.get_json()
    
    amount = data.get("amount")
    description = data.get("description")
    date = data.get("date")
    user_id = data.get("user_id")
    
    if not amount or not description or not date or not user_id:
        return jsonify({"error": "Amount, description, date, and user_id are required"}), 400
    
    new_debt = Debt(amount=amount, description=description, date=date, user_id=user_id)
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
    
    amount = data.get("amount", debt.amount)
    description = data.get("description", debt.description)
    date = data.get("date", debt.date)
    
    debt.amount = amount
    debt.description = description
    debt.date = date
    
    db.session.commit()
    
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