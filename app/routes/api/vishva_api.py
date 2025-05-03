"""
API routes for the Vishva AI Assistant
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from ...database import get_db
from ...services.vishva_service import VishvaService
from ...models import Chat, Message

router = APIRouter(prefix="/api/vishva")

# Pydantic models for request/response


class MessageCreate(BaseModel):
    message: str


class MessageResponse(BaseModel):
    id: str
    is_from_user: bool
    message: str
    created_at: str


class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    last_message: Optional[str] = None

# Get all chats for the current user


@router.get("/chats")
async def get_chats(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all chat sessions for a user
    """
    vishva_service = VishvaService(db)
    chats = vishva_service.get_user_chats(user_id)

    # Format response
    result = []
    for chat in chats:
        # Get the last message if there are any
        last_message = None
        if chat.messages:
            last_message = db.query(Message).filter(
                Message.chat_id == chat.id
            ).order_by(Message.created_at.desc()).first()

        result.append({
            "id": chat.id,
            "title": chat.title,
            "created_at": chat.created_at.isoformat(),
            "updated_at": chat.updated_at.isoformat(),
            "last_message": last_message.message if last_message else None
        })

    return result

# Create a new chat


@router.post("/chats")
async def create_chat(
    data: dict,
    db: Session = Depends(get_db)
):
    """
    Create a new chat session
    """
    user_id = data.get("user_id")
    title = data.get("title", "New Chat")

    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    vishva_service = VishvaService(db)
    chat = vishva_service.create_chat(user_id, title)

    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at.isoformat(),
        "updated_at": chat.updated_at.isoformat()
    }

# Get messages for a specific chat


@router.get("/chats/{chat_id}/messages")
async def get_chat_messages(
    chat_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all messages for a specific chat
    """
    vishva_service = VishvaService(db)
    chat = vishva_service.get_chat(chat_id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = vishva_service.get_chat_messages(chat_id)

    # Format response
    result = []
    for message in messages:
        result.append({
            "id": message.id,
            "is_from_user": message.is_from_user,
            "message": message.message,
            "created_at": message.created_at.isoformat()
        })

    return result

# Send a message to Vishva


@router.post("/chats/{chat_id}/messages")
async def send_message(
    chat_id: str,
    message: MessageCreate,
    db: Session = Depends(get_db)
):
    """
    Send a message to Vishva and get a response
    """
    vishva_service = VishvaService(db)
    chat = vishva_service.get_chat(chat_id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save user message
    user_message = vishva_service.add_user_message(chat_id, message.message)

    # Generate and save Vishva's response
    vishva_response_text = vishva_service.generate_response(
        chat_id, message.message)
    vishva_message = vishva_service.add_vishva_response(
        chat_id, vishva_response_text)

    # Format response
    return {
        "user_message": {
            "id": user_message.id,
            "is_from_user": user_message.is_from_user,
            "message": user_message.message,
            "created_at": user_message.created_at.isoformat()
        },
        "vishva_message": {
            "id": vishva_message.id,
            "is_from_user": vishva_message.is_from_user,
            "message": vishva_message.message,
            "created_at": vishva_message.created_at.isoformat()
        }
    }

# Get a specific chat by ID


@router.get("/chats/{chat_id}")
async def get_chat(
    chat_id: str,
    db: Session = Depends(get_db)
):
    """
    Get details for a specific chat
    """
    vishva_service = VishvaService(db)
    chat = vishva_service.get_chat(chat_id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Get the last message if there are any
    last_message = None
    if chat.messages:
        last_message = db.query(Message).filter(
            Message.chat_id == chat.id
        ).order_by(Message.created_at.desc()).first()

    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at.isoformat(),
        "updated_at": chat.updated_at.isoformat(),
        "last_message": last_message.message if last_message else None
    }

# Update chat title


@router.patch("/chats/{chat_id}")
async def update_chat_title(
    chat_id: str,
    title: str,
    db: Session = Depends(get_db)
):
    """
    Update the title of a chat
    """
    vishva_service = VishvaService(db)
    chat = vishva_service.get_chat(chat_id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    chat.title = title
    db.commit()

    return {
        "id": chat.id,
        "title": chat.title,
        "created_at": chat.created_at.isoformat(),
        "updated_at": chat.updated_at.isoformat()
    }

# Delete a chat


@router.delete("/chats/{chat_id}")
async def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a chat and all its messages
    """
    vishva_service = VishvaService(db)
    chat = vishva_service.get_chat(chat_id)

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Delete all messages first
    db.query(Message).filter(Message.chat_id == chat_id).delete()

    # Delete the chat
    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted successfully"}
