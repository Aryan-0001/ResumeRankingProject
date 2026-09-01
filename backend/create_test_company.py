import sqlite3
from passlib.context import CryptContext
import warnings
import logging

# Suppress bcrypt warning
warnings.filterwarnings('ignore', message='.*error reading bcrypt version.*')
logging.getLogger('passlib.handlers.bcrypt').setLevel(logging.ERROR)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# Create test company user
email = "testcompany@demo.com"
password = "test123"
hashed_password = hash_password(password)

conn = sqlite3.connect('ai_resume_ranker.db')
cursor = conn.cursor()

# Check if user already exists
cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
existing_user = cursor.fetchone()

if existing_user:
    print(f'User {email} already exists')
else:
    # Insert new company user
    cursor.execute('''
        INSERT INTO users (email, password_hash, role) 
        VALUES (?, ?, 'company')
    ''', (email, hashed_password))
    
    user_id = cursor.lastrowid
    
    # Create company profile
    cursor.execute('''
        INSERT INTO companies (user_id, company_name, description) 
        VALUES (?, ?, ?)
    ''', (user_id, "Test Company", "A test company for job posting"))
    
    conn.commit()
    print(f'✅ Created test company user: {email}')
    print(f'   Password: {password}')
    print(f'   User ID: {user_id}')

conn.close()
