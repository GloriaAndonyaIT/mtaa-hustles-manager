from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import MetaData

metadata = MetaData()
db = SQLAlchemy(metadata=metadata)


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)

    # relationships
    hustles = db.relationship('Hustle', backref='user', lazy=True)
    transactions = db.relationship('Transaction', backref='user', lazy=True)
    debts = db.relationship('Debt', backref='user', lazy=True)
    goals = db.relationship('Goal', backref='user', lazy=True)


class Hustle(db.Model):
    __tablename__ = 'hustles'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., 'side hustle', 'investment'
    description = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # relationships
    transactions = db.relationship('Transaction', backref='hustle', lazy=True)
    debts = db.relationship('Debt', backref='hustle', lazy=True)
    goals = db.relationship('Goal', backref='hustle', lazy=True)


class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., 'income', 'expense'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    hustle_id = db.Column(db.Integer, db.ForeignKey('hustles.id'), nullable=True)


class Debt(db.Model):
    __tablename__ = 'debts'
    
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    creditor = db.Column(db.String(100), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False)  # e.g., 'pending', 'paid'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    hustle_id = db.Column(db.Integer, db.ForeignKey('hustles.id'), nullable=True)


class Goal(db.Model):
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), nullable=False)  # e.g., 'active', 'completed'
    due_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    hustle_id = db.Column(db.Integer, db.ForeignKey('hustles.id'), nullable=True)
