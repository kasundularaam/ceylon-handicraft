from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form, Path
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from ...database import get_db
from ...models import Category, Product, ProductType
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
import math
import os
import shutil
from pathlib import Path as FilePath
import uuid
from datetime import datetime

# Create a single router for all category-related endpoints
router = APIRouter(prefix="/api/categories", tags=["categories"])

# Create the directory if it doesn't exist
UPLOAD_DIR = FilePath("app/public/images/categories")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# ------------------- Pydantic Models -------------------


class CategoryBase(BaseModel):
    title: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: str

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    base_price: float
    type: str
    category_id: str
    category_title: Optional[str] = None
    category_icon: Optional[str] = None
    created_at: datetime
    weight: Optional[float] = None
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None

    class Config:
        from_attributes = True


class PaginatedProductsResponse(BaseModel):
    products: List[ProductResponse]
    totalPages: int
    currentPage: int
    totalItems: int


# ------------------- Public Category Endpoints -------------------

@router.get("", response_model=List[CategoryResponse])
async def get_all_categories(db: Session = Depends(get_db)):
    """Get all categories for public display"""
    categories = db.query(Category).all()
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category_details(
    category_id: str = Path(...,
                            description="The ID of the category to retrieve"),
    db: Session = Depends(get_db)
):
    """Get details for a specific category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# ------------------- Products by Category Endpoints -------------------

@router.get("/{category_id}/products", response_model=PaginatedProductsResponse)
async def get_products_by_category(
    category_id: str = Path(...,
                            description="The ID of the category to retrieve products for"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    sort: str = Query(
        "newest", regex="^(newest|price_low|price_high|popular)$", description="Sort order"),
    product_type: Optional[str] = Query(
        None, description="Filter by product type (sale or auction)"),
    min_price: Optional[float] = Query(
        None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(
        None, ge=0, description="Maximum price filter"),
    db: Session = Depends(get_db)
):
    """Get products for a specific category with pagination, sorting and filters"""

    # Check if category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Build the base query
    query = db.query(Product).filter(Product.category_id == category_id)

    # Apply product type filter if specified
    if product_type:
        try:
            product_type_enum = ProductType(product_type.upper())
            query = query.filter(Product.type == product_type_enum)
        except ValueError:
            # If invalid product type, just ignore the filter
            pass

    # Apply price filters if specified
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)

    # Apply sorting
    if sort == "newest":
        query = query.order_by(desc(Product.created_at))
    elif sort == "price_low":
        query = query.order_by(asc(Product.base_price))
    elif sort == "price_high":
        query = query.order_by(desc(Product.base_price))
    elif sort == "popular":
        # If you have a popularity metric (e.g., order count), use it here
        # For now, we'll default to newest
        query = query.order_by(desc(Product.created_at))

    # Count total items
    total_items = query.count()
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 1

    # Apply pagination
    products = query.offset((page - 1) * limit).limit(limit).all()

    # Add category information to each product
    for product in products:
        product.category_title = category.title
        product.category_icon = category.icon

    return {
        "products": products,
        "totalPages": total_pages,
        "currentPage": page,
        "totalItems": total_items
    }


@router.get("/products/sale", response_model=PaginatedProductsResponse)
async def get_sale_products_across_categories(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    sort: str = Query(
        "newest", regex="^(newest|price_low|price_high|popular)$"),
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    db: Session = Depends(get_db)
):
    """Get sale products across all categories with pagination, sorting and filters"""

    # Build the base query for sale products
    query = db.query(Product).filter(Product.type == ProductType.SALE)

    # Apply category filter if specified
    if category_id:
        query = query.filter(Product.category_id == category_id)

    # Apply search filter if specified
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            func.lower(Product.title).like(func.lower(search_term)) |
            func.lower(Product.description).like(func.lower(search_term))
        )

    # Apply price filters if specified
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)

    # Apply sorting
    if sort == "newest":
        query = query.order_by(desc(Product.created_at))
    elif sort == "price_low":
        query = query.order_by(asc(Product.base_price))
    elif sort == "price_high":
        query = query.order_by(desc(Product.base_price))
    elif sort == "popular":
        # Default to newest for now
        query = query.order_by(desc(Product.created_at))

    # Count total items
    total_items = query.count()
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 1

    # Apply pagination
    products = query.offset((page - 1) * limit).limit(limit).all()

    # Add category information to each product
    for product in products:
        if product.category:
            product.category_title = product.category.title
            product.category_icon = product.category.icon

    return {
        "products": products,
        "totalPages": total_pages,
        "currentPage": page,
        "totalItems": total_items
    }


@router.get("/products/auction", response_model=PaginatedProductsResponse)
async def get_auction_products_across_categories(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    sort: str = Query(
        "newest", regex="^(newest|price_low|price_high|popular)$"),
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    db: Session = Depends(get_db)
):
    """Get auction products across all categories with pagination, sorting and filters"""

    # Build the base query for auction products
    query = db.query(Product).filter(Product.type == ProductType.AUCTION)

    # Apply category filter if specified
    if category_id:
        query = query.filter(Product.category_id == category_id)

    # Apply search filter if specified
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            func.lower(Product.title).like(func.lower(search_term)) |
            func.lower(Product.description).like(func.lower(search_term))
        )

    # Apply price filters if specified
    if min_price is not None:
        query = query.filter(Product.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.base_price <= max_price)

    # Apply sorting
    if sort == "newest":
        query = query.order_by(desc(Product.created_at))
    elif sort == "price_low":
        query = query.order_by(asc(Product.base_price))
    elif sort == "price_high":
        query = query.order_by(desc(Product.base_price))
    elif sort == "popular":
        # Default to newest for now
        query = query.order_by(desc(Product.created_at))

    # Count total items
    total_items = query.count()
    total_pages = math.ceil(total_items / limit) if total_items > 0 else 1

    # Apply pagination
    products = query.offset((page - 1) * limit).limit(limit).all()

    # Add category information to each product
    for product in products:
        if product.category:
            product.category_title = product.category.title
            product.category_icon = product.category.icon

    return {
        "products": products,
        "totalPages": total_pages,
        "currentPage": page,
        "totalItems": total_items
    }


# ------------------- Admin Category Endpoints -------------------

@router.get("/admin", response_model=List[CategoryResponse])
async def admin_get_categories(db: Session = Depends(get_db)):
    """Admin endpoint to get all categories"""
    categories = db.query(Category).all()
    return categories


@router.get("/admin/{category_id}", response_model=CategoryResponse)
async def admin_get_category(
    category_id: str = Path(...,
                            description="The ID of the category to retrieve"),
    db: Session = Depends(get_db)
):
    """Admin endpoint to get details for a specific category"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/admin", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db)
):
    """Admin endpoint to create a new category"""
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/admin/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str = Path(...,
                            description="The ID of the category to update"),
    category_update: CategoryUpdate = None,
    db: Session = Depends(get_db)
):
    """Admin endpoint to update a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)

    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/admin/{category_id}")
async def delete_category(
    category_id: str = Path(...,
                            description="The ID of the category to delete"),
    db: Session = Depends(get_db)
):
    """Admin endpoint to delete a category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check if the category has products
    product_count = db.query(Product).filter(
        Product.category_id == category_id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete category that has {product_count} products associated with it. Reassign or delete the products first."
        )

    # Delete the associated image file if it exists
    if db_category.image and db_category.image.startswith("/static/images/categories/"):
        try:
            # Get the filename from the path
            filename = db_category.image.split("/")[-1]
            file_path = UPLOAD_DIR / filename

            # Check if file exists before attempting to delete
            if file_path.exists():
                os.remove(file_path)
                print(f"Deleted image file: {file_path}")
        except Exception as e:
            # Log error but continue with category deletion
            print(f"Error deleting image file: {str(e)}")

    # Delete the category from the database
    db.delete(db_category)
    db.commit()

    return {"message": "Category deleted successfully"}


@router.post("/admin/upload-image")
async def upload_category_image(file: UploadFile = File(...)):
    """Admin endpoint to upload a category image file"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400, detail="File must be an image")

        # Generate a unique filename to avoid conflicts
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        # Full path to save the file
        file_path = UPLOAD_DIR / unique_filename

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Return the relative URL to access the image
        return {"path": f"/static/images/categories/{unique_filename}"}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error uploading file: {str(e)}")
