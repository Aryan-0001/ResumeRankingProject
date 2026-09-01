import sqlite3

conn = sqlite3.connect('ai_resume_ranker.db')
cursor = conn.cursor()

# Check company users
cursor.execute('SELECT id, email, role FROM users WHERE role = "company" LIMIT 5')
companies = cursor.fetchall()
print('Company Users:')
for c in companies:
    print(f'User ID: {c[0]}, Email: {c[1]}, Role: {c[2]}')

# Check company profiles
cursor.execute('SELECT user_id, company_name FROM companies LIMIT 5')
company_profiles = cursor.fetchall()
print('\nCompany Profiles:')
for c in company_profiles:
    print(f'User ID: {c[0]}, Company: {c[1]}')

# Check if there are any company users without profiles
cursor.execute('''
    SELECT u.id, u.email 
    FROM users u 
    LEFT JOIN companies c ON u.id = c.user_id 
    WHERE u.role = "company" AND c.id IS NULL
''')
missing_profiles = cursor.fetchall()
print(f'\nCompany users without profiles: {len(missing_profiles)}')
for m in missing_profiles:
    print(f'User ID: {m[0]}, Email: {m[1]}')

conn.close()
