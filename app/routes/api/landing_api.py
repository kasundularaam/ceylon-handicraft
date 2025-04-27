from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import os
import glob

from ...database import get_db
from ...models import Product, Category, ProductType

router = APIRouter(prefix="/api/landing")


@router.get("/featured-products")
async def get_featured_products(
    request: Request,
    limit: int = 8,
    db: Session = Depends(get_db)
):
    """Get featured products for the home page"""
    featured_products = (
        db.query(
            Product.id,
            Product.title,
            Product.base_price,
            Product.type
        )
        .filter(Product.type == ProductType.SALE)
        .order_by(desc(Product.created_at))
        .limit(limit)
        .all()
    )

    # Base path for product images
    base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                             "public", "images", "products")

    result = []
    for product in featured_products:
        # Scan the product's directory for images
        product_dir = os.path.join(base_path, product.id)
        image_files = []

        if os.path.exists(product_dir):
            # Get all image files (jpg, jpeg, png)
            image_pattern = os.path.join(product_dir, "*.{jpg,jpeg,png}")
            image_files = glob.glob(image_pattern, recursive=False)

            # Limit to 3 images
            image_files = image_files[:3]

        # Convert file paths to URLs
        image_urls = []
        for img_file in image_files:
            # Get just the filename
            filename = os.path.basename(img_file)
            # Create the URL path
            image_urls.append(
                f"/static/images/products/{product.id}/{filename}")

        # If no images found, use a placeholder
        if not image_urls:
            image_urls = ["/static/images/product-placeholder.png"]

        result.append({
            "id": product.id,
            "title": product.title,
            "price": product.base_price,
            "type": product.type.value,
            "images": image_urls
        })

    return result


@router.get("/featured-auctions")
async def get_featured_auctions(
    request: Request,
    limit: int = 4,
    db: Session = Depends(get_db)
):
    """Get featured auction products for the home page"""
    featured_auctions = (
        db.query(
            Product.id,
            Product.title,
            Product.base_price,
            Product.type
        )
        .filter(Product.type == ProductType.AUCTION)
        .order_by(desc(Product.created_at))
        .limit(limit)
        .all()
    )

    # Base path for product images
    base_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
                             "public", "images", "products")

    result = []
    for product in featured_auctions:
        # Scan the product's directory for images
        product_dir = os.path.join(base_path, product.id)
        image_files = []

        if os.path.exists(product_dir):
            # Get all image files (jpg, jpeg, png)
            for ext in ["jpg", "jpeg", "png"]:
                image_files.extend(
                    glob.glob(os.path.join(product_dir, f"*.{ext}")))

            # Limit to 3 images
            image_files = image_files[:3]

        # Convert file paths to URLs
        image_urls = []
        for img_file in image_files:
            # Get just the filename
            filename = os.path.basename(img_file)
            # Create the URL path
            image_urls.append(
                f"/static/images/products/{product.id}/{filename}")

        # If no images found, use a placeholder
        if not image_urls:
            image_urls = ["/static/images/product-placeholder.png"]

        result.append({
            "id": product.id,
            "title": product.title,
            "price": product.base_price,
            "type": product.type.value,
            "images": image_urls
        })

    return result


@router.get("/categories")
async def get_categories(
    request: Request,
    db: Session = Depends(get_db)
):
    """Get all product categories"""
    categories = db.query(
        Category.id,
        Category.title,
        Category.description,
        Category.image,
        Category.icon
    ).order_by(Category.title).all()

    result = []
    for category in categories:
        # Use the provided image path or fallback to a placeholder
        image_path = category.image or "/static/images/category-placeholder.png"

        result.append({
            "id": category.id,
            "title": category.title,
            "description": category.description,
            "image": image_path,
            "icon": category.icon or "fa-box"
        })

    return result
