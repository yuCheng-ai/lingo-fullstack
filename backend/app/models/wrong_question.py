"""
WrongQuestion model to track questions users answered incorrectly.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class WrongQuestion(Base):
    __tablename__ = "wrong_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    question_id = Column(Integer, nullable=False)  # ID within the lesson's content
    question_text = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    user_answer = Column(String, nullable=False)
    mastered = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_reviewed = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="wrong_questions")
    lesson = relationship("Lesson")
