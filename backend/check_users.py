import sqlite3

conn = sqlite3.connect('ai_resume_ranker.db')
cursor = conn.cursor()

# Check company users
cursor.execute('SELECT email, password_hash FROM users WHERE role = "company" LIMIT 3')
companies = cursor.fetchall()
print('Company users and their password hashes:')
for email, password_hash in companies:
    print(f'  {email} - hash: {password_hash[:20]}...')

# Check candidate users
cursor.execute('SELECT email, password_hash FROM users WHERE role = "candidate" LIMIT 3')
candidates = cursor.fetchall()
print('\nCandidate users and their password hashes:')
for email, password_hash in candidates:
    print(f'  {email} - hash: {password_hash[:20]}...')

conn.close()
