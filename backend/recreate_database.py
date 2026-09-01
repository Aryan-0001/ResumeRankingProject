import os
import sqlite3
from database.session import init_db, engine
from database.base import Base

def recreate_database():
    # Close any existing connections
    engine.dispose()
    
    # Get database path
    db_path = "ai_resume_ranker.db"
    
    # Remove old database file
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"✅ Removed old database: {db_path}")
        except Exception as e:
            print(f"❌ Could not remove database: {e}")
            return False
    
    # Create new database with correct schema
    try:
        init_db()
        print("✅ Database recreated with correct schema")
        return True
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        return False

if __name__ == "__main__":
    if recreate_database():
        print("\n🎉 Database is ready! Now run the dummy data script.")
        print("Run: python create_dummy_data.py")
    else:
        print("\n❌ Failed to recreate database")
