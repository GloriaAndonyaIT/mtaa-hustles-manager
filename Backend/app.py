from datetime import timedelta
from flask import Flask, request, jsonify
from models import db, TokenBlocklist
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
# from flask_cors import CORS
# Create Flask app first
app = Flask(__name__)

# Configure the app
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Mail configurations
app.config['MAIL_SERVER'] = 'smtp.gmail.com' 
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config["MAIL_USE_SSL"] = False
app.config['MAIL_USERNAME'] = 'testandonya@gmail.com'
app.config['MAIL_PASSWORD'] = 'aoyq bwra hely tser' 
app.config['MAIL_DEFAULT_SENDER'] = 'testandonya@gmail.com'

# Initialize extensions
db.init_app(app)
mail = Mail(app)
migrate = Migrate(app, db)

# Enable CORS for all routes
# CORS(app)

#JWT configurations
from flask_jwt_extended import JWTManager
app.config["JWT_SECRET_KEY"] = "fghhhhaszdxfcwaesrdgdf"  
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # Token expires in 1 day
from datetime import timedelta
jwt = JWTManager(app)
jwt.init_app(app)

# Import blueprints AFTER app and extensions are initialized
# This prevents circular import issues
from views.user import user_bp
from views.debt import debt_bp
from views.hustle import hustle_bp
from views.transactions import transaction_bp
from views.goal import goal_bp
from views.auth import auth_bp

# Register blueprints
app.register_blueprint(user_bp)
app.register_blueprint(debt_bp)
app.register_blueprint(hustle_bp)  
app.register_blueprint(transaction_bp) 
app.register_blueprint(goal_bp)
app.register_blueprint(auth_bp)




@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
    token = db.session.query(TokenBlocklist.id).filter_by(jti=jti).scalar()
    return token is not None 


if __name__ == '__main__':
    app.run(debug=True)