"""
Tracks a user's progress through lessons.
"""
from sqlalchemy import Column, Integer, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from ..database import Base

class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    attempts = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    best_score = Column(Integer, default=0)  # percentage
    last_attempt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson")
