from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy import func
from sqlalchemy.orm import Session
from ...database import get_db
from ...models import OrderItem, Product, User, UserRole, OrderStatus
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/craftsman")


@router.get("/dashboard")
async def get_craftsman_dashboard(
    request: Request,
    db: Session = Depends(get_db)
):
    # Ensure user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    craftsman_id = request.state.user.id

    # Get total completed sales
    total_completed_sales = db.query(
        func.sum(OrderItem.unit_price * OrderItem.quantity)
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Product.user_id == craftsman_id,
        OrderItem.status == OrderStatus.DELIVERED
    ).scalar() or 0

    # Get total pending sales
    total_pending_sales = db.query(
        func.sum(OrderItem.unit_price * OrderItem.quantity)
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Product.user_id == craftsman_id,
        OrderItem.status.in_([
            OrderStatus.INITIATED,
            OrderStatus.PAID,
            OrderStatus.ACCEPTED,
            OrderStatus.DEPARTED
        ])
    ).scalar() or 0

    # Get total products
    total_products = db.query(func.count(Product.id)).filter(
        Product.user_id == craftsman_id
    ).scalar() or 0

    # Get delivered orders count
    delivered_orders_count = db.query(
        func.count(OrderItem.id)
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Product.user_id == craftsman_id,
        OrderItem.status == OrderStatus.DELIVERED
    ).scalar() or 0

    # Get pending orders count
    pending_orders_count = db.query(
        func.count(OrderItem.id)
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Product.user_id == craftsman_id,
        OrderItem.status.in_([
            OrderStatus.INITIATED,
            OrderStatus.PAID,
            OrderStatus.ACCEPTED,
            OrderStatus.DEPARTED
        ])
    ).scalar() or 0

    return {
        "totalCompletedSales": float(total_completed_sales),
        "totalPendingSales": float(total_pending_sales),
        "totalProducts": total_products,
        "deliveredOrdersCount": delivered_orders_count,
        "pendingOrdersCount": pending_orders_count
    }


@router.get("/weekly-sales")
async def get_craftsman_weekly_sales(
    request: Request,
    db: Session = Depends(get_db)
):
    # Ensure user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    craftsman_id = request.state.user.id

    # Get dates for last 7 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=6)

    # Create array of dates
    dates = []
    current_date = start_date
    while current_date <= end_date:
        dates.append(current_date.strftime("%Y-%m-%d"))
        current_date += timedelta(days=1)

    # Get completed sales for each day
    completed_sales = []
    for date_str in dates:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        next_day = date_obj + timedelta(days=1)

        daily_sales = db.query(
            func.sum(OrderItem.unit_price * OrderItem.quantity)
        ).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Product.user_id == craftsman_id,
            OrderItem.created_at >= date_obj,
            OrderItem.created_at < next_day,
            OrderItem.status == OrderStatus.DELIVERED
        ).scalar() or 0

        completed_sales.append(float(daily_sales))

    # Get pending sales for each day
    pending_sales = []
    for date_str in dates:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        next_day = date_obj + timedelta(days=1)

        daily_pending = db.query(
            func.sum(OrderItem.unit_price * OrderItem.quantity)
        ).join(
            Product, OrderItem.product_id == Product.id
        ).filter(
            Product.user_id == craftsman_id,
            OrderItem.created_at >= date_obj,
            OrderItem.created_at < next_day,
            OrderItem.status.in_([
                OrderStatus.INITIATED,
                OrderStatus.PAID,
                OrderStatus.ACCEPTED,
                OrderStatus.DEPARTED
            ])
        ).scalar() or 0

        pending_sales.append(float(daily_pending))

    # Format day labels
    day_labels = [(datetime.strptime(date, "%Y-%m-%d")).strftime("%a")
                  for date in dates]

    return {
        "labels": day_labels,
        "completedSales": completed_sales,
        "pendingSales": pending_sales
    }


@router.get("/orders-by-status")
async def get_craftsman_orders_by_status(
    request: Request,
    db: Session = Depends(get_db)
):
    # Ensure user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    craftsman_id = request.state.user.id

    # Query to count orders by status
    status_counts = db.query(
        OrderItem.status,
        func.count(OrderItem.id).label('count')
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Product.user_id == craftsman_id
    ).group_by(
        OrderItem.status
    ).all()

    # Convert to dictionary
    result = {}
    for status in OrderStatus:
        result[status.value] = 0

    for row in status_counts:
        result[row.status.value] = row.count

    # Format for chart
    status_data = [
        {"status": status, "count": count}
        for status, count in result.items()
    ]

    return {
        "ordersByStatus": status_data
    }


@router.get("/recent-orders")
async def get_craftsman_recent_orders(
    request: Request,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    # Ensure user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    craftsman_id = request.state.user.id

    # Get recent orders
    recent_orders = db.query(OrderItem).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Product.user_id == craftsman_id
    ).order_by(
        OrderItem.created_at.desc()
    ).limit(limit).all()

    # Format for response
    orders_data = []
    for order in recent_orders:
        order_date = order.created_at
        if isinstance(order_date, str):
            formatted_date = order_date
        else:
            formatted_date = order_date.strftime('%Y-%m-%d %H:%M:%S')

        orders_data.append({
            "id": order.id,
            "product": order.product.title,
            "buyer": order.user.name,
            "status": order.status.value,
            "amount": float(order.unit_price * order.quantity),
            "date": formatted_date
        })

    return {
        "recentOrders": orders_data
    }
