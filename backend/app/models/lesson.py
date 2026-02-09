"""
Lesson model: individual learning unit inside a level.
"""
from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    level_id = Column(Integer, ForeignKey("levels.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    type = Column(String, default="multiple_choice")  # multiple_choice, fill_in, etc.
    content = Column(Text, default="")  # JSON string storing questions/answers
    order = Column(Integer, nullable=False)  # within level

    level = relationship("Level", backref="lessons")
