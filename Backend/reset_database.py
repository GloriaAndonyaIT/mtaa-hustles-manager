#!/usr/bin/env python3
"""
Database reset script to recreate tables with the new schema
"""

import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    # Import your Flask app and database
    from app import app  # Change this to match your main app file
    from models import db
    
except ImportError as e:
    print(f"Import error: {e}")
    print("Please check:")
    print("1. Your main app file name (change 'from app import app' if needed)")
    print("2. Your models.py file exists")
    sys.exit(1)

def reset_database():
    """Drop all tables and recreate them with the new schema"""
    
    with app.app_context():
        try:
            print("Dropping all existing tables...")
            db.drop_all()
            print("✓ All tables dropped successfully")
            
            print("Creating new tables with updated schema...")
            db.create_all()
            print("✓ All tables created successfully")
            
            print("\nDatabase reset complete!")
            print("You can now run your seeding script: python simple_seed.py")
            
        except Exception as e:
            print(f"Database error: {e}")
            return False
    
    return True

if __name__ == '__main__':
    print("Database Reset Script")
    print("=" * 40)
    print("This will delete all existing data and recreate tables.")
    
    # Ask for confirmation
    confirm = input("Are you sure you want to proceed? (y/N): ")
    if confirm.lower() != 'y':
        print("Operation cancelled.")
        sys.exit(0)
    
    if reset_database():
        print("=" * 40)
        print("Next steps:")
        print("1. Run: python simple_seed.py")
        print("2. Test your API endpoints")
    else:
        print("Database reset failed!")
        sys.exit(1)