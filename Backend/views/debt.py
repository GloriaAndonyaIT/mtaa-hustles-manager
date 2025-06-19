from flask import request, jsonify, Blueprint
from models import db, Debt, User, Hustle
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import or_

debt_bp = Blueprint('debt', __name__)

def get_current_user():
    """Helper function to get current user from JWT"""
    try:
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id) if current_user_id else None
    except Exception as e:
        print(f"Error getting current user: {str(e)}")
        return None

# CREATE DEBT
@debt_bp.route("/debts", methods=["POST"])
@jwt_required()
def create_debt():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    # Validate required fields
    required_fields = ["amount", "description", "date", "creditor", "due_date"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({
            "error": "Missing required fields",
            "missing": missing_fields
        }), 400

    try:
        # Parse and validate data
        amount = float(data["amount"])
        date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        due_date = datetime.strptime(data["due_date"], "%Y-%m-%d")
        status = data.get("status", "pending").lower()
        hustle_id = data.get("hustle_id")

        # Validate status
        valid_statuses = ["pending", "partially_paid", "paid"]
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

        # Create new debt
        new_debt = Debt(
            amount=amount,
            description=data["description"],
            date=date,
            user_id=current_user.id,
            creditor=data["creditor"],
            due_date=due_date,
            status=status,
            hustle_id=hustle_id
        )

        db.session.add(new_debt)
        db.session.commit()

        return jsonify({
            "success": "Debt created successfully",
            "debt": new_debt.to_dict()
        }), 201

    except ValueError as e:
        return jsonify({
            "error": "Invalid data format",
            "message": str(e),
            "expected": {
                "amount": "number",
                "date": "YYYY-MM-DD",
                "due_date": "YYYY-MM-DD"
            }
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to create debt",
            "message": str(e)
        }), 500

# GET DEBT BY ID
@debt_bp.route("/debts/<int:debt_id>", methods=["GET"])
@jwt_required()
def get_debt(debt_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    debt = Debt.query.get(debt_id)
    if not debt:
        return jsonify({"error": "Debt not found"}), 404

    # Check permissions
    if not current_user.is_admin and debt.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify(debt.to_dict()), 200

# GET ALL DEBTS (with filters)
@debt_bp.route("/debts", methods=["GET"])
@jwt_required()
def get_all_debts():
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    # Get query parameters
    status = request.args.get('status')
    creditor = request.args.get('creditor')
    hustle_id = request.args.get('hustle_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search = request.args.get('search')

    # Base query
    if current_user.is_admin:
        query = Debt.query
    else:
        query = Debt.query.filter_by(user_id=current_user.id)

    # Apply filters
    if status:
        query = query.filter(Debt.status.ilike(status))
    if creditor:
        query = query.filter(Debt.creditor.ilike(f"%{creditor}%"))
    if hustle_id:
        query = query.filter_by(hustle_id=hustle_id)
    if start_date:
        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Debt.date >= start_date)
        except ValueError:
            return jsonify({"error": "Invalid start date format"}), 400
    if end_date:
        try:
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Debt.date <= end_date)
        except ValueError:
            return jsonify({"error": "Invalid end date format"}), 400
    if search:
        query = query.filter(
            or_(
                Debt.description.ilike(f"%{search}%"),
                Debt.creditor.ilike(f"%{search}%")
            )
        )

    # Execute query
    debts = query.order_by(Debt.due_date.asc()).all()
    
    return jsonify({
        "debts": [debt.to_dict() for debt in debts],
        "count": len(debts)
    }), 200

# UPDATE DEBT
@debt_bp.route("/debts/<int:debt_id>", methods=["PUT"])
@jwt_required()
def update_debt(debt_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    debt = Debt.query.get(debt_id)
    if not debt:
        return jsonify({"error": "Debt not found"}), 404

    # Check permissions
    if not current_user.is_admin and debt.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    try:
        # Update fields
        if 'amount' in data:
            debt.amount = float(data['amount'])
        if 'description' in data:
            debt.description = data['description']
        if 'creditor' in data:
            debt.creditor = data['creditor']
        if 'status' in data:
            debt.status = data['status'].lower()
        if 'hustle_id' in data:
            if data['hustle_id']:
                hustle = Hustle.query.get(data['hustle_id'])
                if not hustle:
                    return jsonify({"error": "Hustle not found"}), 404
                if not current_user.is_admin and hustle.user_id != current_user.id:
                    return jsonify({"error": "Hustle does not belong to you"}), 403
            debt.hustle_id = data['hustle_id']
        if 'date' in data:
            debt.date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        if 'due_date' in data:
            debt.due_date = datetime.strptime(data['due_date'], "%Y-%m-%d")

        db.session.commit()
        return jsonify({
            "success": "Debt updated successfully",
            "debt": debt.to_dict()
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
            "error": "Failed to update debt",
            "message": str(e)
        }), 500

# DELETE DEBT
@debt_bp.route("/debts/<int:debt_id>", methods=["DELETE"])
@jwt_required()
def delete_debt(debt_id):
    current_user = get_current_user()
    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    debt = Debt.query.get(debt_id)
    if not debt:
        return jsonify({"error": "Debt not found"}), 404

    # Check permissions
    if not current_user.is_admin and debt.user_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    try:
        db.session.delete(debt)
        db.session.commit()
        return jsonify({"success": "Debt deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to delete debt",
            "message": str(e)
        }), 500