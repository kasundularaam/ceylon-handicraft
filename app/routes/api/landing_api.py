# app/routes/api/landing_api.py
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import os
from pathlib import Path

from ...database import get_db
from ...models import Bid, CartItem, Product, ProductType, Rating


class CategoryResponse(BaseModel):
    id: str
    title: str
    icon: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    id: str
    title: str
    base_price: float
    type: str
    category_id: str
    image_paths: Optional[List[str]] = None
    current_bid: Optional[float] = None
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


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


@router.get("/featured/sale", response_model=List[ProductResponse])
async def get_featured_sale_products(
    limit: int = Query(8, description="Number of products to return"),
    db: Session = Depends(get_db)
):
    """
    Get featured products for sale (non-auction).
    Returns products sorted by rating and recency.
    """
    # Query for featured sale products - sort by recency
    featured_products = db.query(Product).filter(
        Product.type == ProductType.SALE
    ).order_by(
        Product.created_at.desc()  # Most recent first
    ).limit(limit).all()

    # Prepare response data with image paths and categories
    result = []
    for product in featured_products:
        # Get product category
        category = product.category
        category_data = CategoryResponse.from_orm(
            category) if category else None

        # Create product data with image paths - these will be populated by frontend
        product_data = ProductResponse(
            id=product.id,
            title=product.title,
            base_price=product.base_price,
            type=product.type.value,
            category_id=product.category_id,
            image_paths=[],  # Empty list - will be fetched by frontend
            category=category_data
        )
        result.append(product_data)

    return result


@router.get("/featured/auction", response_model=List[ProductResponse])
async def get_featured_auction_products(
    limit: int = Query(8, description="Number of products to return"),
    db: Session = Depends(get_db)
):
    """
    Get featured auction products.
    Returns products with active bidding and sorted by popularity.
    """
    # Get auction products
    featured_auctions = db.query(Product).filter(
        Product.type == ProductType.AUCTION
    ).order_by(
        Product.created_at.desc()  # Most recent auctions first
    ).limit(limit).all()

    # Prepare response data with bid information and categories
    result = []
    for product in featured_auctions:
        # Get the highest bid for each auction product
        highest_bid = db.query(Bid).filter(
            Bid.product_id == product.id
        ).order_by(desc(Bid.bid_price)).first()

        # Get product category
        category = product.category
        category_data = CategoryResponse.from_orm(
            category) if category else None

        # Create product data with current bid - image paths will be populated by frontend
        product_data = ProductResponse(
            id=product.id,
            title=product.title,
            base_price=product.base_price,
            type=product.type.value,
            category_id=product.category_id,
            image_paths=[],  # Empty list - will be fetched by frontend
            current_bid=highest_bid.bid_price if highest_bid else product.base_price,
            category=category_data
        )
        result.append(product_data)

    return result


@router.get("/product/{product_id}/images")
async def get_product_images(product_id: str):
    """
    Scan the product's image directory and return a list of image file paths.
    """
    # Define the product images directory
    images_dir = Path("app/public/images/products") / product_id

    # Check if directory exists
    if not os.path.exists(images_dir):
        # Try an alternative path
        images_dir = Path("public/images/products") / product_id
        if not os.path.exists(images_dir):
            return {"images": []}

    # Get all image files in the directory
    image_files = []
    if os.path.exists(images_dir):
        for file in os.listdir(images_dir):
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                # Return the path as it would be accessed via the static route
                image_files.append(
                    f"/static/images/products/{product_id}/{file}")

    return {"images": image_files}
