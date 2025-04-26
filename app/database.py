from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Database configuration
DATABASE_URL = "sqlite:///./ceylon_handicrafts.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database dependency function


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database and create admin if not exists


def init_db():
    # Import models here to avoid circular imports
    from app.models import User, UserRole

    Base.metadata.create_all(bind=engine)

    # Create admin user if not exists
    add_admin_if_not_exists()


def add_admin_if_not_exists():
    from app.models import User, UserRole

    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == "admin@ch.com").first()

        if not admin:
            # Create admin user
            hashed_password = pwd_context.hash("123456")
            admin = User(
                name="SUPA ADMIN 👑",
                phone="0000000000",
                email="admin@ch.com",
                password=hashed_password,
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            print("Admin user created successfully")
    except Exception as e:
        print(f"Error creating admin user: {e}")
    finally:
        db.close()
