"""
EnglishQuest Backend - FastAPI entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .api import auth, users, lessons, progress, shop, mistakes

# Import models so that Base.metadata is aware of them
from .models import level, lesson, user_progress, wrong_question

# Create database tables (for development, use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EnglishQuest API",
    description="Backend for English learning platform",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(lessons.router, prefix="/api/lessons", tags=["lessons"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])
app.include_router(shop.router, prefix="/api/shop", tags=["shop"])
app.include_router(mistakes.router, prefix="/api/mistakes", tags=["mistakes"])

@app.get("/")
async def root():
    return {"message": "Welcome to EnglishQuest API!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
