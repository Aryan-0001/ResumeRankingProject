import sqlite3

conn = sqlite3.connect('ai_resume_ranker.db')
cursor = conn.cursor()

cursor.execute('SELECT name FROM sqlite_master WHERE type="table"')
tables = cursor.fetchall()

print('Database tables:')
for table in tables:
    print(f'  - {table[0]}')

# Check if we have users
cursor.execute('SELECT COUNT(*) FROM users')
user_count = cursor.fetchone()[0]
print(f'Total users: {user_count}')

conn.close()
