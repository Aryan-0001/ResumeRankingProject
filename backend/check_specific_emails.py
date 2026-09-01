from database.session import SessionLocal
from models.user import User, UserRole

def check_specific_emails():
    db = SessionLocal()
    try:
        # Check for your specific emails
        emails_to_check = ["def@gmail.com", "abc@gmail.com"]
        
        for email in emails_to_check:
            user = db.query(User).filter(User.email == email.lower()).first()
            if user:
                print(f"✅ Found: {email}")
                print(f"   ID: {user.id}")
                print(f"   Role: {user.role}")
                print(f"   Created: {user.created_at if hasattr(user, 'created_at') else 'Unknown'}")
            else:
                print(f"❌ Not found: {email}")
                
        # Show all users for debugging
        print(f"\nAll users in database:")
        users = db.query(User).all()
        for user in users[:10]:  # Show first 10
            print(f"  {user.email} ({user.role})")
        if len(users) > 10:
            print(f"  ... and {len(users) - 10} more")
            
    finally:
        db.close()

if __name__ == "__main__":
    check_specific_emails()
