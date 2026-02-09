"""
Level model: represents a difficulty tier containing multiple lessons.
"""
from sqlalchemy import Column, Integer, String, Text
from ..database import Base

class Level(Base):
    __tablename__ = "levels"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    order = Column(Integer, unique=True, nullable=False)  # 1,2,3...
    required_experience = Column(Integer, default=0)  # XP needed to unlock
