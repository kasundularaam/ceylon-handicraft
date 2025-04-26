from fastapi import Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import verify_token

security = HTTPBearer(auto_error=False)


async def auth_middleware(request: Request, call_next):
    # Extract token from headers if present
    authorization = request.headers.get("Authorization")

    request.state.user = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")

        # Verify token and get user_id
        user_payload = verify_token(token)

        if user_payload:
            # Import here to avoid circular imports
            from app.models import User

            user_id = user_payload.get("sub")
            if user_id:
                # Get DB session
                db = next(get_db())

                try:
                    # Get user from database
                    user = db.query(User).filter(User.id == user_id).first()
                    if user:
                        # Set user in request state
                        request.state.user = user
                finally:
                    db.close()

    # Continue processing the request
    response = await call_next(request)
    return response
