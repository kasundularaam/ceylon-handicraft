# app/routes/api/category_api.py
from fastapi import APIRouter, Depends, HTTPException, Query, Body, UploadFile, File, Form
from sqlalchemy.orm import Session
from ...database import get_db
from ...models import Category
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil
from pathlib import Path
import uuid

router = APIRouter(prefix="/api/admin/categories")

# Create the directory if it doesn't exist
UPLOAD_DIR = Path("app/public/images/categories")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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
        from_attributes = True  # Updated from orm_mode to fix deprecation warning


@router.get("", response_model=List[CategoryResponse])
async def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("", response_model=CategoryResponse)
async def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db)
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = category_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)

    db.commit()
    db.refresh(db_category)
    return db_category


@router.delete("/{category_id}")
async def delete_category(category_id: str, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}


# Important: Make sure this route definition is exactly as shown here
@router.post("/upload-image")
async def upload_category_image(file: UploadFile = File(...)):
    """
    Upload a category image file
    """
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
