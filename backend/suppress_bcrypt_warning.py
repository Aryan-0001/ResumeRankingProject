import warnings
import logging

# Suppress the specific bcrypt warning
logging.getLogger('passlib.handlers.bcrypt').setLevel(logging.ERROR)

# Also suppress the warning at the Python level
warnings.filterwarnings('ignore', message='.*error reading bcrypt version.*')

print("✅ bcrypt warning suppressed - backend will run without this error")
