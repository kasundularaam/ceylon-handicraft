from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from enum import Enum

from ...database import get_db
from ...models import OrderItem, OrderStatus, UserRole, User, Product

router = APIRouter(prefix="/api/craftsman")

# Helper function to verify craftsman role


def verify_craftsman(request):
    user = request.state.user
    if not user or user.role != UserRole.CRAFTSMAN:
        raise HTTPException(
            status_code=403,
            detail="You must be a craftsman to access this resource"
        )
    return user

# Get all orders for the craftsman


@router.get("/orders")
async def get_craftsman_orders(
    request: Request,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Verify the user is a craftsman
    user = verify_craftsman(request)

    # Create base query with joins for all needed relationships
    query = (
        db.query(OrderItem)
        .join(Product, OrderItem.product_id == Product.id)
        .options(
            joinedload(OrderItem.product).joinedload(Product.category),
            joinedload(OrderItem.product).joinedload(Product.attachments),
            joinedload(OrderItem.user).joinedload(User.address)
        )
        # Only orders for this craftsman's products
        .filter(Product.user_id == user.id)
    )

    # Apply status filter if provided
    if status:
        try:
            # Get the enum by name (uppercase) instead of by value
            # This handles the difference between enum names (PAID) and values ("Paid")
            if hasattr(OrderStatus, status):
                order_status = getattr(OrderStatus, status)
                query = query.filter(OrderItem.status == order_status)
            else:
                raise ValueError(f"Status {status} not found")
        except ValueError:
            valid_statuses = ", ".join([s.name for s in OrderStatus])
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Valid statuses are: {valid_statuses}"
            )

    # Execute query
    orders = query.all()

    # Convert to dict for JSON response
    result = []
    for order in orders:
        # Safe access to product and category
        product_data = {
            "id": order.product.id if order.product else None,
            "title": order.product.title if order.product else None,
            "description": order.product.description if order.product else None,
            "base_price": order.product.base_price if order.product else None,
            "category": {
                "id": order.product.category.id,
                "title": order.product.category.title
            } if order.product and order.product.category else None,
            "attachments": [
                {"id": att.id, "url": att.url, "type": att.type.value}
                for att in order.product.attachments
            ] if order.product and order.product.attachments else []
        } if order.product else None

        # Safe access to user and address
        user_data = None
        if order.user:
            user_data = {
                "id": order.user.id,
                "name": order.user.name,
                "email": order.user.email,
                "phone": order.user.phone,
                "address": {
                    "country": order.user.address.country,
                    "state": order.user.address.state,
                    "city": order.user.address.city,
                    "postal_code": order.user.address.postal_code,
                    "address_line": order.user.address.address_line
                } if order.user.address else None
            }

        order_dict = {
            "id": order.id,
            "quantity": order.quantity,
            "unit_price": order.unit_price,
            "status": order.status.value,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "product": product_data,
            "user": user_data
        }
        result.append(order_dict)

    return result

# Update order status


@router.patch("/orders/{order_id}")
async def update_order_status(
    order_id: str,
    request: Request,
    status_update: dict,
    db: Session = Depends(get_db)
):
    # Verify the user is a craftsman
    user = verify_craftsman(request)

    # Validate the status update data
    if "status" not in status_update:
        raise HTTPException(
            status_code=400,
            detail="Status field is required"
        )

    # Get the new status
    try:
        # Get the enum by name (uppercase) instead of by value
        status_name = status_update["status"]
        if hasattr(OrderStatus, status_name):
            new_status = getattr(OrderStatus, status_name)
        else:
            raise ValueError(f"Status {status_name} not found")
    except ValueError:
        valid_statuses = ", ".join([s.name for s in OrderStatus])
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Valid statuses are: {valid_statuses}"
        )

    # Find the order
    order = (
        db.query(OrderItem)
        .join(Product, OrderItem.product_id == Product.id)
        .options(
            joinedload(OrderItem.product).joinedload(Product.category),
            joinedload(OrderItem.product).joinedload(Product.attachments),
            joinedload(OrderItem.user).joinedload(User.address)
        )
        .filter(OrderItem.id == order_id, Product.user_id == user.id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found or not authorized to access this order"
        )

    # Validate status transition
    valid_transitions = {
        OrderStatus.PAID: [OrderStatus.ACCEPTED, OrderStatus.DENIED],
        OrderStatus.ACCEPTED: [OrderStatus.DEPARTED],
        OrderStatus.DEPARTED: [OrderStatus.DELIVERED, OrderStatus.DELIVER_FAILED],
        OrderStatus.DELIVER_FAILED: [OrderStatus.DEPARTED, OrderStatus.DENIED]
    }

    current_status = order.status

    if current_status not in valid_transitions or new_status not in valid_transitions.get(current_status, []):
        allowed = ", ".join(
            [s.value for s in valid_transitions.get(current_status, [])])
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status transition. From {current_status.value}, allowed transitions are: {allowed}"
        )

    # Update the order status
    order.status = new_status
    db.commit()
    db.refresh(order)

    # Return updated order data
    # Safe access to product and category
    product_data = {
        "id": order.product.id if order.product else None,
        "title": order.product.title if order.product else None,
        "description": order.product.description if order.product else None,
        "base_price": order.product.base_price if order.product else None,
        "category": {
            "id": order.product.category.id,
            "title": order.product.category.title
        } if order.product and order.product.category else None,
        "attachments": [
            {"id": att.id, "url": att.url, "type": att.type.value}
            for att in order.product.attachments
        ] if order.product and order.product.attachments else []
    } if order.product else None

    # Safe access to user and address
    user_data = None
    if order.user:
        user_data = {
            "id": order.user.id,
            "name": order.user.name,
            "email": order.user.email,
            "phone": order.user.phone,
            "address": {
                "country": order.user.address.country,
                "state": order.user.address.state,
                "city": order.user.address.city,
                "postal_code": order.user.address.postal_code,
                "address_line": order.user.address.address_line
            } if order.user.address else None
        }

    result = {
        "id": order.id,
        "quantity": order.quantity,
        "unit_price": order.unit_price,
        "status": order.status.value,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "product": product_data,
        "user": user_data
    }

    return result
