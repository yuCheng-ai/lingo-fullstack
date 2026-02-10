from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.user import User
from app.api.progress import get_current_user

router = APIRouter()

# Mock shop items – in a real application these would come from a database
SHOP_ITEMS = [
    {"id": 1, "name": "Extra Heart", "description": "Increase max hearts by 1", "price": 50, "type": "heart"},
    {"id": 2, "name": "Coins Pack", "description": "Get 100 coins", "price": 200, "type": "coins"},
    {"id": 3, "name": "Experience Boost", "description": "Double XP for 30 minutes", "price": 100, "type": "boost"},
]


class ShopItemResponse(BaseModel):
    id: int
    name: str
    description: str
    price: int
    type: str


class BuyRequest(BaseModel):
    item_id: int


@router.get("/items", response_model=List[ShopItemResponse])
def get_shop_items():
    """Return a list of all available shop items."""
    return SHOP_ITEMS


@router.post("/buy")
def buy_item(
    request: BuyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase a shop item for the current user."""
    # Find the requested item
    item = next((it for it in SHOP_ITEMS if it["id"] == request.item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Check if the user has enough coins
    if current_user.coins < item["price"]:
        raise HTTPException(status_code=400, detail="Not enough coins")

    # Deduct the price
    current_user.coins -= item["price"]

    # Apply the item effect
    if item["type"] == "heart":
        current_user.max_hearts += 1
        current_user.hearts = current_user.max_hearts  # refill hearts
    elif item["type"] == "coins":
        current_user.coins += 100  # grant 100 coins (net effect: -price +100)
    elif item["type"] == "boost":
        # Double XP for 30 minutes
        current_user.boost_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    db.commit()
    db.refresh(current_user)

    return {
        "message": f"Purchased {item['name']} successfully",
        "remaining_coins": current_user.coins,
        "max_hearts": current_user.max_hearts,
    }
