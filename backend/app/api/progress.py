"""
Progress tracking: submit lesson results, update user stats.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..database import get_db
from ..models.user import User
from ..models.lesson import Lesson
from ..models.user_progress import UserProgress
from ..api.auth import oauth2_scheme
from jose import JWTError, jwt
from ..config import settings

router = APIRouter()

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/submit")
def submit_lesson_result(
    lesson_id: int,
    score: int,
    hearts_lost: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a lesson attempt and update user stats."""
    # 1. Find lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # 2. Create or update progress
    progress = db.query(UserProgress).filter(
        and_(UserProgress.user_id == current_user.id,
             UserProgress.lesson_id == lesson_id)
    ).first()
    if not progress:
        progress = UserProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            attempts=0,
            completed=False,
            best_score=0
        )
        db.add(progress)
    progress.attempts += 1
    if score > progress.best_score:
        progress.best_score = score
        if score >= 80:   # threshold for completion
            progress.completed = True
    
    # 3. Update user stats
    # Add experience (score/10)
    exp_gained = max(1, score // 10)
    current_user.experience += exp_gained
    # Level up if enough experience (simple formula)
    needed = current_user.level * 100
    if current_user.experience >= needed:
        current_user.level += 1
        current_user.coins += 50  # level-up bonus
    
    # Deduct hearts if any
    if hearts_lost > 0:
        current_user.hearts = max(0, current_user.hearts - hearts_lost)
    # Replenish hearts over time (not implemented here)
    
    # Add coins (score/5)
    coin_gained = score // 5
    current_user.coins += coin_gained
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "message": "Progress saved",
        "experience_gained": exp_gained,
        "coins_gained": coin_gained,
        "user": {
            "level": current_user.level,
            "experience": current_user.experience,
            "hearts": current_user.hearts,
            "max_hearts": current_user.max_hearts,
            "coins": current_user.coins,
        }
    }

@router.get("/")
def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return all progress entries for the current user."""
    progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id
    ).all()
    return progress
