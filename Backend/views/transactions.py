from flask import Flask, request, jsonify, Blueprint
from models import db, Transaction
transaction_bp = Blueprint('transaction', __name__)
from datetime import datetime



# CREATE TRANSACTION
@transaction_bp.route("/transactions", methods=["POST"])
def create_transaction():
    data = request.get_json()
    
    amount = data.get("amount")
    t_type = data.get("type")
    description = data.get("description")
    user_id = data.get("user_id")

    date_str = data.get("date")
    if date_str:
        try:
            created_at = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    else:
        created_at = datetime.utcnow()

    if not amount or not t_type or not description or not user_id:
        return jsonify({"error": "Amount, type, description, and user_id are required"}), 400
    
    new_transaction = Transaction(
        amount=amount,
        type=t_type,
        description=description,
        created_at=created_at,
        user_id=user_id
    )

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
        "date": transaction.created_at.isoformat(),

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
            "date": transaction.created_at.isoformat(),

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
    created_at = data.get("date", transaction.created_at)  

    transaction.amount = amount
    transaction.type = type
    transaction.description = description
    transaction.created_at = created_at  

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