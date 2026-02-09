"""
Lessons and levels endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.level import Level
from ..models.lesson import Lesson

router = APIRouter()

@router.get("/")
def get_levels(db: Session = Depends(get_db)):
    """Return all levels with their lessons."""
    levels = db.query(Level).order_by(Level.order).all()
    result = []
    for level in levels:
        lessons = db.query(Lesson).filter(Lesson.level_id == level.id).order_by(Lesson.order).all()
        result.append({
            "id": level.id,
            "title": level.title,
            "description": level.description,
            "required_experience": level.required_experience,
            "lessons": [
                {
                    "id": l.id,
                    "title": l.title,
                    "description": l.description,
                    "type": l.type,
                    "order": l.order,
                    "content": l.content,
                }
                for l in lessons
            ]
        })
    return result

@router.get("/{lesson_id}")
def get_lesson_detail(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson
