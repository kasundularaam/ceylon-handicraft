# File: app/routes/api/craftsman_api.py

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from ...database import get_db
from ...models import Product, OrderItem, OrderStatus, Rating, User

router = APIRouter(prefix="/api/craftsman")

# Get craftsman insights data


@router.get("/insights/{insight_type}")
async def get_insight(
    insight_type: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    current_user = request.state.user

    if insight_type == "earnings":
        # Calculate total earnings (unit_price * quantity)
        total_earnings = db.query(func.sum(OrderItem.unit_price * OrderItem.quantity)).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Product.user_id == current_user.id,
            OrderItem.status != OrderStatus.DENIED
        ).scalar() or 0

        return {"value": f"{total_earnings:.2f}"}

    elif insight_type == "orders":
        # Count total orders
        order_count = db.query(func.count(OrderItem.id)).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Product.user_id == current_user.id
        ).scalar() or 0

        return {"value": str(order_count)}

    elif insight_type == "products":
        # Count total products
        product_count = db.query(func.count(Product.id)).filter(
            Product.user_id == current_user.id
        ).scalar() or 0

        return {"value": str(product_count)}

    elif insight_type == "ratings":
        # Calculate average rating
        avg_rating = db.query(func.avg(Rating.rating)).join(
            OrderItem, Rating.order_item_id == OrderItem.id
        ).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Product.user_id == current_user.id
        ).scalar() or 0

        return {"value": f"{avg_rating:.1f}"}

    else:
        raise HTTPException(status_code=400, detail="Invalid insight type")

# Get weekly sales data


@router.get("/sales/weekly")
async def get_weekly_sales(
    request: Request,
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    current_user = request.state.user

    # Calculate dates for the last 7 days
    today = datetime.now()
    dates = [(today - timedelta(days=i)).strftime("%Y-%m-%d")
             for i in range(6, -1, -1)]

    # Get sales for each day
    results = []
    for date_str in dates:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        next_day = date_obj + timedelta(days=1)

        daily_sales = db.query(func.sum(OrderItem.unit_price * OrderItem.quantity)).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Product.user_id == current_user.id,
            OrderItem.created_at >= date_obj,
            OrderItem.created_at < next_day,
            OrderItem.status != OrderStatus.DENIED
        ).scalar() or 0

        results.append(daily_sales)

    # Format day labels for display
    day_labels = [(today - timedelta(days=i)).strftime("%a")
                  for i in range(6, -1, -1)]

    return {
        "labels": day_labels,
        "values": results
    }

# Get product reviews


@router.get("/reviews")
async def get_reviews(
    request: Request,
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    current_user = request.state.user

    # Get the most recent reviews for the craftsman's products
    reviews_data = db.query(
        Rating, OrderItem, Product, User
    ).join(
        OrderItem, Rating.order_item_id == OrderItem.id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).join(
        User, OrderItem.user_id == User.id
    ).filter(
        Product.user_id == current_user.id
    ).order_by(
        Rating.id.desc()
    ).limit(5).all()

    reviews = []
    for rating, order_item, product, user in reviews_data:
        # Get the first image if available
        product_image = None
        if hasattr(product, 'attachments') and product.attachments and len(product.attachments) > 0:
            product_image = product.attachments[0].url

        reviews.append({
            "id": rating.id,
            "rating": rating.rating,
            "description": rating.description,
            "created_at": order_item.created_at.isoformat(),
            "product_id": product.id,
            "product_title": product.title,
            "product_image": product_image,
            "user_name": user.name,
            "order_id": order_item.id
        })

    return {"reviews": reviews}
