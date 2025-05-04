from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional
from pathlib import Path
import os
from ...database import get_db
from ...models import Product, ProductType, Rating, OrderItem, Category, User, CartItem, OrderStatus
from datetime import datetime
import uuid

# Create models for request bodies


class CartItemRequest(BaseModel):
    product_id: str
    quantity: int = 1


class OrderRequest(BaseModel):
    product_id: str
    quantity: int = 1


# Create router
router = APIRouter()

# Get product details


@router.get("/api/product-details/{product_id}")
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get product details by ID"""
    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get category separately (direct query)
    category_title = "Uncategorized"
    if product.category_id:
        category = db.query(Category).filter(
            Category.id == product.category_id).first()
        if category:
            category_title = category.title

    # Build response
    response = {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "base_price": product.base_price,
        "type": product.type.value,
        "category_id": product.category_id,
        "category_title": category_title,  # Include category title directly
        "weight": product.weight,
        "length": product.length,
        "width": product.width,
        "height": product.height
    }

    return response

# Get product images


@router.get("/api/product-details/{product_id}/images")
async def get_product_images(product_id: str):
    """Get all images for a product"""
    # Define image directory
    images_dir = Path("app/public/images/products") / product_id

    # Check if directory exists
    if not os.path.exists(images_dir):
        # Try alternative path
        images_dir = Path("public/images/products") / product_id
        if not os.path.exists(images_dir):
            return {"images": []}

    # Get all image files
    image_files = []
    for file in os.listdir(images_dir):
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            image_files.append(f"/static/images/products/{product_id}/{file}")

    return {"images": image_files}

# Get related products


@router.get("/api/product-details/related/{product_id}")
async def get_related_products(
    product_id: str,
    limit: int = Query(4, description="Number of products to return"),
    db: Session = Depends(get_db)
):
    """Get products related to the given product"""
    # Get current product to find category_id
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get products from same category
    query = db.query(Product).filter(
        Product.category_id == product.category_id,
        Product.id != product_id,  # Exclude current product
        Product.type == ProductType.SALE  # Only sale products
    ).order_by(Product.created_at.desc())

    related_products = query.limit(limit).all()

    # If not enough products, get some featured products
    if len(related_products) < limit:
        more_needed = limit - len(related_products)
        # Get IDs of products we already have
        existing_ids = [p.id for p in related_products] + [product_id]

        # Get more products
        more_products = db.query(Product).filter(
            Product.id.notin_(existing_ids),
            Product.type == ProductType.SALE
        ).order_by(Product.created_at.desc()).limit(more_needed).all()

        related_products.extend(more_products)

    # Format response
    result = []
    for p in related_products:
        # Get category title
        category_title = "Uncategorized"
        if p.category_id:
            category = db.query(Category).filter(
                Category.id == p.category_id).first()
            if category:
                category_title = category.title

        result.append({
            "id": p.id,
            "title": p.title,
            "base_price": p.base_price,
            "category_title": category_title
        })

    return result

# Get product ratings


@router.get("/api/product-details/{product_id}/ratings")
async def get_product_ratings(product_id: str, db: Session = Depends(get_db)):
    """Get ratings for a product"""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get ratings through order items
    ratings = (
        db.query(Rating)
        .join(OrderItem, OrderItem.id == Rating.order_item_id)
        .filter(OrderItem.product_id == product_id)
        .all()
    )

    # Format ratings
    result = []
    for rating in ratings:
        user_name = "Anonymous"
        created_at = None

        # Try to get user and date info
        if hasattr(rating, 'order_item') and rating.order_item:
            if hasattr(rating.order_item, 'user') and rating.order_item.user:
                user_name = rating.order_item.user.name or "Anonymous"
            if hasattr(rating.order_item, 'created_at'):
                created_at = str(rating.order_item.created_at)

        result.append({
            "id": rating.id,
            "rating": rating.rating,
            "description": rating.description,
            "user_name": user_name,
            "created_at": created_at,
            "images": rating.images if hasattr(rating, 'images') else []
        })

    return {"ratings": result}

# Add to cart


@router.post("/api/cart/add")
async def add_to_cart(cart_item: CartItemRequest, request: Request, db: Session = Depends(get_db)):
    """Add a product to the user's cart"""
    # Get authenticated user from request state
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        # Check if product exists
        product = db.query(Product).filter(
            Product.id == cart_item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Check if item already in cart
        existing_item = db.query(CartItem).filter(
            CartItem.user_id == user.id,
            CartItem.product_id == cart_item.product_id
        ).first()

        if existing_item:
            # Update quantity
            existing_item.quantity += cart_item.quantity
            existing_item.updated_at = datetime.now()
        else:
            # Create new cart item
            new_cart_item = CartItem(
                user_id=user.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity
            )
            db.add(new_cart_item)

        db.commit()
        return {"success": True, "message": "Product added to cart"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Create an order with "Buy Now"


@router.post("/api/orders/buy-now")
async def create_order(order: OrderRequest, request: Request, db: Session = Depends(get_db)):
    """Create a new order directly from product page"""
    # Get authenticated user from request state
    user = request.state.user
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        # Check if product exists
        product = db.query(Product).filter(
            Product.id == order.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        # Create new order item
        order_id = str(uuid.uuid4())  # Generate unique order ID

        order_item = OrderItem(
            id=order_id,
            user_id=user.id,
            product_id=order.product_id,
            quantity=order.quantity,
            unit_price=product.base_price,
            status=OrderStatus.INITIATED
        )

        db.add(order_item)
        db.commit()

        # Return order info
        return {
            "success": True,
            "order_id": order_id,
            "message": "Order created successfully",
            "redirect_url": f"/checkout/{order_id}"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
