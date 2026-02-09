"""
User model representing a learner.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    
    # Profile
    avatar_url = Column(String, default="")
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    hearts = Column(Integer, default=3)          # current hearts
    max_hearts = Column(Integer, default=5)      # maximum hearts possible
    coins = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Relationships
    progress = relationship("UserProgress", back_populates="user")
