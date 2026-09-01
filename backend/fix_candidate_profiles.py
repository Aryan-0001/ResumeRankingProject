import sqlite3
from database.session import SessionLocal
from models.user import User, UserRole
from models.candidate import Candidate
from sqlalchemy import text

def fix_candidate_profiles():
    """Create missing candidate profiles for existing candidate users"""
    db = SessionLocal()
    
    try:
        # Get all candidate users without candidate profiles
        candidate_users = db.execute(text("""
            SELECT u.id, u.email 
            FROM users u 
            LEFT JOIN candidates c ON u.id = c.user_id 
            WHERE u.role = 'candidate' AND c.id IS NULL
        """)).fetchall()
        
        print(f"Found {len(candidate_users)} candidate users without profiles")
        
        for user_id, email in candidate_users:
            # Create candidate profile
            candidate = Candidate(
                user_id=user_id,
                name=f"Candidate {user_id}",
                skills="Python, JavaScript, Communication",
                education="Bachelor's Degree",
                experience="Entry-level professional"
            )
            db.add(candidate)
            print(f"Created profile for user {user_id}: {email}")
        
        db.commit()
        print("✅ All candidate profiles created successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_candidate_profiles()
