from flask import Flask, request, jsonify
from models import db, User
from flask_migrate import Migrate
from views.user import user_bp
from views.debt import debt_bp
from views.hustle import hustle_bp
from views.transactions import transaction_bp
from views.goal import goal_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app, db)
db.init_app(app)

app.register_blueprint(user_bp)
app.register_blueprint(debt_bp)
app.register_blueprint(hustle_bp)  
app.register_blueprint(transaction_bp) 
app.register_blueprint(goal_bp)