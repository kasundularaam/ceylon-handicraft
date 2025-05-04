from fastapi import APIRouter, HTTPException, UploadFile, File, status, Request
from fastapi.responses import FileResponse
from typing import List, Optional
from pydantic import BaseModel
import uuid
import shutil
from datetime import datetime
from pathlib import Path

from ...models import UserRole

# Define schemas directly in the API file


class LibraryFileResponse(BaseModel):
    """Schema for library file response"""
    id: str
    name: str
    size: int
    created_at: str
    path: Optional[str] = None

    class Config:
        orm_mode = True


router = APIRouter(prefix="/api/vishva-library")

# Define the path to the vishva_library directory
VISHVA_LIBRARY_DIR = Path(__file__).parents[3] / "vishva_library"

# Ensure the directory exists
VISHVA_LIBRARY_DIR.mkdir(exist_ok=True)

# Utility function to list files in the library directory


def get_library_files():
    files = []
    for file_path in VISHVA_LIBRARY_DIR.glob("*.pdf"):
        if file_path.is_file():
            # Create file object with metadata
            file_info = {
                "id": file_path.stem,  # Use filename without extension as ID
                "name": file_path.name,
                "size": file_path.stat().st_size,
                "created_at": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat(),
                "path": str(file_path)
            }
            files.append(file_info)

    # Sort by most recent first
    return sorted(files, key=lambda x: x["created_at"], reverse=True)


@router.get("/files", response_model=List[LibraryFileResponse])
async def list_files(request: Request):
    """
    List all PDF files in the Vishva library.
    Only admin users can access this endpoint.
    """
    # Check if user exists in request state
    if not hasattr(request.state, 'user') or request.state.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can access this endpoint"
        )

    return get_library_files()


@router.post("/files", response_model=LibraryFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Upload a new PDF file to the Vishva library.
    Only admin users can access this endpoint.
    """
    # Check if user exists in request state
    if not hasattr(request.state, 'user') or request.state.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can access this endpoint"
        )
    # Validate file type
    if not file.content_type or "application/pdf" not in file.content_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )

    # Generate a unique filename
    file_id = str(uuid.uuid4())
    original_filename = file.filename
    # Keep the original extension if it exists, otherwise add .pdf
    if "." in original_filename:
        extension = original_filename.split(".")[-1].lower()
        if extension != "pdf":
            extension = "pdf"
    else:
        extension = "pdf"

    new_filename = f"{file_id}.{extension}"
    file_path = VISHVA_LIBRARY_DIR / new_filename

    # Save the file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    finally:
        file.file.close()

    # Rename the file to include original name (for better readability)
    readable_name = original_filename
    if not readable_name.lower().endswith('.pdf'):
        readable_name += '.pdf'

    readable_filename = f"{file_id}_{readable_name}"
    readable_file_path = VISHVA_LIBRARY_DIR / readable_filename
    file_path.rename(readable_file_path)

    # Return file info
    file_info = {
        "id": file_id,
        "name": readable_name,
        "size": readable_file_path.stat().st_size,
        "created_at": datetime.now().isoformat(),
        "path": str(readable_file_path)
    }

    return file_info


@router.get("/files/{file_id}/download")
async def download_file(file_id: str, request: Request):
    """
    Download a specific PDF file from the Vishva library by ID.
    Only admin users can access this endpoint.
    """
    # Check if user exists in request state
    if not hasattr(request.state, 'user') or request.state.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can access this endpoint"
        )

    # Find the file with the matching ID
    for file_path in VISHVA_LIBRARY_DIR.glob(f"{file_id}*.pdf"):
        if file_path.is_file():
            return FileResponse(
                path=file_path,
                filename=file_path.name,
                media_type="application/pdf"
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="File not found"
    )


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(file_id: str, request: Request):
    """
    Delete a specific PDF file from the Vishva library by ID.
    Only admin users can access this endpoint.
    """
    # Check if user exists in request state
    if not hasattr(request.state, 'user') or request.state.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    user = request.state.user

    # Check if user is admin
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can access this endpoint"
        )
    # Find the file with the matching ID
    found = False
    for file_path in VISHVA_LIBRARY_DIR.glob(f"{file_id}*.pdf"):
        if file_path.is_file():
            # Delete the file
            file_path.unlink()
            found = True
            break

    if not found:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    return None
