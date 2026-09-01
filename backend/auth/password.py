from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # bcrypt has a 72 byte limit, truncate to UTF-8 bytes if necessary
    password_bytes = password.encode('utf-8')[:72]
    return pwd_context.hash(password_bytes.decode('utf-8', errors='ignore'))


def verify_password(plain_password: str, password_hash: str) -> bool:
    # bcrypt has a 72 byte limit, truncate to UTF-8 bytes if necessary
    password_bytes = plain_password.encode('utf-8')[:72]
    return pwd_context.verify(password_bytes.decode('utf-8', errors='ignore'), password_hash)
