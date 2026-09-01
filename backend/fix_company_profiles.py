import sqlite3
from database.session import SessionLocal
from models.user import User, UserRole
from models.company import Company
from sqlalchemy import text

def fix_company_profiles():
    """Create missing company profiles for existing company users"""
    db = SessionLocal()
    
    try:
        # Get all company users without company profiles
        company_users = db.execute(text("""
            SELECT u.id, u.email 
            FROM users u 
            LEFT JOIN companies c ON u.id = c.user_id 
            WHERE u.role = 'company' AND c.id IS NULL
        """)).fetchall()
        
        print(f"Found {len(company_users)} company users without profiles")
        
        for user_id, email in company_users:
            # Create company profile
            company = Company(
                user_id=user_id,
                company_name=f"Company {user_id}",
                description="Technology solutions provider"
            )
            db.add(company)
            print(f"Created profile for user {user_id}: {email}")
        
        db.commit()
        print("✅ All company profiles created successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_company_profiles()
