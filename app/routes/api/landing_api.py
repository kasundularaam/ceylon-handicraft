# app/routes/api/landing_api.py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...database import get_db
from ...models import CartItem

router = APIRouter(prefix="/api/landing")


@router.get("/cart/count")
async def get_cart_count(request: Request, db: Session = Depends(get_db)):
    """Get the number of items in the user's cart"""
    if not request.state.user:
        return {"count": 0}

    cart_count = db.query(func.sum(CartItem.quantity)).filter(
        CartItem.user_id == request.state.user.id
    ).scalar() or 0

    return {"count": cart_count}


@router.get("/carousel")
async def get_carousel_data():
    """Return data for the hero carousel"""
    return {
        "slides": [
            {
                "id": 1,
                "title": "Welcome to Ceylon Handicrafts",
                "subtitle": "Discover authentic Sri Lankan craftsmanship",
                "image": "/static/images/hero/welcome.jpg",
                "cta": "Explore Collection",
                "link": "/shop"
            },
            {
                "id": 2,
                "title": "Why We're Different",
                "subtitle": "Direct connections to skilled artisans across Sri Lanka",
                "image": "/static/images/hero/different.jpg",
                "cta": "Learn More",
                "link": "/about"
            },
            {
                "id": 3,
                "title": "Vishva AI — Your Cultural Companion",
                "subtitle": "Get personalized guidance from our AI assistant",
                "image": "/static/images/hero/vishva.jpg",
                "cta": "Chat with Vishva",
                "link": "/vishva"
            }
        ]
    }
