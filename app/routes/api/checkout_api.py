# app/routes/api/checkout_api.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models import OrderItem, Product, OrderStatus

router = APIRouter(prefix="/api/checkout-page")


@router.get("/summary")
async def get_checkout_summary(request: Request, db: Session = Depends(get_db)):
    """Get order summary for checkout page"""
    user = request.state.user

    # Get the user's orders with INITIATED status
    orders = (
        db.query(OrderItem)
        .filter(OrderItem.user_id == user.id, OrderItem.status == OrderStatus.INITIATED)
        .options(
            joinedload(OrderItem.product)
            .joinedload(Product.craftsman)
        )
        .all()
    )

    # Convert to dictionaries (with relationship data)
    result = {"orders": []}

    for order in orders:
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "unit_price": order.unit_price,
            "status": order.status.value,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "product": {
                "id": order.product.id,
                "title": order.product.title,
                "description": order.product.description,
                "craftsman": {
                    "id": order.product.craftsman.id,
                    "name": order.product.craftsman.name
                }
            }
        }
        result["orders"].append(order_dict)

    return result


@router.post("/process-payment")
async def process_payment(
    request: Request,
    payment_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Process payment and update order status"""
    user = request.state.user

    # Get the user's orders with INITIATED status
    orders = (
        db.query(OrderItem)
        .filter(OrderItem.user_id == user.id, OrderItem.status == OrderStatus.INITIATED)
        .all()
    )

    if not orders:
        raise HTTPException(status_code=400, detail="No orders to process")

    # In a real system, this is where you would integrate with a payment gateway
    # For this example, we'll simulate a successful payment

    # Update order status to PAID
    for order in orders:
        order.status = OrderStatus.PAID
        order.updated_at = datetime.now()

    # Commit changes
    db.commit()

    return {"message": "Payment processed successfully", "order_count": len(orders)}
