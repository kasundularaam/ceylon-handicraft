from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Import from config module
from app.database import init_db
from app.middleware.auth_middleware import auth_middleware

# Import routers - these should come after the config import
from app.routes.web import router as web_router
from app.routes.ws import router as ws_router
from app.routes.api.landing_api import router as landing_api_router
from app.routes.api.auth_api import router as auth_api_router
from app.routes.api.category_api import router as category_api_router
from app.routes.api.product_api import router as product_api_router
from app.routes.api.craftsman_api import router as craftsman_api_router
from app.routes.api.vishva_api import router as vishva_api_router
from app.routes.api.product_detail import router as product_detail_router
from app.routes.api.auction_product import router as auction_product_router

# Define lifespan context manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create vishva_library directory if it doesn't exist
    vishva_library_path = Path("vishva_library")
    vishva_library_path.mkdir(exist_ok=True)

    # Initialize database
    init_db()
    yield

# Create FastAPI app
app = FastAPI(
    title="Ceylon Handicrafts",
    version="1.0.0",
    lifespan=lifespan
)

# Configure static files
app.mount("/static", StaticFiles(directory=Path(__file__).parent /
          "public"), name="static")

# Add middleware
app.middleware("http")(auth_middleware)

# Include routers
app.include_router(web_router)
app.include_router(ws_router)
app.include_router(landing_api_router)
app.include_router(auth_api_router)
app.include_router(category_api_router)
app.include_router(product_api_router)
app.include_router(craftsman_api_router)
app.include_router(vishva_api_router)
app.include_router(product_detail_router)
app.include_router(auction_product_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
