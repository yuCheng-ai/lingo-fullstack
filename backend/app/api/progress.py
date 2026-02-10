"""
Progress tracking: submit lesson results, update user stats.
"""
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timezone, timedelta

from ..database import get_db
from ..models.user import User
from ..models.lesson import Lesson
from ..models.user_progress import UserProgress
from ..models.wrong_question import WrongQuestion
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

from pydantic import BaseModel
from typing import List, Optional

class ProgressSubmit(BaseModel):
    lesson_id: int
    score: int
    hearts_lost: int = 0
    wrong_question_ids: Optional[List[int]] = None

@router.post("/submit")
def submit_lesson_result(
    data: ProgressSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Record a lesson attempt and update user stats."""
    lesson_id = data.lesson_id
    score = data.score
    hearts_lost = data.hearts_lost
    wrong_question_ids = data.wrong_question_ids or []
    
    # 1. Find lesson
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Parse lesson content to get question details
    lesson_content = []
    try:
        lesson_content = json.loads(lesson.content)
    except:
        pass
    
    # 2. Save wrong questions
    for qid in wrong_question_ids:
        # Find the question in lesson content
        question_data = None
        for q in lesson_content:
            if q.get("id") == qid:
                question_data = q
                break
        if question_data:
            # Check if this wrong question already exists for the user
            existing = db.query(WrongQuestion).filter(
                WrongQuestion.user_id == current_user.id,
                WrongQuestion.lesson_id == lesson_id,
                WrongQuestion.question_id == qid
            ).first()
            if not existing:
                wrong_q = WrongQuestion(
                    user_id=current_user.id,
                    lesson_id=lesson_id,
                    question_id=qid,
                    question_text=question_data.get("question", ""),
                    correct_answer=question_data.get("answer", ""),
                    user_answer="",  # We don't track the specific wrong answer in this implementation
                    mastered=False
                )
                db.add(wrong_q)
    
    # 3. Create or update progress
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
    
    # 4. Update user stats
    # Add experience (score/10)
    exp_gained = max(1, score // 10)
    
    # Check for active XP boost
    if current_user.boost_expires_at and current_user.boost_expires_at > datetime.now(timezone.utc):
        exp_gained *= 2
        
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
    
    # 5. Update streak
    now = datetime.now(timezone.utc)
    if current_user.last_lesson_at:
        last_date = current_user.last_lesson_at.date()
        today = now.date()
        yesterday = today - timedelta(days=1)
        
        if last_date == yesterday:
            current_user.streak_count += 1
        elif last_date < yesterday:
            current_user.streak_count = 1
        # if last_date == today, do nothing (streak already counted for today)
    else:
        current_user.streak_count = 1
        
    current_user.last_lesson_at = now
    
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
