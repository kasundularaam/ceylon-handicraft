import jwt
from datetime import datetime
from passlib.context import CryptContext
from app.database import pwd_context

# JWT configuration
# In production, use environment variables
JWT_SECRET = "ceylon_handicrafts_secret_key"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Hash a password for storing."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a stored password against one provided by user."""
    return pwd_context.verify(plain_password, hashed_password)


def create_token(user_id: str) -> str:
    """Create a JWT token for a user (no expiration)."""
    payload = {
        "sub": user_id,
        "iat": datetime.utcnow()
        # No exp claim since we want tokens without expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def verify_token(token: str):
    """Verify a JWT token and return the payload if valid."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
