from database.session import SessionLocal
from models.user import User, UserRole
from models.candidate import Candidate
from models.company import Company
from auth.password import hash_password

def create_test_accounts():
    db = SessionLocal()
    try:
        # Create candidate account: def@gmail.com
        candidate_user = User(
            email="def@gmail.com",
            password_hash=hash_password("password123"),  # Default password
            role=UserRole.candidate
        )
        db.add(candidate_user)
        db.flush()
        
        # Create candidate profile
        candidate_profile = Candidate(user_id=candidate_user.id)
        db.add(candidate_profile)
        
        # Create company account: abc@gmail.com
        company_user = User(
            email="abc@gmail.com", 
            password_hash=hash_password("password123"),  # Default password
            role=UserRole.company
        )
        db.add(company_user)
        db.flush()
        
        # Create company profile
        company_profile = Company(
            user_id=company_user.id,
            company_name="Test Company",
            description="A test company for demonstration purposes"
        )
        db.add(company_profile)
        
        db.commit()
        
        print("✅ Test accounts created successfully!")
        print("\n📧 Login Credentials:")
        print("Candidate Account:")
        print("  Email: def@gmail.com")
        print("  Password: password123")
        print("\nCompany Account:")
        print("  Email: abc@gmail.com") 
        print("  Password: password123")
        
    except Exception as e:
        print(f"❌ Error creating accounts: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_accounts()
