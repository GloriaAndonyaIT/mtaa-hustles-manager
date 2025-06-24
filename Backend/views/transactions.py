from flask import Flask, request, jsonify, Blueprint
from models import db, Transaction, User, Hustle
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

transaction_bp = Blueprint('transaction', __name__)

def get_current_user():
    """Helper function to get current user from JWT"""
    try:
        current_user_id = get_jwt_identity()
        if current_user_id:
            return User.query.get(current_user_id)
        return None
    except Exception as e:
        print(f"Error getting current user: {e}")
        return None

# CREATE TRANSACTION (Income or Expense)
@transaction_bp.route("/transactions", methods=["POST"])
@jwt_required()
def create_transaction():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Invalid token or user not found"}), 401

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        amount = data.get("amount")
        t_type = data.get("type")  # 'income' or 'expense'
        description = data.get("description")
        date_str = data.get("date")
        hustle_id = data.get("hustle_id")
        category = data.get("category")
        notes = data.get("notes")
        tags = data.get("tags")

        # Validate required fields
        if not amount or not t_type or not description:
            return jsonify({"error": "Amount, type, and description are required"}), 400

        # Validate transaction type
        if t_type.lower() not in ['income', 'expense']:
            return jsonify({"error": "Type must be either 'income' or 'expense'"}), 400

        # Parse date if provided
        if date_str:
            try:
                created_at = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
        else:
            created_at = datetime.utcnow()

        # Validate hustle_id if provided
        if hustle_id:
            hustle = Hustle.query.get(hustle_id)
            if not hustle:
                return jsonify({"error": "Hustle not found"}), 404
            
            # Check if hustle belongs to user (unless admin)
            if not current_user.is_admin and hustle.user_id != current_user.id:
                return jsonify({"error": "Hustle does not belong to you"}), 403

        # Create transaction
        new_transaction = Transaction(
            amount=float(amount),
            type=t_type.lower(),
            description=description,
            created_at=created_at,
            user_id=current_user.id,
            hustle_id=hustle_id if hustle_id else None,
            category=category,
            notes=notes,
            tags=tags
        )

        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            "success": "Transaction created successfully",
            "transaction": new_transaction.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error creating transaction: {e}")
        return jsonify({"error": "Internal server error"}), 500

