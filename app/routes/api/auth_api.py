from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, UserAddress
from app.services.auth_service import hash_password, verify_password, create_token
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/auth")

# Pydantic models for validation


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class UserCreateRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: UserRole


class AddressCreateRequest(BaseModel):
    user_id: str
    country: str
    state: str
    city: str
    postal_code: str
    address_line: str


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password):
        raise HTTPException(
            status_code=401, detail="Invalid email or password")

    # Create token
    token = create_token(user.id)

    # Return token and user info
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.value
        }
    }


@router.post("/signup")
def signup(request: UserCreateRequest, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    hashed_password = hash_password(request.password)
    user = User(
        name=request.name,
        email=request.email,
        phone=request.phone,
        password=hashed_password,
        role=request.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "message": "User created successfully"
    }


@router.post("/address")
def create_address(request: AddressCreateRequest, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if address already exists
    existing_address = db.query(UserAddress).filter(
        UserAddress.user_id == request.user_id).first()
    if existing_address:
        # Update existing address
        existing_address.country = request.country
        existing_address.state = request.state
        existing_address.city = request.city
        existing_address.postal_code = request.postal_code
        existing_address.address_line = request.address_line
    else:
        # Create new address
        address = UserAddress(
            user_id=request.user_id,
            country=request.country,
            state=request.state,
            city=request.city,
            postal_code=request.postal_code,
            address_line=request.address_line
        )
        db.add(address)

    db.commit()

    # Create token for user
    token = create_token(user.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value
        },
        "message": "Address added successfully"
    }


@router.get("/me")
def get_current_user(request: Request):
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role.value
    }
