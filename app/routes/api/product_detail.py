from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
import os
from ...database import get_db
from ...models import Product, ProductType, Rating, OrderItem, Category

# Create router for product detail API endpoints
router = APIRouter()

# Get product by ID


@router.get("/api/products/{product_id}")
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get product category
    category = product.category
    category_data = None
    if category:
        category_data = {
            "id": category.id,
            "title": category.title,
            "image": category.image,
            "icon": category.icon,
            "description": category.description
        }

    # Create product data
    product_data = {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "base_price": product.base_price,
        "type": product.type.value,
        "category_id": product.category_id,
        "user_id": product.user_id,
        "weight": product.weight,
        "length": product.length,
        "width": product.width,
        "height": product.height,
        "created_at": str(product.created_at),
        "updated_at": str(product.updated_at),
        "category": category_data,
        "craftsman": {
            "id": product.craftsman.id,
            "name": product.craftsman.name
        } if product.craftsman else None
    }

    return product_data

# Get product images


@router.get("/api/product/{product_id}/images")
async def get_product_images(product_id: str):
    """Scan the product's image directory and return a list of image file paths."""
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

# Get related products by category


@router.get("/api/products/category/{category_id}")
async def get_category_products(
    category_id: str,
    limit: int = Query(4, description="Number of products to return"),
    exclude: str = Query(
        None, description="Product ID to exclude from results"),
    db: Session = Depends(get_db)
):
    """Get products in the same category, optionally excluding a specific product."""
    query = db.query(Product).filter(Product.category_id == category_id)

    if exclude:
        query = query.filter(Product.id != exclude)

    products = query.order_by(Product.created_at.desc()).limit(limit).all()

    # Prepare response data
    result = []
    for product in products:
        # Get product category
        category = product.category
        category_data = None
        if category:
            category_data = {
                "id": category.id,
                "title": category.title,
                "image": category.image,
                "icon": category.icon,
                "description": category.description
            }

        # Create product data
        product_data = {
            "id": product.id,
            "title": product.title,
            "base_price": product.base_price,
            "type": product.type.value,
            "category_id": product.category_id,
            "image_paths": [],  # Empty list - will be fetched by frontend
            "category": category_data
        }
        result.append(product_data)

    return result

# Get product ratings


@router.get("/api/products/{product_id}/ratings")
async def get_product_ratings(product_id: str, db: Session = Depends(get_db)):
    """Get all ratings for a specific product, including user information."""
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get ratings for this product through order items
    ratings = (
        db.query(Rating)
        .join(OrderItem, OrderItem.id == Rating.order_item_id)
        .filter(OrderItem.product_id == product_id)
        .all()
    )

    # Prepare rating data
    rating_list = []
    for rating in ratings:
        try:
            # Get order item and user data
            order_item = rating.order_item
            user_data = None
            order_item_data = None

            if order_item:
                user = order_item.user if hasattr(order_item, 'user') else None

                if user:
                    user_data = {
                        "id": user.id,
                        "name": getattr(user, 'name', 'Anonymous')
                    }

                order_item_data = {
                    "id": order_item.id,
                    "created_at": str(order_item.created_at),
                    "user": user_data
                }

            # Create rating data
            rating_data = {
                "id": rating.id,
                "order_item_id": rating.order_item_id,
                "rating": rating.rating,
                "description": rating.description,
                "images": rating.images if hasattr(rating, 'images') else [],
                "order_item": order_item_data
            }

            rating_list.append(rating_data)
        except Exception as e:
            # Skip ratings with errors
            print(f"Error processing rating {rating.id}: {str(e)}")
            continue

    return {"ratings": rating_list}
