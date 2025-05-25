import secrets
import uuid
from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.security import create_access_token
from app.models import Message, QRCode, QRCodeCreate, QRCodePublic, Token, User

router = APIRouter()
security = HTTPBearer()


@router.post("/generate", response_model=QRCodePublic)
def generate_qr_code(session: SessionDep) -> Any:
    """
    Generate a new QR code for login.
    QR codes expire after 5 minutes.
    """
    # Generate a secure random code
    code = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    qr_code = QRCode(
        code=code,
        expires_at=expires_at,
    )
    session.add(qr_code)
    session.commit()
    session.refresh(qr_code)
    
    return qr_code


@router.post("/validate", response_model=Token)
def validate_qr_code(
    *, session: SessionDep, qr_code: str, employee_id: str
) -> Any:
    """
    Validate QR code and authenticate user.
    """
    # Find the QR code
    statement = select(QRCode).where(QRCode.code == qr_code)
    db_qr_code = session.exec(statement).first()
    
    if not db_qr_code:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid QR code",
        )
    
    # Check if QR code is expired
    if datetime.utcnow() > db_qr_code.expires_at:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="QR code expired",
        )
    
    # Check if QR code is already used
    if db_qr_code.is_used:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="QR code already used",
        )
    
    # Find the user by employee_id
    user_statement = select(User).where(User.employee_id == employee_id)
    user = session.exec(user_statement).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Employee not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
        )
    
    # Mark QR code as used
    db_qr_code.is_used = True
    session.add(db_qr_code)
    session.commit()
    
    # Create access token
    access_token = create_access_token(subject=str(user.id))
    
    return Token(access_token=access_token)


@router.get("/status/{code}")
def check_qr_status(session: SessionDep, code: str) -> Any:
    """
    Check if QR code is still valid and unused.
    """
    statement = select(QRCode).where(QRCode.code == code)
    qr_code = session.exec(statement).first()
    
    if not qr_code:
        return {"valid": False, "message": "QR code not found"}
    
    if datetime.utcnow() > qr_code.expires_at:
        return {"valid": False, "message": "QR code expired"}
    
    if qr_code.is_used:
        return {"valid": False, "message": "QR code already used"}
    
    return {
        "valid": True, 
        "expires_at": qr_code.expires_at,
        "remaining_seconds": int((qr_code.expires_at - datetime.utcnow()).total_seconds())
    }