# GET TRANSACTION BY ID
@transaction_bp.route("/transactions/<int:transaction_id>", methods=["GET"])
@jwt_required()
def get_transaction(transaction_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Invalid token or user not found"}), 401

        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404

        # Check if user owns the transaction or is admin
        if not current_user.is_admin and transaction.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403

        return jsonify({"transaction": transaction.to_dict()}), 200

    except Exception as e:
        print(f"Error getting transaction: {e}")
        return jsonify({"error": "Internal server error"}), 500

# GET ALL TRANSACTIONS (with filters)
@transaction_bp.route("/transactions", methods=["GET"])
@jwt_required()
def get_all_transactions():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        # Get query parameters for filtering
        hustle_id = request.args.get('hustle_id')
        t_type = request.args.get('type')  # 'income' or 'expense'
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Base query - admin sees all, users see only their own
        if current_user.is_admin:
            query = Transaction.query
        else:
            query = Transaction.query.filter_by(user_id=current_user.id)

        # Apply filters
        if hustle_id:
            # Validate hustle exists and belongs to user (if not admin)
            hustle = Hustle.query.get(hustle_id)
            if not hustle:
                return jsonify({"error": "Hustle not found"}), 404
            if not current_user.is_admin and hustle.user_id != current_user.id:
                return jsonify({"error": "Hustle does not belong to you"}), 403
            query = query.filter_by(hustle_id=hustle_id)
        
        if t_type:
            if t_type.lower() not in ['income', 'expense']:
                return jsonify({"error": "Type must be either 'income' or 'expense'"}), 400
            query = query.filter_by(type=t_type.lower())
        
        if start_date:
            try:
                start_date = datetime.strptime(start_date, "%Y-%m-%d")
                query = query.filter(Transaction.created_at >= start_date)
            except ValueError:
                return jsonify({"error": "Invalid start date format. Use YYYY-MM-DD"}), 400
        
        if end_date:
            try:
                end_date = datetime.strptime(end_date, "%Y-%m-%d")
                query = query.filter(Transaction.created_at <= end_date)
            except ValueError:
                return jsonify({"error": "Invalid end date format. Use YYYY-MM-DD"}), 400

        transactions = query.order_by(Transaction.created_at.desc()).all()
        result = [transaction.to_dict() for transaction in transactions]

        return jsonify({
            "transactions": result,
            "count": len(result)
        }), 200

    except Exception as e:
        print(f"Error getting transactions: {e}")
        return jsonify({"error": "Internal server error"}), 500

# GET TRANSACTIONS BY HUSTLE
@transaction_bp.route("/hustles/<int:hustle_id>/transactions", methods=["GET"])
@jwt_required()
def get_transactions_by_hustle(hustle_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        # Validate hustle exists
        hustle = Hustle.query.get(hustle_id)
        if not hustle:
            return jsonify({"error": "Hustle not found"}), 404

        # Check if hustle belongs to user (unless admin)
        if not current_user.is_admin and hustle.user_id != current_user.id:
            return jsonify({"error": "Hustle does not belong to you"}), 403

        # Get transactions for this hustle
        transactions = Transaction.query.filter_by(hustle_id=hustle_id).order_by(Transaction.created_at.desc()).all()
        result = [transaction.to_dict() for transaction in transactions]

        return jsonify({
            "hustle_id": hustle_id,
            "hustle_title": hustle.title,
            "transactions": result,
            "count": len(result)
        }), 200

    except Exception as e:
        print(f"Error getting hustle transactions: {e}")
        return jsonify({"error": "Internal server error"}), 500

# UPDATE TRANSACTION
@transaction_bp.route("/transactions/<int:transaction_id>", methods=["PUT"])
@jwt_required()
def update_transaction(transaction_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404

        # Check if user owns the transaction or is admin
        if not current_user.is_admin and transaction.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Update fields if they exist in the request
        if 'amount' in data:
            transaction.amount = float(data['amount'])
        if 'type' in data:
            if data['type'].lower() not in ['income', 'expense']:
                return jsonify({"error": "Type must be either 'income' or 'expense'"}), 400
            transaction.type = data['type'].lower()
        if 'description' in data:
            transaction.description = data['description']
        if 'category' in data:
            transaction.category = data['category']
        if 'notes' in data:
            transaction.notes = data['notes']
        if 'tags' in data:
            transaction.tags = data['tags']
        if 'hustle_id' in data:
            if data['hustle_id']:
                hustle = Hustle.query.get(data['hustle_id'])
                if not hustle:
                    return jsonify({"error": "Hustle not found"}), 404
                if not current_user.is_admin and hustle.user_id != current_user.id:
                    return jsonify({"error": "Hustle does not belong to you"}), 403
            transaction.hustle_id = data['hustle_id']
        if 'date' in data:
            try:
                transaction.created_at = datetime.strptime(data['date'], "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        transaction.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            "success": "Transaction updated successfully",
            "transaction": transaction.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error updating transaction: {e}")
        return jsonify({"error": "Internal server error"}), 500

# DELETE TRANSACTION
@transaction_bp.route("/transactions/<int:transaction_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(transaction_id):
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({"error": "Unauthorized"}), 401

        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404

        # Check if user owns the transaction or is admin
        if not current_user.is_admin and transaction.user_id != current_user.id:
            return jsonify({"error": "Access denied"}), 403

        db.session.delete(transaction)
        db.session.commit()

        return jsonify({"success": "Transaction deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error deleting transaction: {e}")
        return jsonify({"error": "Internal server error"}), 500