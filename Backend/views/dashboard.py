from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Transaction, Hustle
from datetime import datetime, timedelta
from sqlalchemy import func, extract

dashboard_bp = Blueprint('dashboard', __name__)

def calculate_percentage_change(current, previous):
    if previous == 0:
        return 0
    return round(((current - previous) / previous) * 100)

@dashboard_bp.route('/dashboard/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    current_user_id = get_jwt_identity()
    
    try:
        # Get user data
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Calculate current month totals
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        
        current_month_income = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'income',
            extract('month', Transaction.created_at) == current_month,
            extract('year', Transaction.created_at) == current_year
        ).scalar() or 0
        
        current_month_expenses = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense',
            extract('month', Transaction.created_at) == current_month,
            extract('year', Transaction.created_at) == current_year
        ).scalar() or 0
        
        # Calculate previous month totals
        prev_month = current_month - 1 if current_month > 1 else 12
        prev_year = current_year if current_month > 1 else current_year - 1
        
        prev_month_income = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'income',
            extract('month', Transaction.created_at) == prev_month,
            extract('year', Transaction.created_at) == prev_year
        ).scalar() or 0
        
        prev_month_expenses = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense',
            extract('month', Transaction.created_at) == prev_month,
            extract('year', Transaction.created_at) == prev_year
        ).scalar() or 0
        
        # Calculate percentage changes
        income_change = calculate_percentage_change(current_month_income, prev_month_income)
        expenses_change = calculate_percentage_change(current_month_expenses, prev_month_expenses)
        
        # Calculate total income and expenses
        total_income = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'income'
        ).scalar() or 0
        
        total_expenses = db.session.query(
            func.sum(Transaction.amount)
        ).filter(
            Transaction.user_id == current_user_id,
            Transaction.type == 'expense'
        ).scalar() or 0
        
        # Count active hustles
        active_hustles = db.session.query(
            func.count(Hustle.id)
        ).filter(
            Hustle.user_id == current_user_id,
            Hustle.is_active == True
        ).scalar()
        
        # Prepare monthly data (last 12 months)
        monthly_data = []
        now = datetime.utcnow()
        for i in range(12):
            month_date = now - timedelta(days=30*i)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = month_start.replace(day=28) + timedelta(days=4)  # Ensures we get to next month
            month_end = next_month - timedelta(days=next_month.day)
            
            month_income = db.session.query(
                func.sum(Transaction.amount)
            ).filter(
                Transaction.user_id == current_user_id,
                Transaction.type == 'income',
                Transaction.created_at >= month_start,
                Transaction.created_at <= month_end
            ).scalar() or 0
            
            month_expenses = db.session.query(
                func.sum(Transaction.amount)
            ).filter(
                Transaction.user_id == current_user_id,
                Transaction.type == 'expense',
                Transaction.created_at >= month_start,
                Transaction.created_at <= month_end
            ).scalar() or 0
            
            monthly_data.append({
                'month': month_start.strftime('%b'),
                'income': month_income,
                'expenses': month_expenses,
                'profit': month_income - month_expenses
            })
        monthly_data.reverse()  # Show oldest to newest
        
        # Prepare hustle comparison data (top 5 by income)
        hustle_comparison = db.session.query(
            Hustle.title.label('name'),
            func.sum(Transaction.amount).filter(Transaction.type == 'income').label('income'),
            func.sum(Transaction.amount).filter(Transaction.type == 'expense').label('expenses')
        ).join(
            Transaction,
            Transaction.hustle_id == Hustle.id
        ).filter(
            Hustle.user_id == current_user_id
        ).group_by(
            Hustle.id
        ).order_by(
            func.sum(Transaction.amount).filter(Transaction.type == 'income').desc()
        ).limit(5).all()
        
        hustle_comparison = [{
            'name': h.name,
            'income': h.income or 0,
            'expenses': h.expenses or 0,
            'profit': (h.income or 0) - (h.expenses or 0)
        } for h in hustle_comparison]
        
        # Prepare recent transactions (last 5)
        recent_transactions = db.session.query(
            Transaction
        ).filter(
            Transaction.user_id == current_user_id
        ).order_by(
            Transaction.created_at.desc()
        ).limit(5).all()
        
        recent_transactions = [{
            'id': t.id,
            'type': t.type,
            'description': t.description,
            'amount': t.amount,
            'date': t.created_at.strftime('%Y-%m-%d'),
            'hustle': t.hustle.title if t.hustle else 'General'
        } for t in recent_transactions]
        
        # Prepare hustles performance data (top 3 by profit)
        hustles_performance = db.session.query(
            Hustle.id,
            Hustle.title,
            func.sum(Transaction.amount).filter(Transaction.type == 'income').label('income'),
            func.sum(Transaction.amount).filter(Transaction.type == 'expense').label('expenses'),
            func.max(Transaction.created_at).label('last_activity')
        ).join(
            Transaction,
            Transaction.hustle_id == Hustle.id
        ).filter(
            Hustle.user_id == current_user_id
        ).group_by(
            Hustle.id
        ).order_by(
            (func.sum(Transaction.amount).filter(Transaction.type == 'income') - 
             func.sum(Transaction.amount).filter(Transaction.type == 'expense')).desc()
        ).limit(3).all()
        
        hustles_performance = [{
            'id': h.id,
            'name': h.title,
            'status': 'active' if h.last_activity and 
                        (datetime.utcnow() - h.last_activity) < timedelta(days=30) and 
                        (h.income or 0) - (h.expenses or 0) >= 0 
                     else 'needs_attention',
            'income': h.income or 0,
            'expenses': h.expenses or 0,
            'profit': (h.income or 0) - (h.expenses or 0)
        } for h in hustles_performance]
        
        response_data = {
            'userName': user.username,
            'totalIncome': total_income,
            'totalExpenses': total_expenses,
            'incomeChange': income_change,
            'expensesChange': expenses_change,
            'netProfit': total_income - total_expenses,
            'activeHustles': active_hustles,
            'monthlyData': monthly_data,
            'hustleComparison': hustle_comparison,
            'recentTransactions': recent_transactions,
            'hustles': hustles_performance
        }
        
        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500