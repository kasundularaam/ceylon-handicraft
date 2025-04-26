from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from fastapi import Depends
from ...database import get_db
from ...models import User, UserRole, Product, OrderItem

router = APIRouter(prefix="/api/admin")


@router.get("/profile")
async def get_admin_profile(db: Session = Depends(get_db)):
    # In a real application, you would use authentication here
    # For now, we'll just return the first admin from the database
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()

    if not admin:
        return {"name": "Admin User", "email": "admin@ceylonhandicrafts.com", "role": "Admin"}

    return {
        "id": admin.id,
        "name": admin.name,
        "email": admin.email,
        "role": admin.role.value
    }


@router.get("/insights")
async def get_admin_insights(db: Session = Depends(get_db)):
    # Calculate total sales
    total_sales_query = db.query(
        func.sum(OrderItem.unit_price * OrderItem.quantity)
    ).scalar() or 0

    # Count total products
    total_products = db.query(func.count(Product.id)).scalar() or 0

    # Count craftsmen
    total_craftsmen = db.query(
        func.count(User.id)
    ).filter(User.role == UserRole.CRAFTSMAN).scalar() or 0

    # Count buyers
    total_buyers = db.query(
        func.count(User.id)
    ).filter(User.role == UserRole.BUYER).scalar() or 0

    return {
        "totalSales": float(total_sales_query),
        "totalProducts": total_products,
        "totalCraftsmen": total_craftsmen,
        "totalBuyers": total_buyers
    }


@router.get("/sales")
async def get_sales_data(
    days: int = Query(5, ge=1, le=30),
    db: Session = Depends(get_db)
):
    # Calculate start date
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    # Create date series for the last N days
    date_series = []
    current_date = start_date
    while current_date <= end_date:
        date_series.append(current_date.strftime("%Y-%m-%d"))
        current_date += timedelta(days=1)

    # Query sales data grouped by day
    sales_data = db.query(
        func.date(OrderItem.created_at).label("date"),
        func.sum(OrderItem.unit_price * OrderItem.quantity).label("total")
    ).filter(
        OrderItem.created_at >= start_date,
        OrderItem.created_at <= end_date
    ).group_by(
        func.date(OrderItem.created_at)
    ).all()

    # Convert to dictionary for easy lookup
    sales_dict = {row.date.strftime(
        "%Y-%m-%d"): float(row.total) for row in sales_data}

    # Format response with all days, filling in zeros for days with no sales
    result = []
    for date in date_series:
        formatted_date = datetime.strptime(date, "%Y-%m-%d").strftime("%b %d")
        result.append({
            "date": formatted_date,
            "total": sales_dict.get(date, 0)
        })

    return result


@router.get("/orders/recent")
async def get_recent_orders(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    # Query recent orders with related data
    orders = db.query(OrderItem).order_by(
        OrderItem.created_at.desc()
    ).limit(limit).all()

    # Format response
    result = []
    for order in orders:
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "product_id": order.product_id,
            "quantity": order.quantity,
            "unit_price": order.unit_price,
            "status": order.status.value,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "user": {
                "id": order.user.id,
                "name": order.user.name,
                "email": order.user.email
            },
            "product": {
                "id": order.product.id,
                "title": order.product.title,
                "base_price": order.product.base_price,
                "craftsman_id": order.product.user_id
            }
        })

    return result
