"""
Vishva AI Assistant Service
Integrates with Google Gemini Flash 2 using LangChain to provide
intelligent assistance for Ceylon Handicrafts platform.
"""

import os
import glob
from typing import List, Dict, Any, Optional
from fastapi import Depends
from sqlalchemy.orm import Session
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from langchain_core.prompts import PromptTemplate

from ..database import get_db
from ..models import Chat, Message, Category, Product

# Configuration Constants
GOOGLE_API_KEY = "API_KEY_HERE"
MODEL_NAME = "gemini-2.0-flash"
VISHVA_LIBRARY_PATH = "vishva_library"

# System prompt for Vishva
VISHVA_SYSTEM_PROMPT = """
You are Vishva, an AI assistant specializing in Sri Lankan handicrafts for the Ceylon Handicrafts platform.
Your purpose is to help users learn about Sri Lankan craft traditions and find products they might enjoy.

When answering questions:
1. Provide detailed information about craft origins, techniques, materials, and cultural significance
2. Share historical context and traditional stories related to craft styles
3. Make personalized product recommendations based on user interests
4. Be warm, knowledgeable, and respectful of Sri Lankan cultural heritage

If a user expresses interest in a particular craft type, suggest products from that category.
Always maintain a helpful, educational tone that celebrates Sri Lankan craftsmanship.
"""


