# app/routes/api/cart_api.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import CartItem, OrderItem, Product, OrderStatus

router = APIRouter(prefix="/api/cart-page")


@router.get("/items")
async def get_cart_items(request: Request, db: Session = Depends(get_db)):
    """Get all cart items for the current user"""
    user = request.state.user

    # Query cart items with product and craftsman details
    cart_items = (
        db.query(CartItem)
        .filter(CartItem.user_id == user.id)
        .options(
            joinedload(CartItem.product)
            .joinedload(Product.craftsman),
            joinedload(CartItem.product)
            .joinedload(Product.attachments)
        )
        .all()
    )

    # Convert to dictionaries (with relationship data)
    result = []
    for item in cart_items:
        item_dict = {
            "id": item.id,
            "user_id": item.user_id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "product": {
                "id": item.product.id,
                "title": item.product.title,
                "description": item.product.description,
                "base_price": item.product.base_price,
                "craftsman": {
                    "id": item.product.craftsman.id,
                    "name": item.product.craftsman.name
                },
                "attachments": [
                    {"url": attachment.url, "type": attachment.type}
                    for attachment in item.product.attachments
                ]
            }
        }
        result.append(item_dict)

    return result


@router.post("/checkout")
async def checkout(request: Request, db: Session = Depends(get_db)):
    """Convert cart items to orders and clear the cart"""
    user = request.state.user

    # Get all cart items for the user
    cart_items = (
        db.query(CartItem)
        .filter(CartItem.user_id == user.id)
        .options(joinedload(CartItem.product))
        .all()
    )

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Create order items from cart items
    order_items = []
    for cart_item in cart_items:
        order_item = OrderItem(
            user_id=user.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            unit_price=cart_item.product.base_price,
            status=OrderStatus.INITIATED,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(order_item)
        order_items.append(order_item)

    # Remove cart items
    for cart_item in cart_items:
        db.delete(cart_item)

    # Commit changes
    db.commit()

    return {"message": "Checkout successful", "order_count": len(order_items)}


@router.patch("/items/{item_id}")
async def update_cart_item(
    item_id: str,
    request: Request,
    data: dict,
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    user = request.state.user

    # Validate data
    if "quantity" not in data or not isinstance(data["quantity"], int) or data["quantity"] < 1:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    # Get cart item
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == user.id)
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Update quantity
    cart_item.quantity = data["quantity"]
    cart_item.updated_at = datetime.now()

    # Commit changes
    db.commit()

    return {"message": "Cart item updated", "id": cart_item.id, "quantity": cart_item.quantity}


@router.delete("/items/{item_id}")
async def delete_cart_item(item_id: str, request: Request, db: Session = Depends(get_db)):
    """Remove item from cart"""
    user = request.state.user

    # Get cart item
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == user.id)
        .first()
    )

    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Delete cart item
    db.delete(cart_item)
    db.commit()

    return {"message": "Cart item removed", "id": item_id}
