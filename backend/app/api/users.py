from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.api.progress import get_current_user

router = APIRouter()


class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None


@router.get("/me")
def read_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return the current user's profile information."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "level": current_user.level,
        "experience": current_user.experience,
        "coins": current_user.coins,
        "hearts": current_user.hearts,
        "max_hearts": current_user.max_hearts,
    }


@router.put("/me")
def update_user_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's profile (username and/or email)."""
    if update_data.username is not None:
        current_user.username = update_data.username

    if update_data.email is not None:
        # Ensure the new email is not already taken by another user
        existing = db.query(User).filter(
            User.email == update_data.email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already in use"
            )
        current_user.email = update_data.email

    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "level": current_user.level,
        "experience": current_user.experience,
        "coins": current_user.coins,
        "hearts": current_user.hearts,
        "max_hearts": current_user.max_hearts,
    }