class VishvaService:
    """Service for Vishva AI Assistant functionality"""

    def __init__(self, db: Session = Depends(get_db)):
        """Initialize Vishva service with database session"""
        self.db = db

        self.embeddings = GoogleGenerativeAIEmbeddings(
            google_api_key=GOOGLE_API_KEY,
            model="models/embedding-001"
        )

        self.llm = ChatGoogleGenerativeAI(
            model=MODEL_NAME,
            google_api_key=GOOGLE_API_KEY,
            temperature=0.7,
            max_tokens=None,
            max_retries=2
        )

        self.vectorstore = self._create_vector_store()

    def _create_vector_store(self) -> Any:
        """
        Create or load the vector store from PDF documents in the vishva_library directory
        """
        try:
            # Check if vectorstore exists and load it
            if os.path.exists(f"{VISHVA_LIBRARY_PATH}/faiss_index"):
                return FAISS.load_local(
                    f"{VISHVA_LIBRARY_PATH}/faiss_index",
                    self.embeddings
                )

            # If not, create new vectorstore from PDFs
            pdf_files = glob.glob(f"{VISHVA_LIBRARY_PATH}/*.pdf")
            if not pdf_files:
                # Create empty vectorstore if no PDFs found
                empty_docs = [
                    Document(page_content="Ceylon Handicrafts information")]
                return FAISS.from_documents(empty_docs, self.embeddings)

            # Load and process all PDFs
            documents = []
            for pdf_file in pdf_files:
                loader = PyPDFLoader(pdf_file)
                documents.extend(loader.load())

            # Split documents into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )
            texts = text_splitter.split_documents(documents)

            # Create vector store
            vectorstore = FAISS.from_documents(texts, self.embeddings)

            # Save for future use
            os.makedirs(f"{VISHVA_LIBRARY_PATH}/faiss_index", exist_ok=True)
            vectorstore.save_local(f"{VISHVA_LIBRARY_PATH}/faiss_index")

            return vectorstore

        except Exception as e:
            print(f"Error creating vector store: {e}")
            # Create empty vectorstore as fallback
            empty_docs = [
                Document(page_content="Ceylon Handicrafts information")]
            return FAISS.from_documents(empty_docs, self.embeddings)

    def create_chat(self, user_id: str, title: str = "New Chat") -> Chat:
        """
        Create a new chat session for a user

        Args:
            user_id: The ID of the user
            title: The title of the chat (default: "New Chat")

        Returns:
            Chat: The newly created chat object
        """
        chat = Chat(
            user_id=user_id,
            title=title
        )
        self.db.add(chat)
        self.db.commit()
        self.db.refresh(chat)
        return chat

    def get_user_chats(self, user_id: str) -> List[Chat]:
        """
        Get all chats for a user

        Args:
            user_id: The ID of the user

        Returns:
            List[Chat]: List of chat objects
        """
        return self.db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.updated_at.desc()).all()

    def get_chat(self, chat_id: str) -> Optional[Chat]:
        """
        Get a specific chat by ID

        Args:
            chat_id: The ID of the chat

        Returns:
            Chat: The chat object if found, None otherwise
        """
        return self.db.query(Chat).filter(Chat.id == chat_id).first()

    def get_chat_messages(self, chat_id: str) -> List[Message]:
        """
        Get all messages for a chat

        Args:
            chat_id: The ID of the chat

        Returns:
            List[Message]: List of message objects
        """
        return self.db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()

    def update_chat_title(self, chat_id: str, title: str) -> Chat:
        """
        Update the title of a chat

        Args:
            chat_id: The ID of the chat
            title: The new title

        Returns:
            Chat: The updated chat object
        """
        chat = self.get_chat(chat_id)
        if chat:
            chat.title = title
            self.db.commit()
            self.db.refresh(chat)
        return chat

    def add_user_message(self, chat_id: str, message_text: str) -> Message:
        """
        Add a user message to a chat

        Args:
            chat_id: The ID of the chat
            message_text: The text of the message

        Returns:
            Message: The newly created message object
        """
        message = Message(
            chat_id=chat_id,
            is_from_user=True,
            message=message_text
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        # Update chat timestamp
        chat = self.get_chat(chat_id)
        chat.updated_at = message.created_at
        self.db.commit()

        # Set chat title if this is the first message
        messages = self.get_chat_messages(chat_id)
        if len(messages) == 1:  # This message is the first one
            title = message_text
            if len(title) > 50:
                title = title[:47] + "..."
            self.update_chat_title(chat_id, title)

        return message

    def add_vishva_response(self, chat_id: str, response_text: str) -> Message:
        """
        Add a Vishva AI response to a chat

        Args:
            chat_id: The ID of the chat
            response_text: The text of the response

        Returns:
            Message: The newly created message object
        """
        message = Message(
            chat_id=chat_id,
            is_from_user=False,
            message=response_text
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        # Update chat timestamp
        chat = self.get_chat(chat_id)
        chat.updated_at = message.created_at
        self.db.commit()

        return message

    def _format_chat_history(self, chat_id: str) -> List[tuple]:
        """
        Format chat history for ConversationalRetrievalChain

        Args:
            chat_id: The ID of the chat

        Returns:
            List[tuple]: List of (human_message, ai_message) tuples
        """
        messages = self.get_chat_messages(chat_id)
        chat_history = []

        # Format as list of tuples (human_message, ai_message)
        for i in range(0, len(messages) - 1, 2):
            if i + 1 < len(messages):
                if messages[i].is_from_user and not messages[i+1].is_from_user:
                    human_msg = messages[i].message
                    ai_msg = messages[i+1].message
                    chat_history.append((human_msg, ai_msg))

        return chat_history

    def generate_response(self, chat_id: str, message_text: str) -> str:
        """
        Generate a response from Vishva AI for a user message

        Args:
            chat_id: The ID of the chat
            message_text: The user's message text

        Returns:
            str: Vishva's response text
        """
        try:
            # Format chat history
            chat_history = self._format_chat_history(chat_id)

            # Create condense question prompt with fixed template - using {0} instead of \1
            condense_prompt_template = (
                "Given the following conversation and a follow up question, rephrase the "
                "follow up question to be a standalone question that captures all relevant "
                "context from the conversation.\n\n"
                "Chat History:\n{chat_history}\n"
                "Follow Up Question: {question}\n"
                "Standalone Question:"
            )

            condense_prompt = PromptTemplate.from_template(
                condense_prompt_template)

            # Create QA prompt
            qa_prompt_template = (
                f"{VISHVA_SYSTEM_PROMPT}\n\n"
                "Context information is below.\n"
                "---------------------\n"
                "{context}\n"
                "---------------------\n"
                "Given the context information and not prior knowledge, "
                "answer the question: {question}"
            )

            qa_prompt = PromptTemplate.from_template(qa_prompt_template)

            # Create ConversationalRetrievalChain
            retrieval_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vectorstore.as_retriever(),
                condense_question_prompt=condense_prompt,
                combine_docs_chain_kwargs={"prompt": qa_prompt},
                return_source_documents=False
            )

            # Generate response
            result = retrieval_chain.invoke({
                "question": message_text,
                "chat_history": chat_history
            })

            response = result["answer"]

            # Generate product suggestion if applicable
            product_suggestion = self._get_product_suggestion(message_text)
            if product_suggestion:
                response += f"\n\n{product_suggestion}"

            return response

        except Exception as e:
            print(f"Error generating response: {e}")
            return "I apologize, but I encountered an issue while processing your request. Please try again."

    def _get_product_suggestion(self, message_text: str) -> Optional[str]:
        """
        Analyze message to identify user interest and suggest relevant products

        Args:
            message_text: The user's message text

        Returns:
            Optional[str]: Product suggestion text if relevant, None otherwise
        """
        # Get all categories
        categories = self.db.query(Category).all()

        # Check if message contains category keywords
        matching_category = None
        for category in categories:
            # Check both category title and description for keywords
            keywords = [category.title.lower()]
            if category.description:
                keywords.extend(category.description.lower().split())

            if any(keyword.lower() in message_text.lower() for keyword in keywords if len(keyword) > 3):
                matching_category = category
                break

        # If category match found, suggest products
        if matching_category:
            # Get 3 products from the category
            products = self.db.query(Product).filter(
                Product.category_id == matching_category.id
            ).limit(3).all()

            if products:
                suggestion = f"Based on your interest in {matching_category.title}, you might like these products:\n\n"
                for product in products:
                    suggestion += f"- {product.title}: {product.description[:100]}... (${product.base_price:.2f})\n"
                suggestion += f"\nWould you like to explore more {matching_category.title} items?"
                return suggestion

        return None
