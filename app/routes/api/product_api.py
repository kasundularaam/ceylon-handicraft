from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, func
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict
import os
import shutil
import uuid
import json
import math
from datetime import datetime

from ...database import get_db
from ...models import Product, Category, ProductType, Bid

# Response schemas for listing endpoints


class CategoryResponse(BaseModel):
    id: str
    title: str
    icon: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductResponse(BaseModel):
    id: str
    title: str
    base_price: float
    type: str
    category_id: str
    image_paths: Optional[List[str]] = None
    current_bid: Optional[float] = None
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    currentPage: int
    totalPages: int
    totalProducts: int


class FilterOptionsResponse(BaseModel):
    categories: List[Dict[str, Any]]
    priceRanges: List[Dict[str, Any]]


router = APIRouter(prefix="/api/products")

# Get sale products with pagination, filtering and sorting


@router.get("/sale", response_model=ProductListResponse)
async def get_sale_products(
    request: Request,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """
    Get products for sale with pagination, filtering and sorting.
    """
    query = db.query(Product).filter(Product.type == ProductType.SALE)

    # Apply filters
    if category:
        query = query.filter(Product.category_id == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(Product.title.ilike(search_term) |
                             Product.description.ilike(search_term))

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

    # Count total products
    total_products = query.count()
    total_pages = math.ceil(total_products / limit)

    # Pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    # Prepare response
    result = []
    for product in products:
        # Get product category
        category = product.category
        category_data = CategoryResponse.from_orm(
            category) if category else None

        # Get images from directory
        image_dir = f"/static/images/products/{product.id}"
        server_dir = f"app/public/images/products/{product.id}"

        images = []
        if os.path.exists(server_dir):
            for file in os.listdir(server_dir):
                if os.path.isfile(os.path.join(server_dir, file)):
                    images.append(f"{image_dir}/{file}")

        # Create product data
        product_data = ProductResponse(
            id=product.id,
            title=product.title,
            base_price=product.base_price,
            type=product.type.value,
            category_id=product.category_id,
            image_paths=images,
            category=category_data
        )
        result.append(product_data)

    return {
        "products": result,
        "currentPage": page,
        "totalPages": max(1, total_pages),
        "totalProducts": total_products
    }

# Get auction products with pagination, filtering and sorting


@router.get("/auction", response_model=ProductListResponse)
async def get_auction_products(
    request: Request,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "newest",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    """
    Get auction products with pagination, filtering and sorting.
    """
    query = db.query(Product).filter(Product.type == ProductType.AUCTION)

    # Apply filters
    if category:
        query = query.filter(Product.category_id == category)

    if search:
        search_term = f"%{search}%"
        query = query.filter(Product.title.ilike(search_term) |
                             Product.description.ilike(search_term))

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

    # Count total products
    total_products = query.count()
    total_pages = math.ceil(total_products / limit)

    # Pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    # Prepare response
    result = []
    for product in products:
        # Get highest bid
        highest_bid = db.query(Bid).filter(
            Bid.product_id == product.id
        ).order_by(desc(Bid.bid_price)).first()

        # Get product category
        category = product.category
        category_data = CategoryResponse.from_orm(
            category) if category else None

        # Get images from directory
        image_dir = f"/static/images/products/{product.id}"
        server_dir = f"app/public/images/products/{product.id}"

        images = []
        if os.path.exists(server_dir):
            for file in os.listdir(server_dir):
                if os.path.isfile(os.path.join(server_dir, file)):
                    images.append(f"{image_dir}/{file}")

        # Create product data
        product_data = ProductResponse(
            id=product.id,
            title=product.title,
            base_price=product.base_price,
            type=product.type.value,
            category_id=product.category_id,
            image_paths=images,
            current_bid=highest_bid.bid_price if highest_bid else product.base_price,
            category=category_data
        )
        result.append(product_data)

    return {
        "products": result,
        "currentPage": page,
        "totalPages": max(1, total_pages),
        "totalProducts": total_products
    }

# Get filter options


@router.get("/filters", response_model=FilterOptionsResponse)
async def get_filter_options(
    request: Request,
    db: Session = Depends(get_db),
    type: Optional[str] = None
):
    """
    Get available filter options for products.
    """
    # Get categories
    categories = db.query(Category).all()
    category_data = []

    for category in categories:
        category_data.append({
            "id": category.id,
            "title": category.title,
            "icon": category.icon or "fa fa-tag"
        })

    # Define price ranges
    price_ranges = [
        {"id": "under50", "title": "Under $50", "min": 0, "max": 50},
        {"id": "50to100", "title": "$50 - $100", "min": 50, "max": 100},
        {"id": "100to250", "title": "$100 - $250", "min": 100, "max": 250},
        {"id": "250plus", "title": "Over $250", "min": 250, "max": None}
    ]

    return {
        "categories": category_data,
        "priceRanges": price_ranges
    }

# Get all products for the current craftsman


@router.get("/craftsman")
async def get_craftsman_products(
    request: Request,
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    products = db.query(Product).filter(
        Product.user_id == request.state.user.id
    ).order_by(desc(Product.created_at)).all()

    # Convert products to dict for JSON response
    result = []
    for product in products:
        # Get the highest bid for auction products
        highest_bid = None
        if product.type == ProductType.AUCTION:
            highest_bid_obj = db.query(Bid).filter(
                Bid.product_id == product.id
            ).order_by(desc(Bid.bid_price)).first()

            if highest_bid_obj:
                highest_bid = highest_bid_obj.bid_price

        # Get images from directory
        image_dir = f"/static/images/products/{product.id}"
        server_dir = f"app/public/images/products/{product.id}"

        images = []
        if os.path.exists(server_dir):
            for file in os.listdir(server_dir):
                if os.path.isfile(os.path.join(server_dir, file)):
                    images.append(f"{image_dir}/{file}")

        result.append({
            "id": product.id,
            "title": product.title,
            "type": product.type.value,
            "category": product.category.title if product.category else None,
            "base_price": product.base_price,
            "highest_bid": highest_bid,
            "created_at": product.created_at.isoformat(),
            "images": images
        })

    return result

# Get single product by ID


@router.get("/{product_id}")
async def get_product(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check if user is authenticated
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # If craftsman, check if product belongs to the current user
    if request.state.user.role.value == "Craftsman" and product.user_id != request.state.user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this product")

    # Get the highest bid for auction products
    highest_bid = None
    if product.type == ProductType.AUCTION:
        highest_bid_obj = db.query(Bid).filter(
            Bid.product_id == product.id
        ).order_by(desc(Bid.bid_price)).first()

        if highest_bid_obj:
            highest_bid = highest_bid_obj.bid_price

    # Get images from directory
    image_dir = f"/static/images/products/{product.id}"
    server_dir = f"app/public/images/products/{product.id}"

    images = []
    if os.path.exists(server_dir):
        for file in os.listdir(server_dir):
            if os.path.isfile(os.path.join(server_dir, file)):
                images.append(f"{image_dir}/{file}")

    result = {
        "id": product.id,
        "title": product.title,
        "description": product.description,
        "type": product.type.value,
        "category_id": product.category_id,
        "base_price": product.base_price,
        "weight": product.weight,
        "length": product.length,
        "width": product.width,
        "height": product.height,
        "created_at": product.created_at.isoformat(),
        "highest_bid": highest_bid,
        "images": images
    }

    return result

# Create new product


@router.post("/")
async def create_product(
    request: Request,
    title: str = Form(...),
    description: str = Form(None),
    type: str = Form(...),
    category_id: str = Form(...),
    base_price: float = Form(...),
    weight: Optional[float] = Form(None),
    length: Optional[float] = Form(None),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
    files: List[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Validate product type
    product_type = None
    if type == "Sale":
        product_type = ProductType.SALE
    elif type == "Auction":
        product_type = ProductType.AUCTION
    else:
        raise HTTPException(status_code=400, detail="Invalid product type")

    # Check if category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")

    # Create product
    new_product = Product(
        user_id=request.state.user.id,
        category_id=category_id,
        type=product_type,
        title=title,
        description=description,
        base_price=base_price,
        weight=weight,
        length=length,
        width=width,
        height=height
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    # Create product images directory
    product_images_dir = f"app/public/images/products/{new_product.id}"
    os.makedirs(product_images_dir, exist_ok=True)

    # Save uploaded images
    if files:
        for file in files:
            if file.filename:
                # Generate unique filename
                filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
                file_path = f"{product_images_dir}/{filename}"

                # Save file to disk
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)

    return {"id": new_product.id, "message": "Product created successfully"}

# Update product


@router.put("/{product_id}")
async def update_product(
    product_id: str,
    request: Request,
    title: str = Form(...),
    description: str = Form(None),
    type: str = Form(...),
    category_id: str = Form(...),
    base_price: float = Form(...),
    weight: Optional[float] = Form(None),
    length: Optional[float] = Form(None),
    width: Optional[float] = Form(None),
    height: Optional[float] = Form(None),
    files: List[UploadFile] = File(None),
    removed_images: str = Form("[]"),
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if product belongs to the current user
    if product.user_id != request.state.user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this product")

    # Validate product type
    product_type = None
    if type == "Sale":
        product_type = ProductType.SALE
    elif type == "Auction":
        product_type = ProductType.AUCTION
    else:
        raise HTTPException(status_code=400, detail="Invalid product type")

    # Check if category exists
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category")

    # Update product
    product.title = title
    product.description = description
    product.type = product_type
    product.category_id = category_id
    product.base_price = base_price
    product.weight = weight
    product.length = length
    product.width = width
    product.height = height
    product.updated_at = datetime.now()

    # Process removed images
    try:
        removed_images_list = json.loads(removed_images)
        if removed_images_list:
            for image_path in removed_images_list:
                # Remove file from disk
                try:
                    # Convert from URL path to file path
                    file_path = os.path.join(
                        "app/public",
                        image_path.replace("/static", "")
                    )
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error removing file: {e}")
    except Exception as e:
        print(f"Error processing removed images: {e}")

    # Create product images directory if it doesn't exist
    product_images_dir = f"app/public/images/products/{product.id}"
    os.makedirs(product_images_dir, exist_ok=True)

    # Save uploaded images
    if files:
        for file in files:
            if file.filename:
                # Generate unique filename
                filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
                file_path = f"{product_images_dir}/{filename}"

                # Save file to disk
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)

    db.commit()

    return {"message": "Product updated successfully"}

# Delete product


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    request: Request,
    db: Session = Depends(get_db)
):
    # Check if user is authenticated and is a craftsman
    if not request.state.user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if request.state.user.role.value != "Craftsman":
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get product
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if product belongs to the current user
    if product.user_id != request.state.user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this product")

    # Delete product images
    try:
        product_dir = f"app/public/images/products/{product_id}"
        if os.path.exists(product_dir):
            shutil.rmtree(product_dir)
    except Exception as e:
        print(f"Error removing product directory: {e}")

    # Delete product
    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}

# Get all categories (for dropdown in product form)


@router.get("/categories/all")
async def get_categories(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        # Get all categories
        categories = db.query(Category).all()

        # Use "title" field instead of "name" to match your Category model
        result = [{"id": cat.id, "name": cat.title} for cat in categories]

        return result

    except Exception as e:
        # Log any errors
        print(f"Error in get_categories: {str(e)}")
        # Re-raise the exception to be handled by FastAPI
        raise
