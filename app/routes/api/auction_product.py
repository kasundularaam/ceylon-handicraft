from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, timedelta

from ...database import get_db
from ...models import Product, ProductType, Bid, OrderItem, OrderStatus, User
from ...config import AUCTION_DURATION  # Import the auction duration constant

router = APIRouter(prefix="/api/auction-product")


@router.get("/{product_id}")
async def get_auction_product(product_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Get auction product details by ID, including auction-specific information
    """
    # Check if product exists and is an auction type
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.type == ProductType.AUCTION
    ).first()

    if not product:
        raise HTTPException(
            status_code=404, detail="Auction product not found")

    # Get the highest bid
    highest_bid = db.query(Bid).filter(
        Bid.product_id == product_id
    ).order_by(desc(Bid.bid_price)).first()

    # Get the auction end time
    created_at = product.created_at
    auction_end_time = created_at + timedelta(seconds=AUCTION_DURATION)

    # Check if auction has ended
    auction_ended = datetime.now() > auction_end_time

    # Convert SQLAlchemy model to dictionary
    product_dict = {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "base_price": product.base_price,
        "type": product.type.value,
        "created_at": product.created_at.isoformat(),
        "updated_at": product.updated_at.isoformat(),
        "weight": product.weight,
        "length": product.length,
        "width": product.width,
        "height": product.height,
        "auction_duration": AUCTION_DURATION,
        "auction_end_time": auction_end_time.isoformat(),
        "auction_ended": auction_ended,
        "highest_bid": highest_bid.bid_price if highest_bid else None,
        # Include category if needed
        "category": {
            "id": product.category.id,
            "title": product.category.title,
            "description": product.category.description
        } if product.category else None,
        # Include craftsman info
        "craftsman": {
            "id": product.craftsman.id,
            "name": product.craftsman.name,
            "email": product.craftsman.email,
            "phone": product.craftsman.phone
        } if product.craftsman else None,
        # Include attachments/images
        "attachments": [
            {
                "id": attachment.id,
                "url": attachment.url,
                "alt": attachment.description or product.title
            } for attachment in product.attachments
        ] if product.attachments else []
    }

    return product_dict


@router.get("/{product_id}/bids")
async def get_auction_bids(product_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Get all bids for an auction product, ordered by bid price (highest first)
    """
    # Check if product exists and is an auction type
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.type == ProductType.AUCTION
    ).first()

    if not product:
        raise HTTPException(
            status_code=404, detail="Auction product not found")

    # Query all bids for this product, ordered by bid price (highest first)
    bids = db.query(Bid).filter(
        Bid.product_id == product_id
    ).order_by(desc(Bid.bid_price)).all()

    # Convert bids to dictionary
    bids_list = [
        {
            "id": bid.id,
            "user_id": bid.user_id,
            "bid_price": bid.bid_price,
            "created_at": bid.created_at.isoformat()
        } for bid in bids
    ]

    return bids_list


@router.get("/{product_id}/bidder-status")
async def check_bidder_status(product_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Check if the current user is the highest bidder for this auction
    """
    # Get current user from the request state (added by middleware)
    user = request.state.user

    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Check if product exists and is an auction type
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.type == ProductType.AUCTION
    ).first()

    if not product:
        raise HTTPException(
            status_code=404, detail="Auction product not found")

    # Get the highest bid
    highest_bid = db.query(Bid).filter(
        Bid.product_id == product_id
    ).order_by(desc(Bid.bid_price)).first()

    # Check if the current user is the highest bidder
    is_highest_bidder = highest_bid and highest_bid.user_id == user.id

    return {
        "is_highest_bidder": is_highest_bidder,
        "highest_bid": highest_bid.bid_price if highest_bid else None
    }


@router.post("/{product_id}/create-order")
async def create_order(product_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Create an order for the winning bid after an auction has ended
    Only the highest bidder can create an order after the auction has ended
    """
    # Get current user from the request state (added by middleware)
    user = request.state.user

    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Check if product exists and is an auction type
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.type == ProductType.AUCTION
    ).first()

    if not product:
        raise HTTPException(
            status_code=404, detail="Auction product not found")

    # Check if auction has ended
    created_at = product.created_at
    auction_end_time = created_at + timedelta(seconds=AUCTION_DURATION)

    if datetime.now() <= auction_end_time:
        raise HTTPException(
            status_code=400, detail="Auction has not ended yet")

    # Get the highest bid
    highest_bid = db.query(Bid).filter(
        Bid.product_id == product_id
    ).order_by(desc(Bid.bid_price)).first()

    if not highest_bid:
        raise HTTPException(
            status_code=400, detail="No bids found for this auction")

    # Check if the current user is the highest bidder
    if highest_bid.user_id != user.id:
        raise HTTPException(
            status_code=403, detail="Only the highest bidder can create an order")

    # Check if an order already exists for this product and user
    existing_order = db.query(OrderItem).filter(
        OrderItem.product_id == product_id,
        OrderItem.user_id == user.id
    ).first()

    if existing_order:
        # Return the existing order
        return {
            "id": existing_order.id,
            "product_id": existing_order.product_id,
            "user_id": existing_order.user_id,
            "unit_price": existing_order.unit_price,
            "quantity": existing_order.quantity,
            "status": existing_order.status.value,
            "created_at": existing_order.created_at.isoformat()
        }

    # Create a new order
    new_order = OrderItem(
        product_id=product_id,
        user_id=user.id,
        unit_price=highest_bid.bid_price,
        quantity=1,
        status=OrderStatus.INITIATED
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Return the new order
    return {
        "id": new_order.id,
        "product_id": new_order.product_id,
        "user_id": new_order.user_id,
        "unit_price": new_order.unit_price,
        "quantity": new_order.quantity,
        "status": new_order.status.value,
        "created_at": new_order.created_at.isoformat()
    }
