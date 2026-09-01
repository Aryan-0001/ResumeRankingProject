from database.session import SessionLocal
from models.user import User, UserRole
from models.candidate import Candidate
from models.company import Company

def fix_user_profiles():
    db = SessionLocal()
    try:
        # Check all users
        users = db.query(User).all()
        print(f"Checking {len(users)} users...")
        
        fixed_count = 0
        for user in users:
            print(f"\nUser: {user.email} ({user.role})")
            
            if user.role == UserRole.candidate:
                candidate = db.query(Candidate).filter(Candidate.user_id == user.id).first()
                if not candidate:
                    print("  ❌ Missing candidate profile - creating...")
                    candidate = Candidate(user_id=user.id)
                    db.add(candidate)
                    fixed_count += 1
                    print("  ✅ Candidate profile created")
                else:
                    print("  ✅ Candidate profile exists")
                    
            elif user.role == UserRole.company:
                company = db.query(Company).filter(Company.user_id == user.id).first()
                if not company:
                    print("  ❌ Missing company profile - creating...")
                    company = Company(user_id=user.id)
                    db.add(company)
                    fixed_count += 1
                    print("  ✅ Company profile created")
                else:
                    print("  ✅ Company profile exists")
        
        if fixed_count > 0:
            db.commit()
            print(f"\n✅ Fixed {fixed_count} missing profiles")
        else:
            print("\n✅ All profiles exist")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_profiles()
