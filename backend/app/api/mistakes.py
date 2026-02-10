"""
API for retrieving and managing wrong questions (mistake notebook).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.user import User
from ..models.wrong_question import WrongQuestion
from ..api.auth import oauth2_scheme
from jose import JWTError, jwt
from ..config import settings
from pydantic import BaseModel
from datetime import datetime

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

class WrongQuestionResponse(BaseModel):
    id: int
    lesson_id: int
    question_id: int
    question_text: str
    correct_answer: str
    user_answer: str
    mastered: bool
    created_at: datetime
    last_reviewed: Optional[datetime]
    lesson_title: Optional[str]

class MarkMasteredRequest(BaseModel):
    wrong_question_id: int

@router.get("/", response_model=List[WrongQuestionResponse])
def get_wrong_questions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all wrong questions for the current user."""
    wrong_questions = db.query(WrongQuestion).filter(
        WrongQuestion.user_id == current_user.id,
        WrongQuestion.mastered == False
    ).all()
    
    # We need to get lesson titles
    from ..models.lesson import Lesson
    result = []
    for wq in wrong_questions:
        lesson = db.query(Lesson).filter(Lesson.id == wq.lesson_id).first()
        result.append(WrongQuestionResponse(
            id=wq.id,
            lesson_id=wq.lesson_id,
            question_id=wq.question_id,
            question_text=wq.question_text,
            correct_answer=wq.correct_answer,
            user_answer=wq.user_answer,
            mastered=wq.mastered,
            created_at=wq.created_at,
            last_reviewed=wq.last_reviewed,
            lesson_title=lesson.title if lesson else None
        ))
    return result

@router.post("/{wrong_question_id}/master")
def mark_as_mastered(
    wrong_question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a wrong question as mastered."""
    wrong_question = db.query(WrongQuestion).filter(
        WrongQuestion.id == wrong_question_id,
        WrongQuestion.user_id == current_user.id
    ).first()
    if not wrong_question:
        raise HTTPException(status_code=404, detail="Wrong question not found")
    
    wrong_question.mastered = True
    wrong_question.last_reviewed = datetime.now()
    db.commit()
    
    return {"message": "Question marked as mastered"}
