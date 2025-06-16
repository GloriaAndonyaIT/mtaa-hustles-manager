#!/usr/bin/env python3
"""
Simple database seeding script that works around SQLAlchemy relationship issues
"""

import sys
import os
from werkzeug.security import generate_password_hash

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Import your Flask app and database
    from app import app 
    from models import db
    
   
    from models import User
    
except ImportError as e:
    print(f"Import error: {e}")
    print("Please check:")
    print("1. Your main app file name (change 'from app import app' if needed)")
    print("2. Your models.py file exists and has User model")
    print("3. All dependencies are installed")
    sys.exit(1)

def create_users_direct():
    """Create users using direct SQL to avoid relationship issues"""
    
    with app.app_context():
        try:
            # Create tables
            db.create_all()
            print("Tables created successfully")
            
            # Test users data
            users_data = [
                ('admin', 'admin@example.com', 'admin123', True),
                ('john_doe', 'john.doe@example.com', 'password123', False),
                ('jane_smith', 'jane.smith@example.com', 'securepass', False),
                ('test_user', 'test@example.com', 'testpass123', False),
                ('demo_user', 'demo@example.com', 'demo123456', False)
            ]
            
            created_count = 0
            
            for username, email, password, is_admin in users_data:
                try:
                    # Check if user exists
                    existing = User.query.filter_by(username=username).first()
                    if existing:
                        print(f"User {username} already exists, skipping...")
                        continue
                    
                    # Hash password
                    hashed_password = generate_password_hash(password)
                    
                    # Create user instance
                    user = User(
                        username=username,
                        email=email,
                        password=hashed_password,
                        is_admin=is_admin
                    )
                    
                    # Add to session
                    db.session.add(user)
                    print(f"Added user: {username}")
                    created_count += 1
                    
                except Exception as e:
                    print(f"Error creating user {username}: {e}")
                    continue
            
            # Commit all changes
            if created_count > 0:
                db.session.commit()
                print(f"\nSuccessfully created {created_count} users!")
            else:
                print("No new users were created.")
            
            # Show summary
            total_users = User.query.count()
            print(f"Total users in database: {total_users}")
            
            # List all users
            print("\nAll users:")
            users = User.query.all()
            for user in users:
                print(f"- {user.username} ({user.email}) - Admin: {user.is_admin}")
                
        except Exception as e:
            print(f"Database error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    print("Simple Database Seeding Script")
    print("=" * 40)
    create_users_direct()
    print("=" * 40)
    print("Done! You can now test your API with these users:")
    print("- admin / admin123 (admin user)")
    print("- john_doe / password123")
    print("- jane_smith / securepass") 
    print("- test_user / testpass123")
    print("- demo_user / demo123456")