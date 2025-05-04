from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from fastapi import Depends
from ...database import get_db
from ...models import OrderStatus, User, UserRole, Product, OrderItem

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
    # Calculate total sales from DELIVERED orders only
    delivered_sales = db.query(
        func.sum(OrderItem.unit_price * OrderItem.quantity)
    ).filter(
        OrderItem.status == OrderStatus.DELIVERED
    ).scalar() or 0

    # Calculate total pending sales (orders that are not delivered/denied/failed)
    pending_sales = db.query(
        func.sum(OrderItem.unit_price * OrderItem.quantity)
    ).filter(
        OrderItem.status.in_([
            OrderStatus.INITIATED,
            OrderStatus.PAID,
            OrderStatus.ACCEPTED,
            OrderStatus.DEPARTED
        ])
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

    # Count delivered orders
    delivered_orders_count = db.query(
        func.count(OrderItem.id)
    ).filter(OrderItem.status == OrderStatus.DELIVERED).scalar() or 0

    return {
        "totalSales": float(delivered_sales),
        "pendingSales": float(pending_sales),
        "totalProducts": total_products,
        "totalCraftsmen": total_craftsmen,
        "totalBuyers": total_buyers,
        "deliveredOrdersCount": delivered_orders_count
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
        OrderItem.created_at <= end_date,
        # Only include DELIVERED orders
        OrderItem.status == OrderStatus.DELIVERED
    ).group_by(
        func.date(OrderItem.created_at)
    ).all()

    # Convert to dictionary for easy lookup
    sales_dict = {}
    for row in sales_data:
        # Handle both string and datetime objects
        if isinstance(row.date, str):
            date_key = row.date  # Already a string
        else:
            # Format datetime to string
            date_key = row.date.strftime("%Y-%m-%d")

        sales_dict[date_key] = float(row.total)

    # Format response with all days, filling in zeros for days with no sales
    result = []
    for date in date_series:
        formatted_date = datetime.strptime(date, "%Y-%m-%d").strftime("%b %d")
        result.append({
            "date": formatted_date,
            "total": sales_dict.get(date, 0)
        })

    return result
