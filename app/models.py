from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Boolean, Enum, Integer, Text, JSON
from sqlalchemy.orm import relationship
import enum
import uuid
from datetime import datetime

# Import Base from database instead of creating a new one
from app.database import Base


class UserRole(enum.Enum):
    CRAFTSMAN = "Craftsman"
    BUYER = "Buyer"
    ADMIN = "Admin"


class OrderStatus(enum.Enum):
    PENDING = "Pending"
    ACCEPTED = "Accepted"
    DENIED = "Denied"
    DEPARTED = "Departed"
    DELIVERED = "Delivered"
    DELIVER_FAILED = "DeliverFailed"


class ProductType(enum.Enum):
    SALE = "Sale"
    AUCTION = "Auction"


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    # Relationships
    address = relationship("UserAddress", back_populates="user", uselist=False)
    chats = relationship("Chat", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    products = relationship("Product", back_populates="craftsman")
    orders = relationship("OrderItem", back_populates="user")
    bids = relationship("Bid", back_populates="user")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    country = Column(String, nullable=False)
    state = Column(String, nullable=False)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    address_line = Column(String, nullable=False)

    # Relationships
    user = relationship("User", back_populates="address")


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    image = Column(String)
    icon = Column(String)
    description = Column(Text)

    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    type = Column(Enum(ProductType), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    base_price = Column(Float, nullable=False)
    weight = Column(Float)
    length = Column(Float)
    width = Column(Float)
    height = Column(Float)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(),
                        onupdate=datetime.now())

    # Relationships
    craftsman = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    bids = relationship("Bid", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    attachments = relationship("Attachment", back_populates="product")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(),
                        onupdate=datetime.now())

    # Relationships
    user = relationship("User", back_populates="chats")
    messages = relationship("Message", back_populates="chat")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    chat_id = Column(String, ForeignKey("chats.id"), nullable=False)
    is_from_user = Column(Boolean, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.now())

    # Relationships
    chat = relationship("Chat", back_populates="messages")
    attachments = relationship("Attachment", back_populates="message")


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String, primary_key=True, default=generate_uuid)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    message_id = Column(String, ForeignKey("messages.id"), nullable=True)

    # Relationships
    product = relationship("Product", back_populates="attachments")
    message = relationship("Message", back_populates="attachments")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(),
                        onupdate=datetime.now())

    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), nullable=False,
                    default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(),
                        onupdate=datetime.now())

    # Relationships
    user = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="order_items")
    ratings = relationship("Rating", back_populates="order_item")

    # Get the craftsman through the product
    @property
    def craftsman(self):
        return self.product.craftsman if self.product else None


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(String, primary_key=True, default=generate_uuid)
    order_item_id = Column(String, ForeignKey(
        "order_items.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    description = Column(Text)
    images = Column(JSON)  # Store as a JSON array of image URLs

    # Relationships
    order_item = relationship("OrderItem", back_populates="ratings")
    # Get the user through the order_item

    @property
    def user(self):
        return self.order_item.user if self.order_item else None


class Bid(Base):
    __tablename__ = "bids"

    id = Column(String, primary_key=True, default=generate_uuid)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    bid_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.now())

    # Relationships
    user = relationship("User", back_populates="bids")
    product = relationship("Product", back_populates="bids")
