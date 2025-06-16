from flask import Flask, request, jsonify, Blueprint
from models import db, Transaction
transaction_bp = Blueprint('transaction', __name__)
# CREATE TRANSACTION
@transaction_bp.route("/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json()
    
    amount = data.get("amount")
    type = data.get("type")
    description = data.get("description")
    date = data.get("date")
    user_id = data.get("user_id")
    
    if not amount or not type or not description or not date or not user_id:
        return jsonify({"error": "Amount, type, description, date, and user_id are required"}), 400
    
    new_transaction = Transaction(amount=amount, type=type, description=description, date=date, user_id=user_id)
    db.session.add(new_transaction)
    db.session.commit()
    
    return jsonify({"success": "Transaction created successfully"}), 201
# GET TRANSACTION BY ID
@transaction_bp.route("/transactions/<int:transaction_id>", methods=["GET"])
def get_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    return jsonify({
        "id": transaction.id,
        "amount": transaction.amount,
        "type": transaction.type,
        "description": transaction.description,
        "date": transaction.date.isoformat(),
        "user_id": transaction.user_id
    }), 200
# GET ALL TRANSACTIONS
@transaction_bp.route("/transactions", methods=["GET"])
def get_all_transactions():
    transactions = Transaction.query.all()
    result = []
    
    for transaction in transactions:
        result.append({
            "id": transaction.id,
            "amount": transaction.amount,
            "type": transaction.type,
            "description": transaction.description,
            "date": transaction.date.isoformat(),
            "user_id": transaction.user_id
        })
    
    return jsonify(result), 200
# UPDATE TRANSACTION
@transaction_bp.route("/transactions/<int:transaction_id>", methods=["PUT"])
def update_transaction(transaction_id):
    data = request.get_json()
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    amount = data.get("amount", transaction.amount)
    type = data.get("type", transaction.type)
    description = data.get("description", transaction.description)
    date = data.get("date", transaction.date)
    
    transaction.amount = amount
    transaction.type = type
    transaction.description = description
    transaction.date = date
    
    db.session.commit()
    
    return jsonify({"success": "Transaction updated successfully"}), 200
# DELETE TRANSACTION
@transaction_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    transaction = Transaction.query.get(transaction_id)
    
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({"success": "Transaction deleted successfully"}), 200