from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from auth.jwt import create_access_token
from auth.password import hash_password, verify_password
from database.session import get_db
from models.candidate import Candidate
from models.company import Company
from models.user import User, UserRole
from utils.schemas import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserOut:
    email = str(payload.email).lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        role=UserRole(payload.role),
    )
    db.add(user)
    db.flush()  # get user.id

    if user.role == UserRole.candidate:
        db.add(Candidate(user_id=user.id))
    elif user.role == UserRole.company:
        db.add(Company(user_id=user.id))

    db.commit()
    db.refresh(user)

    return UserOut(id=user.id, email=user.email, role=user.role.value)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = str(payload.email).lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(subject=str(user.id), role=user.role.value)
    return TokenResponse(access_token=token, user=UserOut(id=user.id, email=user.email, role=user.role.value))
